import { prisma } from "~/lib/db";
import type { OrganizationSettingsRow } from "../schemas/organization-settings.schema";

function parseJsonArray<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value)) return value as T;
  return fallback;
}

export async function getOrganizationSettingsRepo(organizationId: string): Promise<OrganizationSettingsRow> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, settings: true },
  });
  if (!org) {
    throw new Error("Organization not found");
  }

  const s = org.settings;
  const activities = parseJsonArray<string[]>(s?.activities, []);
  const pricingPresets = parseJsonArray<{ label: string; priceMad: number }[]>(s?.pricingPresets, []);

  return {
    organizationId: org.id,
    businessName: s?.businessName ?? null,
    activities,
    pricingPresets,
  };
}

export async function upsertOrganizationSettingsRepo(data: {
  organizationId: string;
  businessName: string | null;
  activities: string[];
  pricingPresets: { label: string; priceMad: number }[];
}) {
  return prisma.organizationSettings.upsert({
    where: { organizationId: data.organizationId },
    create: {
      organizationId: data.organizationId,
      businessName: data.businessName,
      activities: data.activities,
      pricingPresets: data.pricingPresets,
    },
    update: {
      businessName: data.businessName,
      activities: data.activities,
      pricingPresets: data.pricingPresets,
    },
    select: {
      organizationId: true,
      businessName: true,
      activities: true,
      pricingPresets: true,
    },
  });
}
