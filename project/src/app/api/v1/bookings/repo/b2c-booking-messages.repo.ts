import { bookingMessageSelect } from "~/app/api/bookings/repo/bookings.repo";
import type { BookingMessageRow } from "~/app/api/bookings/schemas/bookings.schema";
import { prisma } from "~/lib/db";

import { getTripForTravelerRepo } from "./b2c-trips.repo";

export async function listBookingMessagesForCustomer(
	bookingId: string,
	userId: string,
	phone?: string | null,
): Promise<BookingMessageRow[] | null> {
	const access = await getTripForTravelerRepo(bookingId, userId, phone);
	if (!access) return null;

	const rows = await prisma.bookingMessage.findMany({
		where: { bookingId },
		orderBy: { createdAt: "asc" },
		select: bookingMessageSelect,
	});
	return rows as BookingMessageRow[];
}

export async function appendCustomerBookingMessageForB2c(
	bookingId: string,
	userId: string,
	phone: string | null | undefined,
	body: string,
): Promise<BookingMessageRow | null> {
	const access = await getTripForTravelerRepo(bookingId, userId, phone);
	if (!access) return null;

	const msg = await prisma.bookingMessage.create({
		data: {
			bookingId,
			sender: "CUSTOMER",
			type: "TEXT",
			body,
		},
		select: bookingMessageSelect,
	});
	return msg as BookingMessageRow;
}
