import type { Prisma } from "@prisma/client";
import type { OrgForExperience } from "~/app/api/v1/_lib/experience-fields";
import type { BookingForTripRow } from "~/app/api/v1/_lib/trip.mapper";
import { prisma } from "~/lib/db";

const orgSelect = {
	id: true,
	name: true,
	slug: true,
	logo: true,
	metadata: true,
	settings: {
		select: { businessName: true, activities: true },
	},
} as const;

function mapOrg(o: {
	id: string;
	name: string;
	slug: string;
	logo: string | null;
	metadata: unknown;
	settings: {
		businessName: string | null;
		activities: unknown;
	} | null;
}): OrgForExperience {
	return {
		id: o.id,
		name: o.name,
		slug: o.slug,
		logo: o.logo,
		metadata: o.metadata as Prisma.JsonValue,
		settings: o.settings
			? {
					businessName: o.settings.businessName,
					activities: o.settings.activities,
				}
			: null,
	};
}

function toTripRow(r: {
	id: string;
	activityId: string | null;
	activityTitle: string;
	activityKind: BookingForTripRow["activityKind"];
	startAt: Date;
	endAt: Date | null;
	peopleCount: number;
	priceCents: number;
	status: string;
	paymentStatus: string;
	depositCents: number | null;
	organization: Parameters<typeof mapOrg>[0];
}): BookingForTripRow {
	return {
		id: r.id,
		activityId: r.activityId,
		activityTitle: r.activityTitle,
		activityKind: r.activityKind,
		startAt: r.startAt,
		endAt: r.endAt,
		peopleCount: r.peopleCount,
		priceCents: r.priceCents,
		status: r.status,
		paymentStatus: r.paymentStatus,
		depositCents: r.depositCents,
		organization: mapOrg(r.organization),
	};
}

/** MVP: list trips for a customer phone (document as weak auth — replace with traveler session). */
export async function listTripsForPhoneRepo(
	phone: string,
): Promise<BookingForTripRow[]> {
	const normalized = phone.trim();
	if (!normalized) return [];

	const rows = await prisma.booking.findMany({
		where: {
			customer: { phone: normalized },
			status: { not: "CANCELLED" },
		},
		orderBy: { startAt: "desc" },
		select: {
			id: true,
			activityId: true,
			activityTitle: true,
			activityKind: true,
			startAt: true,
			endAt: true,
			peopleCount: true,
			priceCents: true,
			status: true,
			paymentStatus: true,
			depositCents: true,
			organization: { select: orgSelect },
		},
	});

	return rows.map((r) => toTripRow(r));
}

export async function getTripForPhoneRepo(
	bookingId: string,
	phone: string,
): Promise<BookingForTripRow | null> {
	const normalized = phone.trim();
	if (!normalized) return null;

	const row = await prisma.booking.findFirst({
		where: {
			id: bookingId,
			customer: { phone: normalized },
			status: { not: "CANCELLED" },
		},
		select: {
			id: true,
			activityId: true,
			activityTitle: true,
			activityKind: true,
			startAt: true,
			endAt: true,
			peopleCount: true,
			priceCents: true,
			status: true,
			paymentStatus: true,
			depositCents: true,
			organization: { select: orgSelect },
		},
	});

	if (!row) return null;
	return toTripRow(row);
}

export async function getTripRowByIdForB2c(
	bookingId: string,
): Promise<BookingForTripRow | null> {
	const row = await prisma.booking.findFirst({
		where: { id: bookingId },
		select: {
			id: true,
			activityId: true,
			activityTitle: true,
			activityKind: true,
			startAt: true,
			endAt: true,
			peopleCount: true,
			priceCents: true,
			status: true,
			paymentStatus: true,
			depositCents: true,
			organization: { select: orgSelect },
		},
	});
	if (!row) return null;
	return toTripRow(row);
}
