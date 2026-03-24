import {
	jsonV1Error,
	jsonV1Ok,
	v1OptionsResponse,
} from "~/app/api/v1/_lib/http";
import { bookingRowToTripDTO } from "~/app/api/v1/_lib/trip.mapper";
import { listTripsForPhoneRepo } from "~/app/api/v1/bookings/repo/b2c-trips.repo";
import { listTripsQuerySchema } from "~/app/api/v1/trips/schemas/list-trips.query";
import { tripRowMatchesBucket } from "~/app/api/v1/trips/trip-filters";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
	return v1OptionsResponse(request);
}

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const raw = Object.fromEntries(url.searchParams.entries());
		const parsed = listTripsQuerySchema.safeParse(raw);
		if (!parsed.success) {
			return jsonV1Error(
				request,
				400,
				"VALIDATION_ERROR",
				"Query requires valid phone (and optional status)",
				parsed.error.flatten(),
			);
		}

		const { phone, status } = parsed.data;
		const rows = await listTripsForPhoneRepo(phone);
		const filtered = rows.filter((r) => tripRowMatchesBucket(r, status));
		const items = filtered.map((r) => bookingRowToTripDTO(r));

		return jsonV1Ok(request, { items });
	} catch (e) {
		console.error("[GET /api/v1/trips]", e);
		return jsonV1Error(request, 500, "INTERNAL_ERROR", "Failed to list trips");
	}
}
