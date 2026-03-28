import { bookingMessageSelect } from "~/app/api/bookings/repo/bookings.repo";
import type { BookingMessageRow } from "~/app/api/bookings/schemas/bookings.schema";
import { prisma } from "~/lib/db";

import { getTripForPhoneRepo } from "./b2c-trips.repo";

export async function listBookingMessagesForCustomer(
	bookingId: string,
	phone: string,
): Promise<BookingMessageRow[] | null> {
	const access = await getTripForPhoneRepo(bookingId, phone);
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
	phone: string,
	body: string,
): Promise<BookingMessageRow | null> {
	const access = await getTripForPhoneRepo(bookingId, phone);
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
