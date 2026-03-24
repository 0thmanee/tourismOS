import {
	jsonV1Error,
	jsonV1Ok,
	v1OptionsResponse,
} from "~/app/api/v1/_lib/http";
import { listMarketplaceExperiencesRepo } from "~/app/api/v1/experiences/repo/marketplace-experiences.repo";
import { listExperiencesQuerySchema } from "~/app/api/v1/experiences/schemas/list-experiences.query";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
	return v1OptionsResponse(request);
}

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const raw = Object.fromEntries(url.searchParams.entries());
		const parsed = listExperiencesQuerySchema.safeParse(raw);
		if (!parsed.success) {
			return jsonV1Error(
				request,
				400,
				"VALIDATION_ERROR",
				"Invalid query parameters",
				parsed.error.flatten(),
			);
		}
		const q = parsed.data;
		let pageSize = q.pageSize;
		if (q.featured && !url.searchParams.has("pageSize")) {
			pageSize = 12;
		}
		const result = await listMarketplaceExperiencesRepo({
			kind: q.kind,
			priceMin: q.priceMin,
			priceMax: q.priceMax,
			sort: q.sort,
			page: q.page,
			pageSize,
			city: q.city,
			category: q.category,
		});
		return jsonV1Ok(request, { items: result.items, meta: result.meta });
	} catch (e) {
		console.error("[GET /api/v1/experiences]", e);
		return jsonV1Error(
			request,
			500,
			"INTERNAL_ERROR",
			"Failed to list experiences",
		);
	}
}
