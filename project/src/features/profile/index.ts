export {
	completeOnboardingAndGetRedirect,
	completeProfile,
	getProfile,
	getRedirectPathAfterAuth,
	upsertProfile,
} from "~/app/api/profile/actions";
export type { OnboardingInput } from "~/app/api/profile/schemas/profile.schema";
export { onboardingSchema } from "~/app/api/profile/schemas/profile.schema";
export type { OnboardingFormData } from "./config";
export {
	ENTITY_TYPES,
	EXPORT_EXPERIENCE_OPTIONS,
	INITIAL_ONBOARDING_FORM,
	MOROCCAN_REGIONS,
	ONBOARDING_STEPS,
	PRODUCT_CATEGORIES,
} from "./config";
