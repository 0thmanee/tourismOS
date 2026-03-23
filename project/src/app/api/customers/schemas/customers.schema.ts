import { z } from "zod";

export const updateCustomerNotesSchema = z.object({
	customerId: z.string().min(1),
	notes: z.string().max(5000).nullable(),
});
export type UpdateCustomerNotesInput = z.infer<
	typeof updateCustomerNotesSchema
>;

export type CustomerListRow = {
	id: string;
	name: string;
	phone: string;
	bookingCount: number;
	totalPriceMad: number;
	lastBookingAt: Date | null;
};

export type CustomerBookingRow = {
	id: string;
	activityTitle: string;
	startAt: Date;
	status: string;
	priceCents: number;
};

export type CustomerDetailRow = {
	id: string;
	name: string;
	phone: string;
	notes: string | null;
	bookings: CustomerBookingRow[];
};
