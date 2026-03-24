import type { Activity, Prisma } from "@prisma/client";
import type { ActivityKind } from "~/app/api/activities/schemas/activity.schema";
import { toExperienceDTO } from "~/app/api/v1/_lib/experience.mapper";
import type {
	ExperienceDTO,
	ListExperiencesMeta,
} from "~/app/api/v1/_lib/experience.types";
import {
	matchesCategoryFilter,
	matchesCityFilter,
	type OrgForExperience,
	resolveExperienceCategory,
	resolveExperienceCity,
} from "~/app/api/v1/_lib/experience-fields";
import { prisma } from "~/lib/db";

export const marketplaceExperienceInclude = {
	organization: {
		select: {
			id: true,
			name: true,
			slug: true,
			logo: true,
			metadata: true,
			settings: {
				select: { businessName: true, activities: true },
			},
		},
	},
} satisfies Prisma.ActivityInclude;

export type MarketplaceActivityRow = Activity & {
	organization: OrgForExperience;
};

const FACET_SCAN_CAP = 4000;
const FILTER_SCAN_CAP = 2000;

function baseWhere(params: {
	kind?: ActivityKind;
	priceMin?: number;
	priceMax?: number;
}): Prisma.ActivityWhereInput {
	const priceFilter: Prisma.IntNullableFilter | undefined =
		params.priceMin != null || params.priceMax != null
			? {
					...(params.priceMin != null ? { gte: params.priceMin } : {}),
					...(params.priceMax != null ? { lte: params.priceMax } : {}),
				}
			: undefined;

	return {
		isActive: true,
		...(params.kind ? { kind: params.kind } : {}),
		...(priceFilter ? { defaultPriceMad: priceFilter } : {}),
	};
}

function orderByForSort(
	sort: "recommended" | "price_asc" | "rating_desc",
): Prisma.ActivityOrderByWithRelationInput[] {
	if (sort === "price_asc") {
		return [{ defaultPriceMad: "asc" }, { sortOrder: "asc" }, { name: "asc" }];
	}
	// No review aggregates yet — rating_desc matches recommended ordering.
	return [{ sortOrder: "asc" }, { name: "asc" }];
}

function compareRows(
	a: MarketplaceActivityRow,
	b: MarketplaceActivityRow,
	sort: "recommended" | "price_asc" | "rating_desc",
): number {
	if (sort === "price_asc") {
		const pa = a.defaultPriceMad ?? Number.MAX_SAFE_INTEGER;
		const pb = b.defaultPriceMad ?? Number.MAX_SAFE_INTEGER;
		if (pa !== pb) return pa - pb;
	}
	const so = a.sortOrder - b.sortOrder;
	if (so !== 0) return so;
	return a.name.localeCompare(b.name);
}

function rowMatchesFilters(
	row: MarketplaceActivityRow,
	cityQuery?: string,
	categoryQuery?: string,
): boolean {
	const cQ = cityQuery?.trim();
	if (cQ) {
		const cityVal = resolveExperienceCity(row.organization);
		if (!matchesCityFilter(cityVal, cQ)) return false;
	}
	const catQ = categoryQuery?.trim();
	if (catQ) {
		const catVal = resolveExperienceCategory(row.organization);
		if (!matchesCategoryFilter(catVal, catQ)) return false;
	}
	return true;
}

export async function getMarketplaceFacets(): Promise<{
	cities: string[];
	categories: string[];
}> {
	const rows = await prisma.activity.findMany({
		where: { isActive: true },
		select: {
			organization: {
				select: {
					metadata: true,
					settings: { select: { activities: true } },
				},
			},
		},
		take: FACET_SCAN_CAP,
	});

	const cities = new Set<string>();
	const categories = new Set<string>();
	for (const r of rows) {
		const org = {
			id: "",
			name: "",
			slug: "",
			logo: null,
			metadata: r.organization.metadata,
			settings: r.organization.settings,
		} satisfies OrgForExperience;
		const c = resolveExperienceCity(org);
		const cat = resolveExperienceCategory(org);
		if (c) cities.add(c);
		if (cat) categories.add(cat);
	}

	return {
		cities: [...cities].sort((x, y) => x.localeCompare(y)),
		categories: [...categories].sort((x, y) => x.localeCompare(y)),
	};
}

export async function listMarketplaceExperiencesRepo(params: {
	kind?: ActivityKind;
	priceMin?: number;
	priceMax?: number;
	sort: "recommended" | "price_asc" | "rating_desc";
	page: number;
	pageSize: number;
	city?: string;
	category?: string;
}): Promise<{ items: ExperienceDTO[]; meta: ListExperiencesMeta }> {
	const where = baseWhere({
		kind: params.kind,
		priceMin: params.priceMin,
		priceMax: params.priceMax,
	});
	const orderBy = orderByForSort(params.sort);
	const cityQ = params.city;
	const categoryQ = params.category;
	const needsScan = Boolean(cityQ?.trim() || categoryQ?.trim());

	const facets = await getMarketplaceFacets();

	if (needsScan) {
		const rows = await prisma.activity.findMany({
			where,
			include: marketplaceExperienceInclude,
			orderBy,
			take: FILTER_SCAN_CAP,
		});
		const filtered = rows.filter((r) => rowMatchesFilters(r, cityQ, categoryQ));
		const sorted = [...filtered].sort((a, b) => compareRows(a, b, params.sort));
		const total = sorted.length;
		const offset = (params.page - 1) * params.pageSize;
		const slice = sorted.slice(offset, offset + params.pageSize);
		return {
			items: slice.map((r) => toExperienceDTO(r)),
			meta: {
				page: params.page,
				pageSize: params.pageSize,
				total,
				availableCities: facets.cities,
				availableCategories: facets.categories,
			},
		};
	}

	const [total, rows] = await Promise.all([
		prisma.activity.count({ where }),
		prisma.activity.findMany({
			where,
			include: marketplaceExperienceInclude,
			orderBy,
			skip: (params.page - 1) * params.pageSize,
			take: params.pageSize,
		}),
	]);

	return {
		items: rows.map((r) => toExperienceDTO(r)),
		meta: {
			page: params.page,
			pageSize: params.pageSize,
			total,
			availableCities: facets.cities,
			availableCategories: facets.categories,
		},
	};
}

export async function getMarketplaceExperienceById(id: string) {
	return prisma.activity.findFirst({
		where: { id, isActive: true },
		include: marketplaceExperienceInclude,
	});
}
