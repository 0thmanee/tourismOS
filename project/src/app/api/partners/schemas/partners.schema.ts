import { z } from "zod";

export const paginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(10),
	organizationId: z.string().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const updatePartnerSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email"),
	status: z.enum(["enabled", "disabled"]),
});

export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;

// —— Row / API response types (single source of truth) ——

/** Partner (user) row as returned by listPartnersPaginatedRepo / admin users list. */
export type PartnerRow = {
	id: string;
	name: string;
	email: string;
	status: string;
	profileCompleted: boolean;
	createdAt: Date;
	profile: { entityName: string } | null;
};
