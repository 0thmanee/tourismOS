import { getMyOrganizationSettings } from "~/app/api/organization-settings/actions";
import { OperatorSettingsForm } from "~/features/producer/components/settings/operator-settings-form";

export default async function SettingsPage() {
  const initial = await getMyOrganizationSettings();

  return <OperatorSettingsForm initial={initial} />;
}
