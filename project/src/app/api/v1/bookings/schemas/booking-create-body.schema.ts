import { z } from "zod";

/** JSON body for `POST /api/v1/bookings` — mirrors `BookingCreateRequest`. */
export const bookingCreateBodySchema = z.object({
	experienceId: z.string().min(1),
	priceMad: z.coerce.number().min(0),
	customer: z.object({
		name: z.string().min(1).max(120),
		phone: z.string().min(3).max(30),
		email: z.string().email().max(200).optional().nullable(),
	}),
	booking: z.object({
		startAtISO: z.string().datetime(),
		peopleCount: z.coerce.number().int().min(1),
		meta: z
			.object({
				slotTime: z.string().optional().nullable(),
				resourceUnits: z.coerce.number().int().min(1).optional().nullable(),
				durationDays: z.coerce
					.number()
					.int()
					.min(1)
					.max(90)
					.optional()
					.nullable(),
				notes: z.string().max(2000).optional().nullable(),
			})
			.optional(),
	}),
	paymentIntent: z.object({
		mode: z.enum(["PAY_LATER", "PAY_DEPOSIT", "PAY_FULL"]),
	}),
});

export type BookingCreateBody = z.infer<typeof bookingCreateBodySchema>;
