import type {
	Prisma,
	ActivityKind as PrismaActivityKind,
} from "@prisma/client";
import {
	getActivityForOrgRepo,
	sumPeopleFixedSlotRepo,
	sumResourceUnitsRepo,
} from "~/app/api/activities/repo/activities.repo";
import type { ActivityKind } from "~/app/api/activities/schemas/activity.schema";
import {
	computeMultiDayEndAt,
	dayBoundsUTC,
	initialStatusForActivityKind,
} from "~/app/api/bookings/booking-rules";
import { createBookingRepo } from "~/app/api/bookings/repo/bookings.repo";
import type {
	BookingDetailRow,
	BookingStatus,
	CreateBookingInput,
} from "~/app/api/bookings/schemas/bookings.schema";

/**
 * Shared catalog booking path for producer UI and `POST /api/v1/bookings`.
 * Caller supplies tenant `organizationId` (session for producer, activity.owner for B2C).
 * `parsed` must already satisfy `createBookingSchema`.
 */
export async function createBookingForOrganization(
	organizationId: string,
	parsed: CreateBookingInput,
): Promise<BookingDetailRow> {
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
			const optList = Array.isArray(activity.durationOptions)
				? (activity.durationOptions as number[])
				: [];
			const firstOpt = optList.length > 0 ? optList[0] : undefined;
			const durationDays =
				meta.durationDays ?? activity.defaultDurationDays ?? firstOpt ?? 1;
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
		? initialStatusForActivityKind(activityKind as ActivityKind)
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
