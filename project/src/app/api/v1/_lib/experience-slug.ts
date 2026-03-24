/** URL segment for public experiences: name-derived prefix + activity id. */
export function slugifySegment(name: string): string {
	const s = name
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 48);
	return s || "experience";
}

export function buildExperienceSlug(name: string, id: string): string {
	return `${slugifySegment(name)}--${id}`;
}

/**
 * Resolves activity id from `slugify(title)--cuid` or a bare cuid-style segment.
 */
export function parseIdFromExperienceSlug(rawSlug: string): string | null {
	const decoded = decodeURIComponent(rawSlug).trim();
	if (!decoded) return null;
	const idx = decoded.lastIndexOf("--");
	if (idx >= 0) {
		const id = decoded.slice(idx + 2).trim();
		return id.length > 0 ? id : null;
	}
	if (/^[a-z0-9]{15,40}$/i.test(decoded)) return decoded;
	return null;
}
