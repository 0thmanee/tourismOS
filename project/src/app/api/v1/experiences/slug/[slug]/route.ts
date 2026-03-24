import { toExperienceDTO } from "~/app/api/v1/_lib/experience.mapper";
import { parseIdFromExperienceSlug } from "~/app/api/v1/_lib/experience-slug";
import {
	jsonV1Error,
	jsonV1Ok,
	v1OptionsResponse,
} from "~/app/api/v1/_lib/http";
import { getMarketplaceExperienceById } from "~/app/api/v1/experiences/repo/marketplace-experiences.repo";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
	return v1OptionsResponse(request);
}

export async function GET(
	request: Request,
	context: { params: Promise<{ slug: string }> },
) {
	try {
		const { slug } = await context.params;
		const raw = slug?.trim() ?? "";
		if (!raw) {
			return jsonV1Error(request, 400, "VALIDATION_ERROR", "Missing slug");
		}
		const id = parseIdFromExperienceSlug(raw);
		if (!id) {
			return jsonV1Error(request, 404, "NOT_FOUND", "Experience not found");
		}
		const row = await getMarketplaceExperienceById(id);
		if (!row) {
			return jsonV1Error(request, 404, "NOT_FOUND", "Experience not found");
		}
		return jsonV1Ok(request, { item: toExperienceDTO(row) });
	} catch (e) {
		console.error("[GET /api/v1/experiences/slug/:slug]", e);
		return jsonV1Error(
			request,
			500,
			"INTERNAL_ERROR",
			"Failed to load experience",
		);
	}
}
