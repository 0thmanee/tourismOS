"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "~/app/api/auth/actions";
import { prisma } from "~/lib/db";
import { updateOrganizationSettingsSchema } from "./schemas/organization-settings.schema";
import {
  getOrganizationSettingsRepo,
  upsertOrganizationSettingsRepo,
} from "./repo/organization-settings.repo";
import type { OrganizationSettingsRow } from "./schemas/organization-settings.schema";

async function requireProducerOrganizationId(redirectTo: string): Promise<string> {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=" + encodeURIComponent(redirectTo));
  }
  const member = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      user: { status: "enabled" },
      role: { in: ["owner", "admin", "member"] },
    },
    select: { organizationId: true },
  });
  if (!member) redirect("/producer");
  return member.organizationId;
}

export async function getMyOrganizationSettings(): Promise<OrganizationSettingsRow> {
  const organizationId = await requireProducerOrganizationId("/producer/settings");
  return getOrganizationSettingsRepo(organizationId);
}

export async function updateMyOrganizationSettings(input: unknown): Promise<OrganizationSettingsRow> {
  const organizationId = await requireProducerOrganizationId("/producer/settings");
  const parsed = updateOrganizationSettingsSchema.parse(input);

  await upsertOrganizationSettingsRepo({
    organizationId,
    businessName: parsed.businessName ?? null,
    activities: parsed.activities,
    pricingPresets: parsed.pricingPresets.map((p) => ({
      label: p.label.trim(),
      priceMad: p.priceMad,
    })),
  });

  revalidatePath("/producer/settings");
  return getOrganizationSettingsRepo(organizationId);
}
