import type { Activity } from "@prisma/client";
import {
	parseNumberArray,
	parseStringArray,
} from "~/app/api/activities/repo/activities.repo";
import type { ActivityKind } from "~/app/api/activities/schemas/activity.schema";
import type { ExperienceDTO } from "./experience.types";
import {
	type OrgForExperience,
	parseMetadataStringArray,
	resolveExperienceCategory,
	resolveExperienceCity,
	resolveMeetingNote,
	resolveMeetingPoint,
	resolveOperatorBio,
	resolveOperatorName,
} from "./experience-fields";
import { buildExperienceSlug } from "./experience-slug";

function kindSummaryFragment(kind: ActivityKind): string {
	switch (kind) {
		case "FIXED_SLOT":
			return "Scheduled experience";
		case "FLEXIBLE":
			return "Flexible experience";
		case "MULTI_DAY":
			return "Multi-day experience";
		case "RESOURCE_BASED":
			return "Resource-based experience";
	}
}

function confirmationLabelForKind(kind: ActivityKind): string {
	switch (kind) {
		case "FIXED_SLOT":
			return "Instant confirmation";
		case "FLEXIBLE":
		case "MULTI_DAY":
			return "Request-based confirmation";
		case "RESOURCE_BASED":
			return "Operator confirmation";
	}
}

function durationLabel(activity: Activity): string {
	switch (activity.kind) {
		case "MULTI_DAY": {
			const opts = parseNumberArray(activity.durationOptions);
			const min = opts.length
				? Math.min(...opts)
				: activity.defaultDurationDays;
			return min === 1 ? "1 day" : `Up to ${min} days`;
		}
		case "FIXED_SLOT": {
			const slots = parseStringArray(activity.fixedSlots);
			if (!slots.length) return "Flexible timing";
			return `${slots.length} time slot${slots.length > 1 ? "s" : ""} available`;
		}
		default: {
			const d = activity.defaultDurationDays;
			return d <= 1 ? "Same day" : `Up to ${d} days`;
		}
	}
}

function groupSizeLabel(activity: Activity): string | null {
	if (activity.kind === "RESOURCE_BASED") {
		if (activity.resourceCapacity != null)
			return `Up to ${activity.resourceCapacity} units`;
		return null;
	}
	if (activity.capacity != null) return `Up to ${activity.capacity} people`;
	return null;
}

function resolveSummary(
	org: OrgForExperience,
	activityName: string,
	kind: ActivityKind,
): string {
	const m = org.metadata as Record<string, unknown> | null;
	if (m && typeof m.summary === "string" && m.summary.trim())
		return m.summary.trim();
	if (m && typeof m.description === "string" && m.description.trim())
		return m.description.trim().slice(0, 280);
	return `${activityName} — ${kindSummaryFragment(kind)}`;
}

function verifiedFromMetadata(org: OrgForExperience): boolean {
	const m = org.metadata as Record<string, unknown> | null;
	if (m && typeof m.verified === "boolean") return m.verified;
	if (m && typeof m.verifiedOperator === "boolean") return m.verifiedOperator;
	return false;
}

function popularityLabelFromMetadata(org: OrgForExperience): string | null {
	const m = org.metadata as Record<string, unknown> | null;
	if (m && typeof m.popularityLabel === "string" && m.popularityLabel.trim())
		return m.popularityLabel.trim();
	return null;
}

export function toExperienceDTO(
	activity: Activity & { organization: OrgForExperience },
): ExperienceDTO {
	const org = activity.organization;
	const kind = activity.kind as ActivityKind;
	const city = resolveExperienceCity(org);
	const category = resolveExperienceCategory(org);
	const fromMad = activity.defaultPriceMad ?? 0;
	const pricingLabel =
		activity.pricingKind === "PER_GROUP" ? "per group" : "per person";

	const slots =
		activity.kind === "FIXED_SLOT"
			? parseStringArray(activity.fixedSlots)
			: null;
	const durationOpts =
		activity.kind === "MULTI_DAY"
			? parseNumberArray(activity.durationOptions)
			: null;
	const resourceCap =
		activity.kind === "RESOURCE_BASED"
			? (activity.resourceCapacity ?? null)
			: null;

	const gallery = parseMetadataStringArray(org.metadata, "gallery");

	const logo = org.logo ?? "";

	return {
		id: activity.id,
		slug: buildExperienceSlug(activity.name, activity.id),
		organizationId: org.id,
		operatorName: resolveOperatorName(org),
		operatorLogoUrl: logo,
		operatorBio: resolveOperatorBio(org),
		title: activity.name,
		summary: resolveSummary(org, activity.name, kind),
		city,
		category,
		kind,
		price: {
			currency: "MAD",
			fromMad,
			depositRequired: false,
			depositMad: null,
			pricingLabel,
		},
		rating: {
			average: null,
			reviewsCount: null,
		},
		media: {
			heroImage: logo,
			gallery: gallery.length > 0 ? gallery : [],
		},
		logistics: {
			durationLabel: durationLabel(activity),
			groupSizeLabel: groupSizeLabel(activity),
			languages: parseMetadataStringArray(org.metadata, "languages"),
			meetingPoint: resolveMeetingPoint(org),
			meetingNote: resolveMeetingNote(org),
		},
		trust: {
			verifiedOperator: verifiedFromMetadata(org),
			responseTimeLabel: null,
			cancellationLabel: "Per operator policy",
			confirmationLabel: confirmationLabelForKind(kind),
			popularityLabel: popularityLabelFromMetadata(org),
		},
		bookingConfig: {
			availableSlots: slots && slots.length > 0 ? slots : null,
			durationOptionsDays:
				durationOpts && durationOpts.length > 0 ? durationOpts : null,
			resourceCapacity: resourceCap,
		},
		content: {
			highlights: parseMetadataStringArray(org.metadata, "highlights"),
			includes: parseMetadataStringArray(org.metadata, "includes"),
		},
	};
}
