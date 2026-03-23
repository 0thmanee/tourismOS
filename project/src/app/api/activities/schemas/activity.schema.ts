import { z } from "zod";

export const activityKindSchema = z.enum([
	"FIXED_SLOT",
	"FLEXIBLE",
	"MULTI_DAY",
	"RESOURCE_BASED",
]);
export type ActivityKind = z.infer<typeof activityKindSchema>;

export const pricingKindSchema = z.enum(["PER_PERSON", "PER_GROUP"]);
export type PricingKind = z.infer<typeof pricingKindSchema>;

export const createActivitySchema = z.object({
	name: z.string().min(1).max(200),
	kind: activityKindSchema,
	pricingKind: pricingKindSchema.default("PER_PERSON"),
	capacity: z.coerce.number().int().min(1).max(5000).optional().nullable(),
	resourceCapacity: z.coerce
		.number()
		.int()
		.min(1)
		.max(5000)
		.optional()
		.nullable(),
	fixedSlots: z
		.array(z.string().regex(/^\d{2}:\d{2}$/))
		.max(24)
		.default([]),
	durationOptions: z
		.array(z.coerce.number().int().min(1).max(30))
		.max(10)
		.default([1, 2, 3]),
	defaultDurationDays: z.coerce.number().int().min(1).max(30).default(1),
	requiresGuide: z.boolean().default(false),
	requiresTransport: z.boolean().default(false),
	requiresEquipment: z.boolean().default(false),
	defaultPriceMad: z.coerce.number().min(0).optional().nullable(),
	sortOrder: z.coerce.number().int().default(0),
});

export const updateActivitySchema = createActivitySchema.merge(
	z.object({
		id: z.string().min(1),
		isActive: z.boolean().optional(),
	}),
);

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

export type ActivityRow = {
	id: string;
	organizationId: string;
	name: string;
	kind: ActivityKind;
	pricingKind: PricingKind;
	capacity: number | null;
	resourceCapacity: number | null;
	fixedSlots: string[];
	durationOptions: number[];
	defaultDurationDays: number;
	requiresGuide: boolean;
	requiresTransport: boolean;
	requiresEquipment: boolean;
	defaultPriceMad: number | null;
	isActive: boolean;
	sortOrder: number;
	createdAt: Date;
	updatedAt: Date;
};
