"use server";

import type {
	Prisma,
	ActivityKind as PrismaActivityKind,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "~/app/api/auth/actions";
import { prisma } from "~/lib/db";
import {
	getActivityForOrgRepo,
	sumPeopleFixedSlotRepo,
	sumResourceUnitsRepo,
} from "../activities/repo/activities.repo";
import {
	computeMultiDayEndAt,
	dayBoundsUTC,
	initialStatusForActivityKind,
} from "./booking-rules";
import {
	createBookingRepo,
	getMyBookingDetailRepo,
	listMyBookingsFilteredRepo,
	listMyBookingsForInboxRepo,
	listMyBookingsInRangeRepo,
	markDepositRepo,
	markPaidRepo,
	sendBookingMessageRepo,
	setBookingStatusRepo,
	updateBookingRepo,
} from "./repo/bookings.repo";
import {
	type BookingDetailRow,
	type BookingInboxRow,
	type BookingMessageRow,
	type BookingStatus,
	type BookingsFilterInput,
	bookingsFilterSchema,
	type CalendarRangeInput,
	type CreateBookingInput,
	calendarRangeSchema,
	createBookingSchema,
	type MarkDepositInput,
	type MarkPaidInput,
	markDepositSchema,
	markPaidSchema,
	type SendBookingMessageInput,
	sendBookingMessageSchema,
	type UpdateBookingInput,
	type UpdateBookingStatusInput,
	updateBookingSchema,
	updateBookingStatusSchema,
} from "./schemas/bookings.schema";

async function requireProducerOrganizationId(
	redirectTo: string,
): Promise<string> {
	const session = await getSession();
	if (!session?.user?.id) {
		redirect("/auth/login?callbackUrl=" + encodeURIComponent(redirectTo));
	}
	const member = await prisma.member.findFirst({
		where: {
			userId: session.user.id,
			user: { status: "enabled" },
			role: { in: ["owner", "admin", "member"] },
		},
		select: { organizationId: true },
	});
	if (!member) redirect("/producer");
	return member.organizationId;
}

export async function listMyBookingsForInbox(): Promise<BookingInboxRow[]> {
	const organizationId = await requireProducerOrganizationId("/producer/inbox");
	return listMyBookingsForInboxRepo(organizationId);
}

export async function listMyBookingsFiltered(
	filters: BookingsFilterInput,
): Promise<BookingInboxRow[]> {
	const organizationId =
		await requireProducerOrganizationId("/producer/bookings");
	const parsed = bookingsFilterSchema.parse(filters);
	return listMyBookingsFilteredRepo(organizationId, {
		dateFrom: parsed.dateFrom ? new Date(parsed.dateFrom) : undefined,
		dateTo: parsed.dateTo ? new Date(parsed.dateTo) : undefined,
		status: parsed.status,
		activityContains: parsed.activityContains,
		search: parsed.search,
	});
}

export async function listMyBookingsForCalendar(
	range: CalendarRangeInput,
): Promise<BookingInboxRow[]> {
	const organizationId =
		await requireProducerOrganizationId("/producer/calendar");
	const parsed = calendarRangeSchema.parse(range);
	const start = new Date(parsed.rangeStartISO);
	const end = new Date(parsed.rangeEndISO);
	return listMyBookingsInRangeRepo(organizationId, start, end);
}

export async function updateBooking(
	input: UpdateBookingInput,
): Promise<BookingDetailRow | null> {
	const organizationId =
		await requireProducerOrganizationId("/producer/bookings");
	const parsed = updateBookingSchema.parse(input);
	const priceCents =
		parsed.priceMad !== undefined
			? Math.round(parsed.priceMad * 100)
			: undefined;
	const result = await updateBookingRepo({
		organizationId,
		bookingId: parsed.bookingId,
		activityTitle: parsed.activityTitle,
		startAt: parsed.startAtISO ? new Date(parsed.startAtISO) : undefined,
		peopleCount: parsed.peopleCount,
		priceCents,
	});
	if (result) {
		revalidatePath("/producer/bookings");
		revalidatePath(`/producer/bookings/${parsed.bookingId}`);
		revalidatePath("/producer/inbox");
		revalidatePath("/producer/calendar");
	}
	return result;
}

export async function markBookingPaid(
	input: MarkPaidInput,
): Promise<BookingInboxRow | null> {
	const organizationId =
		await requireProducerOrganizationId("/producer/payments");
	const parsed = markPaidSchema.parse(input);
	const row = await markPaidRepo({
		bookingId: parsed.bookingId,
		organizationId,
	});
	if (row) {
		revalidatePath("/producer/payments");
		revalidatePath("/producer/bookings");
		revalidatePath(`/producer/bookings/${parsed.bookingId}`);
		revalidatePath("/producer/inbox");
	}
	return row;
}

export async function getMyBookingDetail(
	bookingId: string,
): Promise<BookingDetailRow | null> {
	const organizationId = await requireProducerOrganizationId("/producer/inbox");
	if (!bookingId) return null;
	return getMyBookingDetailRepo(bookingId, organizationId);
}

export async function createBooking(
	data: CreateBookingInput,
): Promise<BookingDetailRow> {
	const organizationId = await requireProducerOrganizationId("/producer/inbox");
	const parsed = createBookingSchema.parse(data);
	const startAt = new Date(parsed.startAtISO);
	let priceMad = parsed.priceMad;
	const meta = parsed.meta ?? {};

	let activityTitle = parsed.activityTitle?.trim() ?? "";
	const activityId: string | null = parsed.activityId?.trim() ?? null;
	let activityKind: PrismaActivityKind | null = null;
	let endAt: Date | null = parsed.endAtISO ? new Date(parsed.endAtISO) : null;
	let mergedMeta: Record<string, unknown> = { ...meta };

	if (activityId) {
		const activity = await getActivityForOrgRepo(organizationId, activityId);
		if (!activity) {
			throw new Error("Activity not found");
		}
		activityKind = activity.kind;
		activityTitle = activity.name;

		if (activity.defaultPriceMad != null && priceMad === 0) {
			priceMad = activity.defaultPriceMad;
		}

		const slots = Array.isArray(activity.fixedSlots)
			? (activity.fixedSlots as string[])
			: [];

		if (activity.kind === "FIXED_SLOT") {
			const slotTime = meta.slotTime;
			if (!slotTime || !slots.includes(slotTime)) {
				throw new Error("Pick a valid time slot for this activity");
			}
			const [h, m] = slotTime.split(":").map(Number);
			startAt.setHours(h ?? 0, m ?? 0, 0, 0);
			mergedMeta = { ...mergedMeta, slotTime };

			const cap = activity.capacity;
			if (cap != null) {
				const { dayStart, dayEnd } = dayBoundsUTC(startAt);
				const booked = await sumPeopleFixedSlotRepo({
					organizationId,
					activityId,
					dayStart,
					dayEnd,
					slotTime,
				});
				if (booked + parsed.peopleCount > cap) {
					throw new Error(
						"This slot is full — choose another time or reduce group size",
					);
				}
			}
		}

		if (activity.kind === "RESOURCE_BASED") {
			const units = meta.resourceUnits ?? parsed.peopleCount;
			mergedMeta = { ...mergedMeta, resourceUnits: units };
			const cap = activity.resourceCapacity;
			if (cap != null) {
				const booked = await sumResourceUnitsRepo({
					organizationId,
					activityId,
					startAt,
				});
				if (booked + units > cap) {
					throw new Error("Not enough equipment available at this time");
				}
			}
		}

		if (activity.kind === "MULTI_DAY") {
			const durationDays =
				meta.durationDays ??
				activity.defaultDurationDays ??
				(Array.isArray(activity.durationOptions) &&
				(activity.durationOptions as number[]).length
					? (activity.durationOptions as number[])[0]!
					: 1);
			mergedMeta = { ...mergedMeta, durationDays };
			endAt = computeMultiDayEndAt(startAt, durationDays);
		}

		if (activity.kind === "FLEXIBLE") {
			endAt = null;
		}
	} else {
		if (!activityTitle) {
			throw new Error("Activity title is required");
		}
	}

	const priceCents = Math.round(priceMad * 100);
	const status: BookingStatus = activityKind
		? initialStatusForActivityKind(
				activityKind as import("~/app/api/activities/schemas/activity.schema").ActivityKind,
			)
		: "NEW";

	return createBookingRepo({
		organizationId,
		customerName: parsed.customerName,
		customerPhone: parsed.customerPhone,
		activityTitle,
		activityId,
		activityKind,
		startAt,
		endAt,
		meta: Object.keys(mergedMeta).length
			? (mergedMeta as Prisma.InputJsonValue)
			: null,
		peopleCount: parsed.peopleCount,
		priceCents,
		initialNote: parsed.initialNote ?? null,
		status,
	});
}

export async function confirmBooking(
	input: UpdateBookingStatusInput,
): Promise<BookingInboxRow | null> {
	const organizationId = await requireProducerOrganizationId("/producer/inbox");
	const parsed = updateBookingStatusSchema.parse(input);
	const status = parsed.status as BookingStatus;

	return setBookingStatusRepo({
		bookingId: parsed.bookingId,
		organizationId,
		status,
	});
}

export async function cancelBooking(
	input: UpdateBookingStatusInput,
): Promise<BookingInboxRow | null> {
	const organizationId = await requireProducerOrganizationId("/producer/inbox");
	const parsed = updateBookingStatusSchema.parse(input);

	return setBookingStatusRepo({
		bookingId: parsed.bookingId,
		organizationId,
		status: parsed.status,
	});
}

export async function markDeposit(
	input: MarkDepositInput,
): Promise<BookingInboxRow | null> {
	const organizationId = await requireProducerOrganizationId("/producer/inbox");
	const parsed = markDepositSchema.parse(input);

	return markDepositRepo({
		bookingId: parsed.bookingId,
		organizationId,
		depositCents: Math.round(parsed.depositMad * 100),
	});
}

export async function sendBookingMessage(
	input: SendBookingMessageInput,
): Promise<BookingMessageRow | null> {
	const organizationId = await requireProducerOrganizationId("/producer/inbox");
	const parsed = sendBookingMessageSchema.parse(input);
	return sendBookingMessageRepo({
		bookingId: parsed.bookingId,
		organizationId,
		body: parsed.body.trim(),
	});
}
