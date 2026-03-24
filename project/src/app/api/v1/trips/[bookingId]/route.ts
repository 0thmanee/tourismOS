import { z } from "zod";
import {
	jsonV1Error,
	jsonV1Ok,
	v1OptionsResponse,
} from "~/app/api/v1/_lib/http";
import { bookingRowToTripDTO } from "~/app/api/v1/_lib/trip.mapper";
import { getTripForPhoneRepo } from "~/app/api/v1/bookings/repo/b2c-trips.repo";

export const dynamic = "force-dynamic";

const detailQuerySchema = z.object({
	phone: z.string().min(3).max(30),
});

export async function OPTIONS(request: Request) {
	return v1OptionsResponse(request);
}

export async function GET(
	request: Request,
	context: { params: Promise<{ bookingId: string }> },
) {
	try {
		const { bookingId } = await context.params;
		const id = bookingId?.trim() ?? "";
		if (!id) {
			return jsonV1Error(
				request,
				400,
				"VALIDATION_ERROR",
				"Missing booking id",
			);
		}

		const url = new URL(request.url);
		const raw = Object.fromEntries(url.searchParams.entries());
		const parsed = detailQuerySchema.safeParse(raw);
		if (!parsed.success) {
			return jsonV1Error(
				request,
				400,
				"VALIDATION_ERROR",
				"Query requires phone matching the booking customer",
				parsed.error.flatten(),
			);
		}

		const row = await getTripForPhoneRepo(id, parsed.data.phone);
		if (!row) {
			return jsonV1Error(request, 404, "NOT_FOUND", "Trip not found");
		}

		return jsonV1Ok(request, { item: bookingRowToTripDTO(row) });
	} catch (e) {
		console.error("[GET /api/v1/trips/:bookingId]", e);
		return jsonV1Error(request, 500, "INTERNAL_ERROR", "Failed to load trip");
	}
}
