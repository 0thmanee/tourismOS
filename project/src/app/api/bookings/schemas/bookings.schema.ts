import type { Prisma } from "@prisma/client";
import { z } from "zod";

export const bookingMetaSchema = z
	.object({
		slotTime: z.string().optional(),
		resourceUnits: z.coerce.number().int().min(1).optional(),
		durationDays: z.coerce.number().int().min(1).max(90).optional(),
	})
	.strict();

export type BookingMetaInput = z.infer<typeof bookingMetaSchema>;

export const bookingStatusSchema = z.enum([
	"NEW",
	"PENDING",
	"CONFIRMED",
	"CANCELLED",
]);
export type BookingStatus = z.infer<typeof bookingStatusSchema>;

export const paymentStatusSchema = z.enum(["UNPAID", "DEPOSIT", "PAID"]);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const createBookingSchema = z
	.object({
		customerName: z.string().min(1, "Customer name is required").max(120),
		customerPhone: z.string().min(3, "Phone is required").max(30),
		/** Catalog activity — when set, title/behavior come from Activity */
		activityId: z.string().min(1).optional(),
		/** Legacy / quick: free-text title when activityId omitted */
		activityTitle: z.string().max(200).optional(),
		startAtISO: z.string().datetime(),
		endAtISO: z.string().datetime().optional(),
		peopleCount: z.coerce.number().int().min(1, "People count must be >= 1"),
		priceMad: z.coerce.number().min(0, "Price must be >= 0"),
		initialNote: z.string().max(2000).optional().nullable(),
		meta: bookingMetaSchema.optional(),
	})
	.superRefine((data, ctx) => {
		const hasCatalog = Boolean(data.activityId?.trim());
		const title = data.activityTitle?.trim();
		if (!hasCatalog && !title) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Select an activity or enter a title",
				path: ["activityTitle"],
			});
		}
	});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateBookingStatusSchema = z.object({
	bookingId: z.string().min(1, "Booking ID is required"),
	status: bookingStatusSchema,
});
export type UpdateBookingStatusInput = z.infer<
	typeof updateBookingStatusSchema
>;

export const markDepositSchema = z.object({
	bookingId: z.string().min(1, "Booking ID is required"),
	depositMad: z.coerce.number().min(0, "Deposit must be >= 0"),
});
export type MarkDepositInput = z.infer<typeof markDepositSchema>;

export const bookingMessageSenderSchema = z.enum(["CUSTOMER", "OPERATOR"]);
export type BookingMessageSender = z.infer<typeof bookingMessageSenderSchema>;

export const sendBookingMessageSchema = z.object({
	bookingId: z.string().min(1, "Booking ID is required"),
	body: z.string().min(1, "Message is required").max(2000, "Message too long"),
});
export type SendBookingMessageInput = z.infer<typeof sendBookingMessageSchema>;

export const updateBookingSchema = z.object({
	bookingId: z.string().min(1),
	activityTitle: z.string().min(1).max(200).optional(),
	startAtISO: z.string().datetime().optional(),
	peopleCount: z.coerce.number().int().min(1).optional(),
	priceMad: z.coerce.number().min(0).optional(),
});
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;

export const markPaidSchema = z.object({
	bookingId: z.string().min(1, "Booking ID is required"),
});
export type MarkPaidInput = z.infer<typeof markPaidSchema>;

export const bookingsFilterSchema = z.object({
	dateFrom: z.string().datetime().optional(),
	dateTo: z.string().datetime().optional(),
	status: bookingStatusSchema.optional(),
	activityContains: z.string().max(200).optional(),
	/** Matches activity title, customer name, or phone (MVP search) */
	search: z.string().max(200).optional(),
});
export type BookingsFilterInput = z.infer<typeof bookingsFilterSchema>;

export const calendarRangeSchema = z.object({
	rangeStartISO: z.string().datetime(),
	rangeEndISO: z.string().datetime(),
});
export type CalendarRangeInput = z.infer<typeof calendarRangeSchema>;

export type ActivityKindCode =
	| "FIXED_SLOT"
	| "FLEXIBLE"
	| "MULTI_DAY"
	| "RESOURCE_BASED";

export type BookingInboxRow = {
	id: string;
	status: BookingStatus;
	paymentStatus: PaymentStatus;

	customerName: string;
	customerPhone: string;

	activityId: string | null;
	activityKind: ActivityKindCode | null;
	activityTitle: string;
	startAt: Date;
	endAt: Date | null;
	meta: Prisma.JsonValue | null;

	peopleCount: number;
	priceCents: number;

	createdAt: Date;
	updatedAt: Date;
};

export type BookingMessageRow = {
	id: string;
	sender: BookingMessageSender;
	body: string;
	createdAt: Date;
};

export type BookingDetailRow = BookingInboxRow & {
	depositCents: number | null;
	messages: BookingMessageRow[];
	assignments: {
		id: string;
		staffMemberId: string;
		assignmentRole: string | null;
		notes: string | null;
		createdAt: Date;
		staffMember: {
			id: string;
			name: string;
			role: string;
			phone: string | null;
			isActive: boolean;
		};
	}[];
};
