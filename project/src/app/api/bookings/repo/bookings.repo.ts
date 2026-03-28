import type { Prisma } from "@prisma/client";
import { prisma } from "~/lib/db";
import type {
	BookingDetailRow,
	BookingInboxRow,
	BookingMessageRow,
	BookingMessageSender,
	BookingStatus,
	PaymentStatus,
} from "../schemas/bookings.schema";

function systemLineForNewBooking(status: BookingStatus): string {
	if (status === "CONFIRMED") return "Booking confirmed.";
	return "Booking received. The operator will review it.";
}

function systemLineForStatusTransition(
	from: BookingStatus,
	to: BookingStatus,
): string | null {
	if (from === to) return null;
	if (to === "CONFIRMED") return "Booking confirmed.";
	if (to === "CANCELLED") return "Booking cancelled.";
	return null;
}

const inboxSelect = {
	id: true,
	status: true,
	paymentStatus: true,
	activityId: true,
	activityKind: true,
	activityTitle: true,
	startAt: true,
	endAt: true,
	meta: true,
	peopleCount: true,
	priceCents: true,
	createdAt: true,
	updatedAt: true,
	customer: {
		select: { name: true, phone: true },
	},
} as const;

function mapInboxRow(r: {
	customer: { name: string; phone: string };
	status: string;
	paymentStatus: string;
	activityKind: string | null;
	meta: unknown;
	[key: string]: unknown;
}): BookingInboxRow {
	const { customer, ...rest } = r;
	return {
		...(rest as Omit<BookingInboxRow, "customerName" | "customerPhone">),
		activityKind: rest.activityKind as BookingInboxRow["activityKind"],
		meta: rest.meta ?? null,
		status: rest.status as BookingStatus,
		paymentStatus: rest.paymentStatus as PaymentStatus,
		customerName: customer.name,
		customerPhone: customer.phone,
	};
}

export async function listMyBookingsForInboxRepo(
	organizationId: string,
): Promise<BookingInboxRow[]> {
	const rows = await prisma.booking.findMany({
		where: { organizationId },
		orderBy: { startAt: "asc" },
		select: inboxSelect,
	});

	return rows.map((row) => mapInboxRow(row));
}

export const bookingMessageSelect = {
	id: true,
	sender: true,
	type: true,
	body: true,
	metadata: true,
	createdAt: true,
} as const;

export async function getMyBookingDetailRepo(
	bookingId: string,
	organizationId: string,
): Promise<BookingDetailRow | null> {
	const row = await prisma.booking.findFirst({
		where: { id: bookingId, organizationId },
		select: {
			...inboxSelect,
			depositCents: true,
			messages: {
				orderBy: { createdAt: "asc" },
				select: bookingMessageSelect,
			},
			assignments: {
				orderBy: { createdAt: "asc" },
				select: {
					id: true,
					staffMemberId: true,
					assignmentRole: true,
					notes: true,
					createdAt: true,
					staffMember: {
						select: {
							id: true,
							name: true,
							role: true,
							phone: true,
							isActive: true,
						},
					},
				},
			},
		},
	});

	if (!row) return null;

	const { customer, messages, assignments, ...rest } = row;
	return {
		...rest,
		activityKind: rest.activityKind as BookingInboxRow["activityKind"],
		meta: rest.meta ?? null,
		status: rest.status as BookingStatus,
		paymentStatus: rest.paymentStatus as PaymentStatus,
		customerName: customer.name,
		customerPhone: customer.phone,
		depositCents: row.depositCents,
		messages: messages as BookingMessageRow[],
		assignments,
	};
}

async function getOrCreateCustomerRepo(data: {
	organizationId: string;
	name: string;
	phone: string;
}): Promise<{ id: string }> {
	const existing = await prisma.customer.findFirst({
		where: { organizationId: data.organizationId, phone: data.phone },
		select: { id: true },
	});

	if (existing) return { id: existing.id };

	const created = await prisma.customer.create({
		data: {
			organizationId: data.organizationId,
			name: data.name,
			phone: data.phone,
		},
		select: { id: true },
	});
	return { id: created.id };
}

