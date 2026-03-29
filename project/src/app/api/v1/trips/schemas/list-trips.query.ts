import { z } from "zod";

export const listTripsQuerySchema = z.object({
	/** Legacy: match `customer.phone`. When omitted, lists bookings owned by the session user only. */
	phone: z.preprocess(
		(v) =>
			typeof v !== "string" || v.trim() === ""
				? undefined
				: v.trim(),
		z.string().min(3).max(30).optional(),
	),
	status: z
		.enum(["all", "upcoming", "pending", "past"])
		.optional()
		.default("all"),
});

export type ListTripsQuery = z.infer<typeof listTripsQuerySchema>;
