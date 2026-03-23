import { z } from "zod";

export const pricingPresetSchema = z.object({
	label: z.string().min(1).max(120),
	priceMad: z.coerce.number().min(0),
});

export const updateOrganizationSettingsSchema = z.object({
	businessName: z.string().max(200).nullable().optional(),
	activities: z.array(z.string().min(1).max(120)).max(50),
	pricingPresets: z.array(pricingPresetSchema).max(30),
});
export type UpdateOrganizationSettingsInput = z.infer<
	typeof updateOrganizationSettingsSchema
>;

export type OrganizationSettingsRow = {
	organizationId: string;
	businessName: string | null;
	activities: string[];
	pricingPresets: { label: string; priceMad: number }[];
};
