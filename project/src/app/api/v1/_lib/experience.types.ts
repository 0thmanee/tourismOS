import type { ActivityKind } from "~/app/api/activities/schemas/activity.schema";

/**
 * Public consumer DTO — §6.1 Unified_B2C_API_and_Domain_Strategy.md
 */
export type ExperienceDTO = {
	id: string;
	slug: string;
	organizationId: string;
	operatorName: string;

	title: string;
	summary: string;
	city: string;
	category: string;

	kind: ActivityKind;

	price: {
		currency: "MAD";
		fromMad: number;
		depositRequired: boolean;
		depositMad: number | null;
		pricingLabel: string;
	};

	rating: {
		average: number | null;
		reviewsCount: number | null;
	};

	media: {
		heroImage: string;
		gallery: string[];
	};

	logistics: {
		durationLabel: string;
		groupSizeLabel: string | null;
		languages: string[];
		meetingPoint: string;
		meetingNote: string | null;
	};

	trust: {
		verifiedOperator: boolean;
		responseTimeLabel: string | null;
		cancellationLabel: string | null;
		confirmationLabel: string | null;
		popularityLabel: string | null;
	};

	bookingConfig: {
		availableSlots: string[] | null;
		durationOptionsDays: number[] | null;
		resourceCapacity: number | null;
	};

	content: {
		highlights: string[];
		includes: string[];
	};
};

export type ListExperiencesMeta = {
	page: number;
	pageSize: number;
	total: number;
	availableCities: string[];
	availableCategories: string[];
};
