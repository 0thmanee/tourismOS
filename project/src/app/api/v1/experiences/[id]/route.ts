import { toExperienceDTO } from "~/app/api/v1/_lib/experience.mapper";
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
	context: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await context.params;
		const trimmed = id?.trim() ?? "";
		if (!trimmed) {
			return jsonV1Error(
				request,
				400,
				"VALIDATION_ERROR",
				"Missing experience id",
			);
		}
		const row = await getMarketplaceExperienceById(trimmed);
		if (!row) {
			return jsonV1Error(request, 404, "NOT_FOUND", "Experience not found");
		}
		return jsonV1Ok(request, { item: toExperienceDTO(row) });
	} catch (e) {
		console.error("[GET /api/v1/experiences/:id]", e);
		return jsonV1Error(
			request,
			500,
			"INTERNAL_ERROR",
			"Failed to load experience",
		);
	}
}
