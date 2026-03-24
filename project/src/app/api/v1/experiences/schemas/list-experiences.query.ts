import { z } from "zod";
import { activityKindSchema } from "~/app/api/activities/schemas/activity.schema";

const optionalNonEmptyString = z.preprocess(
	(val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
	z.string().max(100).optional(),
);

export const listExperiencesQuerySchema = z.object({
	city: optionalNonEmptyString,
	category: optionalNonEmptyString,
	kind: activityKindSchema.optional(),
	featured: z
		.union([z.literal("0"), z.literal("1")])
		.optional()
		.transform((v) => v === "1"),
	priceMin: z.coerce.number().min(0).optional(),
	priceMax: z.coerce.number().min(0).optional(),
	sort: z
		.enum(["recommended", "price_asc", "rating_desc"])
		.optional()
		.default("recommended"),
	page: z.coerce.number().int().min(1).optional().default(1),
	pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type ListExperiencesQuery = z.infer<typeof listExperiencesQuerySchema>;
