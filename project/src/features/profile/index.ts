export {
  ONBOARDING_STEPS,
  MOROCCAN_REGIONS,
  PRODUCT_CATEGORIES,
  ENTITY_TYPES,
  EXPORT_EXPERIENCE_OPTIONS,
  INITIAL_ONBOARDING_FORM,
} from "./config";
export type { OnboardingFormData } from "./config";
export { onboardingSchema } from "~/app/api/profile/schemas/profile.schema";
export type { OnboardingInput } from "~/app/api/profile/schemas/profile.schema";
export {
  getProfile,
  upsertProfile,
  completeProfile,
  completeOnboardingAndGetRedirect,
  getRedirectPathAfterAuth,
} from "~/app/api/profile/actions";