export async function createBookingRepo(data: {
	organizationId: string;
	customerName: string;
	customerPhone: string;
	activityTitle: string;
	activityId?: string | null;
	activityKind?: import("@prisma/client").ActivityKind | null;
	startAt: Date;
	endAt?: Date | null;
	meta?: Prisma.InputJsonValue | null;
	peopleCount: number;
	priceCents: number;
	initialNote?: string | null;
	status: BookingStatus;
}): Promise<BookingDetailRow> {
	return prisma.$transaction(async (tx) => {
		const customer = await getOrCreateCustomerRepo({
			organizationId: data.organizationId,
			name: data.customerName,
			phone: data.customerPhone,
		});

		const booking = await tx.booking.create({
			data: {
				organizationId: data.organizationId,
				customerId: customer.id,
				activityId: data.activityId ?? undefined,
				activityKind: data.activityKind ?? undefined,
				activityTitle: data.activityTitle,
				startAt: data.startAt,
				endAt: data.endAt ?? undefined,
				meta: data.meta ?? undefined,
				peopleCount: data.peopleCount,
				priceCents: data.priceCents,
				status: data.status,
				paymentStatus: "UNPAID",
				depositCents: null,
			},
			select: {
				...inboxSelect,
				depositCents: true,
			},
		});

		const messages: BookingMessageRow[] = [];

		const systemMsg = await tx.bookingMessage.create({
			data: {
				bookingId: booking.id,
				sender: "SYSTEM" as BookingMessageSender,
				type: "SYSTEM",
				body: systemLineForNewBooking(data.status),
			},
			select: bookingMessageSelect,
		});
		messages.push(systemMsg as BookingMessageRow);

		if (data.initialNote && data.initialNote.trim()) {
			const msg = await tx.bookingMessage.create({
				data: {
					bookingId: booking.id,
					sender: "OPERATOR" as BookingMessageSender,
					type: "TEXT",
					body: data.initialNote,
				},
				select: bookingMessageSelect,
			});
			messages.push(msg as BookingMessageRow);
		}

		const { customer: c, depositCents, ...rest } = booking;
		return {
			...rest,
			activityKind: rest.activityKind as BookingInboxRow["activityKind"],
			meta: rest.meta ?? null,
			customerName: c.name,
			customerPhone: c.phone,
			depositCents,
			messages,
			assignments: [],
		} as BookingDetailRow;
	});
}

export async function listMyBookingsFilteredRepo(
	organizationId: string,
	filters: {
		dateFrom?: Date;
		dateTo?: Date;
		status?: BookingStatus;
		activityContains?: string;
		search?: string;
	},
): Promise<BookingInboxRow[]> {
	const conditions: Prisma.BookingWhereInput[] = [{ organizationId }];

	if (filters.dateFrom || filters.dateTo) {
		conditions.push({
			startAt: {
				...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
				...(filters.dateTo ? { lte: filters.dateTo } : {}),
			},
		});
	}
	if (filters.status) {
		conditions.push({ status: filters.status });
	}
	if (filters.activityContains?.trim()) {
		conditions.push({
			activityTitle: {
				contains: filters.activityContains.trim(),
				mode: "insensitive",
			},
		});
	}
	if (filters.search?.trim()) {
		const q = filters.search.trim();
		conditions.push({
			OR: [
				{ activityTitle: { contains: q, mode: "insensitive" } },
				{ customer: { name: { contains: q, mode: "insensitive" } } },
				{ customer: { phone: { contains: q, mode: "insensitive" } } },
			],
		});
	}

	const where: Prisma.BookingWhereInput =
		conditions.length === 1 ? conditions[0]! : { AND: conditions };

	const rows = await prisma.booking.findMany({
		where,
		orderBy: { startAt: "asc" },
		select: inboxSelect,
	});

	return rows.map((row) => mapInboxRow(row));
}

export async function listMyBookingsInRangeRepo(
	organizationId: string,
	rangeStart: Date,
	rangeEnd: Date,
): Promise<BookingInboxRow[]> {
	const rows = await prisma.booking.findMany({
		where: {
			organizationId,
			OR: [
				{
					AND: [
						{ endAt: null },
						{ startAt: { gte: rangeStart, lt: rangeEnd } },
					],
				},
				{
					AND: [
						{ endAt: { not: null } },
						{ startAt: { lt: rangeEnd } },
						{ endAt: { gt: rangeStart } },
					],
				},
			],
		},
		orderBy: { startAt: "asc" },
		select: inboxSelect,
	});

	return rows.map((row) => mapInboxRow(row));
}

