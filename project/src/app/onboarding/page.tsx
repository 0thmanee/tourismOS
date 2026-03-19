import { getProfile } from "~/app/api/profile/actions";
import { OnboardingForm } from "~/features/profile/components/onboarding-form";

export default async function OnboardingPage() {
  const profile = await getProfile();
  const initialData = profile
    ? {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        entityType: profile.entityType,
        entityName: profile.entityName,
        registrationNumber: profile.registrationNumber ?? "",
        region: profile.region,
        city: profile.city,
        yearEstablished: profile.yearEstablished ?? "",
        website: profile.website ?? "",
        categories: (profile.categories as string[]) ?? [],
        annualCapacity: profile.annualCapacity ?? "",
        exportExperience: profile.exportExperience ?? "",
        agreeTerms: profile.agreeTerms,
        agreeMarketing: profile.agreeMarketing,
      }
    : undefined;
  return <OnboardingForm initialData={initialData} />;
}
