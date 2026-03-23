import { prisma } from "~/lib/db";
import type { ActivityKind, PricingKind } from "../schemas/activity.schema";

function parseStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.filter((x): x is string => typeof x === "string");
}

function parseNumberArray(value: unknown): number[] {
	if (!Array.isArray(value)) return [];
	return value.map((x) => Number(x)).filter((n) => Number.isFinite(n));
}

export async function listActivitiesForOrgRepo(
	organizationId: string,
	includeInactive = false,
) {
	return prisma.activity.findMany({
		where: { organizationId, ...(includeInactive ? {} : { isActive: true }) },
		orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
	});
}

export async function getActivityForOrgRepo(
	organizationId: string,
	activityId: string,
) {
	return prisma.activity.findFirst({
		where: { id: activityId, organizationId },
	});
}

export async function createActivityRepo(
	organizationId: string,
	data: {
		name: string;
		kind: ActivityKind;
		pricingKind: PricingKind;
		capacity: number | null;
		resourceCapacity: number | null;
		fixedSlots: string[];
		durationOptions: number[];
		defaultDurationDays: number;
		requiresGuide: boolean;
		requiresTransport: boolean;
		requiresEquipment: boolean;
		defaultPriceMad: number | null;
		sortOrder: number;
	},
) {
	return prisma.activity.create({
		data: {
			organizationId,
			name: data.name,
			kind: data.kind,
			pricingKind: data.pricingKind,
			capacity: data.capacity,
			resourceCapacity: data.resourceCapacity,
			fixedSlots: data.fixedSlots,
			durationOptions: data.durationOptions,
			defaultDurationDays: data.defaultDurationDays,
			requiresGuide: data.requiresGuide,
			requiresTransport: data.requiresTransport,
			requiresEquipment: data.requiresEquipment,
			defaultPriceMad: data.defaultPriceMad,
			sortOrder: data.sortOrder,
		},
	});
}

export async function updateActivityRepo(
	organizationId: string,
	data: {
		id: string;
		name: string;
		kind: ActivityKind;
		pricingKind: PricingKind;
		capacity: number | null;
		resourceCapacity: number | null;
		fixedSlots: string[];
		durationOptions: number[];
		defaultDurationDays: number;
		requiresGuide: boolean;
		requiresTransport: boolean;
		requiresEquipment: boolean;
		defaultPriceMad: number | null;
		sortOrder: number;
		isActive?: boolean;
	},
) {
	const existing = await prisma.activity.findFirst({
		where: { id: data.id, organizationId },
		select: { id: true },
	});
	if (!existing) return null;

	return prisma.activity.update({
		where: { id: data.id },
		data: {
			name: data.name,
			kind: data.kind,
			pricingKind: data.pricingKind,
			capacity: data.capacity,
			resourceCapacity: data.resourceCapacity,
			fixedSlots: data.fixedSlots,
			durationOptions: data.durationOptions,
			defaultDurationDays: data.defaultDurationDays,
			requiresGuide: data.requiresGuide,
			requiresTransport: data.requiresTransport,
			requiresEquipment: data.requiresEquipment,
			defaultPriceMad: data.defaultPriceMad,
			sortOrder: data.sortOrder,
			...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
		},
	});
}

/** Sum people booked for same activity + day + slot (FIXED_SLOT). */
export async function sumPeopleFixedSlotRepo(params: {
	organizationId: string;
	activityId: string;
	dayStart: Date;
	dayEnd: Date;
	slotTime: string;
}): Promise<number> {
	const rows = await prisma.booking.findMany({
		where: {
			organizationId: params.organizationId,
			activityId: params.activityId,
			status: { not: "CANCELLED" },
			startAt: { gte: params.dayStart, lt: params.dayEnd },
		},
		select: { peopleCount: true, meta: true },
	});

	let sum = 0;
	for (const r of rows) {
		const meta = r.meta as { slotTime?: string } | null;
		if (meta?.slotTime === params.slotTime) sum += r.peopleCount;
	}
	return sum;
}

/** Sum resource units for same activity + exact start (RESOURCE_BASED overlap MVP). */
export async function sumResourceUnitsRepo(params: {
	organizationId: string;
	activityId: string;
	startAt: Date;
}): Promise<number> {
	const rows = await prisma.booking.findMany({
		where: {
			organizationId: params.organizationId,
			activityId: params.activityId,
			status: { not: "CANCELLED" },
			startAt: params.startAt,
		},
		select: { meta: true },
	});

	let sum = 0;
	for (const r of rows) {
		const meta = r.meta as { resourceUnits?: number } | null;
		sum += meta?.resourceUnits ?? 0;
	}
	return sum;
}

export { parseStringArray, parseNumberArray };
