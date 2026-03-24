import { z } from "zod";

export const listTripsQuerySchema = z.object({
	phone: z.string().min(3).max(30),
	status: z
		.enum(["all", "upcoming", "pending", "past"])
		.optional()
		.default("all"),
});

export type ListTripsQuery = z.infer<typeof listTripsQuerySchema>;