export async function updateBookingRepo(data: {
	organizationId: string;
	bookingId: string;
	activityTitle?: string;
	startAt?: Date;
	peopleCount?: number;
	priceCents?: number;
}): Promise<BookingDetailRow | null> {
	const existing = await prisma.booking.findFirst({
		where: { id: data.bookingId, organizationId: data.organizationId },
		select: { id: true },
	});
	if (!existing) return null;

	const updateData: {
		activityTitle?: string;
		startAt?: Date;
		peopleCount?: number;
		priceCents?: number;
	} = {};
	if (data.activityTitle !== undefined)
		updateData.activityTitle = data.activityTitle;
	if (data.startAt !== undefined) updateData.startAt = data.startAt;
	if (data.peopleCount !== undefined) updateData.peopleCount = data.peopleCount;
	if (data.priceCents !== undefined) updateData.priceCents = data.priceCents;

	const row = await prisma.booking.update({
		where: { id: data.bookingId },
		data: updateData,
		select: {
			...inboxSelect,
			depositCents: true,
			messages: {
				orderBy: { createdAt: "asc" },
				select: bookingMessageSelect,
			},
			assignments: {
				orderBy: { createdAt: "asc" },
				select: {
					id: true,
					staffMemberId: true,
					assignmentRole: true,
					notes: true,
					createdAt: true,
					staffMember: {
						select: {
							id: true,
							name: true,
							role: true,
							phone: true,
							isActive: true,
						},
					},
				},
			},
		},
	});

	const { customer, messages, assignments, ...rest } = row;
	return {
		...rest,
		status: rest.status as BookingStatus,
		paymentStatus: rest.paymentStatus as PaymentStatus,
		customerName: customer.name,
		customerPhone: customer.phone,
		depositCents: row.depositCents,
		messages: messages as BookingMessageRow[],
		assignments,
	};
}

export async function markPaidRepo(data: {
	bookingId: string;
	organizationId: string;
}): Promise<BookingInboxRow | null> {
	const booking = await prisma.booking.findFirst({
		where: { id: data.bookingId, organizationId: data.organizationId },
		select: { id: true },
	});
	if (!booking) return null;

	const updated = await prisma.booking.update({
		where: { id: data.bookingId },
		data: { paymentStatus: "PAID" },
		select: inboxSelect,
	});

	return {
		...updated,
		status: updated.status as BookingStatus,
		paymentStatus: updated.paymentStatus as PaymentStatus,
		customerName: updated.customer.name,
		customerPhone: updated.customer.phone,
	} as unknown as BookingInboxRow;
}

export async function setBookingStatusRepo(data: {
	bookingId: string;
	organizationId: string;
	status: BookingStatus;
}): Promise<BookingInboxRow | null> {
	return prisma.$transaction(async (tx) => {
		const existing = await tx.booking.findFirst({
			where: { id: data.bookingId, organizationId: data.organizationId },
			select: { id: true, status: true },
		});
		if (!existing) return null;

		const prevStatus = existing.status as BookingStatus;

		const updated = await tx.booking.update({
			where: { id: data.bookingId },
			data: { status: data.status },
			select: inboxSelect,
		});

		const line = systemLineForStatusTransition(prevStatus, data.status);
		if (line) {
			await tx.bookingMessage.create({
				data: {
					bookingId: data.bookingId,
					sender: "SYSTEM" as BookingMessageSender,
					type: "SYSTEM",
					body: line,
				},
			});
		}

		return {
			...updated,
			status: updated.status as BookingStatus,
			paymentStatus: updated.paymentStatus as PaymentStatus,
			customerName: updated.customer.name,
			customerPhone: updated.customer.phone,
		} as unknown as BookingInboxRow;
	});
}

export async function sendBookingMessageRepo(data: {
	bookingId: string;
	organizationId: string;
	body: string;
}): Promise<BookingMessageRow | null> {
	const booking = await prisma.booking.findFirst({
		where: { id: data.bookingId, organizationId: data.organizationId },
		select: { id: true },
	});
	if (!booking) return null;

	const msg = await prisma.bookingMessage.create({
		data: {
			bookingId: data.bookingId,
			sender: "OPERATOR" as BookingMessageSender,
			type: "TEXT",
			body: data.body,
		},
		select: bookingMessageSelect,
	});

	return msg as unknown as BookingMessageRow;
}

export async function markDepositRepo(data: {
	bookingId: string;
	organizationId: string;
	depositCents: number;
}): Promise<BookingInboxRow | null> {
	const booking = await prisma.booking.findFirst({
		where: { id: data.bookingId, organizationId: data.organizationId },
		select: { id: true },
	});
	if (!booking) return null;

	const updated = await prisma.booking.update({
		where: { id: data.bookingId },
		data: {
			paymentStatus: "DEPOSIT",
			depositCents: data.depositCents,
		},
		select: inboxSelect,
	});

	return {
		...updated,
		status: updated.status as BookingStatus,
		paymentStatus: updated.paymentStatus as PaymentStatus,
		customerName: updated.customer.name,
		customerPhone: updated.customer.phone,
	} as unknown as BookingInboxRow;
}
