import { z } from "zod";

export const onboardingSchema = z
	.object({
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().min(1, "Last name is required"),
		phone: z.string().min(1, "Phone is required"),
		entityType: z.string().min(1, "Entity type is required"),
		entityName: z.string().min(1, "Entity name is required"),
		registrationNumber: z.string().optional(),
		region: z.string().min(1, "Region is required"),
		city: z.string().min(1, "City is required"),
		yearEstablished: z.string().optional(),
		website: z.string().optional(),
		categories: z
			.array(z.string())
			.min(1, "Select at least one product category"),
		annualCapacity: z.string().optional(),
		exportExperience: z.string().optional(),
		agreeTerms: z.boolean(),
		agreeMarketing: z.boolean(),
	})
	.refine((data) => data.agreeTerms === true, {
		message: "You must agree to the terms",
		path: ["agreeTerms"],
	});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

// —— User display (layouts, profile view) ——

export type UserDisplay = {
	name: string;
	email: string;
	imageUrl?: string | null;
};

/** User for profile view (name + email only). */
export type ProfileViewUser = Pick<UserDisplay, "name" | "email">;

// —— Profile display (view / edit) ——

/** Full profile as shown on producer profile view. */
export type ProfileViewProfile = {
	firstName: string;
	lastName: string;
	phone: string;
	entityType: string;
	entityName: string;
	registrationNumber: string | null;
	region: string;
	city: string;
	yearEstablished: string | null;
	categories: string[];
	annualCapacity: string | null;
	profileImage?: string | null;
};

/** Profile as loaded for edit form (includes website, exportExperience, agreeTerms, agreeMarketing). */
export type ProfileEditProfile = ProfileViewProfile & {
	website: string | null;
	exportExperience: string | null;
	agreeTerms: boolean;
	agreeMarketing: boolean;
};

/** Minimal profile for layout sidebar (name, entity, image). */
export type LayoutProfile = {
	firstName: string;
	lastName: string;
	entityName: string;
	profileImage?: string | null;
} | null;
