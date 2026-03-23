"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "~/app/api/auth/actions";
import { prisma } from "~/lib/db";
import {
	createActivityRepo,
	getActivityForOrgRepo,
	listActivitiesForOrgRepo,
	updateActivityRepo,
} from "./repo/activities.repo";
import type { ActivityRow } from "./schemas/activity.schema";
import {
	createActivitySchema,
	updateActivitySchema,
} from "./schemas/activity.schema";

async function requireProducerOrganizationId(
	redirectTo: string,
): Promise<string> {
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

function mapActivityRow(row: {
	id: string;
	organizationId: string;
	name: string;
	kind: string;
	pricingKind: string;
	capacity: number | null;
	resourceCapacity: number | null;
	fixedSlots: unknown;
	durationOptions: unknown;
	defaultDurationDays: number;
	requiresGuide: boolean;
	requiresTransport: boolean;
	requiresEquipment: boolean;
	defaultPriceMad: number | null;
	isActive: boolean;
	sortOrder: number;
	createdAt: Date;
	updatedAt: Date;
}): ActivityRow {
	return {
		...row,
		kind: row.kind as ActivityRow["kind"],
		pricingKind: row.pricingKind as ActivityRow["pricingKind"],
		fixedSlots: Array.isArray(row.fixedSlots)
			? (row.fixedSlots as string[])
			: [],
		durationOptions: Array.isArray(row.durationOptions)
			? (row.durationOptions as number[])
			: [1, 2, 3],
	};
}

export async function listMyActivities(
	includeInactive = false,
): Promise<ActivityRow[]> {
	const organizationId =
		await requireProducerOrganizationId("/producer/inbox");
	const rows = await listActivitiesForOrgRepo(organizationId, includeInactive);
	return rows.map(mapActivityRow);
}

export async function getMyActivity(
	activityId: string,
): Promise<ActivityRow | null> {
	const organizationId = await requireProducerOrganizationId("/producer/inbox");
	const row = await getActivityForOrgRepo(organizationId, activityId);
	return row ? mapActivityRow(row) : null;
}

export async function createActivity(input: unknown): Promise<ActivityRow> {
	const organizationId =
		await requireProducerOrganizationId("/producer/settings");
	const parsed = createActivitySchema.parse(input);
	const row = await createActivityRepo(organizationId, {
		name: parsed.name.trim(),
		kind: parsed.kind,
		pricingKind: parsed.pricingKind,
		capacity: parsed.capacity ?? null,
		resourceCapacity: parsed.resourceCapacity ?? null,
		fixedSlots: parsed.fixedSlots,
		durationOptions: parsed.durationOptions.length
			? parsed.durationOptions
			: [1, 2, 3],
		defaultDurationDays: parsed.defaultDurationDays,
		requiresGuide: parsed.requiresGuide,
		requiresTransport: parsed.requiresTransport,
		requiresEquipment: parsed.requiresEquipment,
		defaultPriceMad: parsed.defaultPriceMad ?? null,
		sortOrder: parsed.sortOrder,
	});
	revalidatePath("/producer/settings");
	revalidatePath("/producer/inbox");
	return mapActivityRow(row);
}

export async function updateActivity(
	input: unknown,
): Promise<ActivityRow | null> {
	const organizationId =
		await requireProducerOrganizationId("/producer/settings");
	const parsed = updateActivitySchema.parse(input);
	const row = await updateActivityRepo(organizationId, {
		id: parsed.id,
		name: parsed.name.trim(),
		kind: parsed.kind,
		pricingKind: parsed.pricingKind,
		capacity: parsed.capacity ?? null,
		resourceCapacity: parsed.resourceCapacity ?? null,
		fixedSlots: parsed.fixedSlots,
		durationOptions: parsed.durationOptions.length
			? parsed.durationOptions
			: [1, 2, 3],
		defaultDurationDays: parsed.defaultDurationDays,
		requiresGuide: parsed.requiresGuide,
		requiresTransport: parsed.requiresTransport,
		requiresEquipment: parsed.requiresEquipment,
		defaultPriceMad: parsed.defaultPriceMad ?? null,
		sortOrder: parsed.sortOrder,
		isActive: parsed.isActive,
	});
	revalidatePath("/producer/settings");
	revalidatePath("/producer/inbox");
	return row ? mapActivityRow(row) : null;
}
