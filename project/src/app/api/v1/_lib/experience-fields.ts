import type { Organization } from "@prisma/client";

/** Subset loaded with marketplace queries (partial settings selects are OK). */
export type OrgForExperience = Pick<
	Organization,
	"id" | "name" | "slug" | "logo" | "metadata"
> & {
	settings?: {
		businessName?: string | null;
		activities?: unknown;
	} | null;
};

export function resolveOperatorName(org: OrgForExperience): string {
	const bn = org.settings?.businessName?.trim();
	return bn && bn.length > 0 ? bn : org.name;
}

export function resolveExperienceCity(org: OrgForExperience): string {
	const m = org.metadata as Record<string, unknown> | null;
	if (m && typeof m.marketCity === "string" && m.marketCity.trim())
		return m.marketCity.trim();
	if (m && typeof m.city === "string" && m.city.trim()) return m.city.trim();
	if (m && typeof m.hqCity === "string" && m.hqCity.trim())
		return m.hqCity.trim();
	return "";
}

export function resolveExperienceCategory(org: OrgForExperience): string {
	const raw = org.settings?.activities;
	if (Array.isArray(raw)) {
		const first = raw.find((x) => typeof x === "string" && x.trim());
		if (first) return String(first).trim();
	}
	return "Experiences";
}

export function parseMetadataStringArray(
	metadata: Organization["metadata"],
	key: string,
): string[] {
	const m = metadata as Record<string, unknown> | null;
	const v = m?.[key];
	if (!Array.isArray(v)) return [];
	return v.filter((x): x is string => typeof x === "string");
}

export function resolveMeetingPoint(org: OrgForExperience): string {
	const m = org.metadata as Record<string, unknown> | null;
	if (m && typeof m.meetingPoint === "string" && m.meetingPoint.trim())
		return m.meetingPoint.trim();
	return "";
}

export function resolveMeetingNote(org: OrgForExperience): string | null {
	const m = org.metadata as Record<string, unknown> | null;
	if (m && typeof m.meetingNote === "string" && m.meetingNote.trim())
		return m.meetingNote.trim();
	return null;
}

export function normalizeFilterToken(s: string): string {
	return s.trim().toLowerCase();
}

export function matchesCityFilter(dtoCity: string, query: string): boolean {
	const q = normalizeFilterToken(query);
	if (!q) return true;
	const c = normalizeFilterToken(dtoCity);
	if (!c) return false;
	return c === q || c.includes(q) || q.includes(c);
}

export function matchesCategoryFilter(
	dtoCategory: string,
	query: string,
): boolean {
	const q = normalizeFilterToken(query);
	if (!q) return true;
	const c = normalizeFilterToken(dtoCategory);
	if (!c) return false;
	return c === q || c.includes(q) || q.includes(c);
}
