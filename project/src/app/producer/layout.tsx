import { requireSession } from "~/app/api/auth/actions";
import { getProfile } from "~/app/api/profile/actions";
import { ProducerLayoutClient } from "~/features/producer/components/producer-layout-client";

export default async function ProducerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const profile = await getProfile();

  const user = {
    name: session.user.name ?? "",
    email: session.user.email ?? "",
  };

  const layoutProfile = profile
    ? {
        firstName: profile.firstName,
        lastName: profile.lastName,
        entityName: profile.entityName,
        profileImage: profile.profileImage ?? null,
      }
    : null;

  return (
    <ProducerLayoutClient user={user} profile={layoutProfile}>
      {children}
    </ProducerLayoutClient>
  );
}
``