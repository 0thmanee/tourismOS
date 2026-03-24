import type { NextResponse } from "next/server";
import { jsonV1Error } from "~/app/api/v1/_lib/http";

export function mapCreateBookingErrorToResponse(
	request: Request,
	err: unknown,
): NextResponse {
	const msg = err instanceof Error ? err.message : "Booking failed";
	if (msg === "Activity not found") {
		return jsonV1Error(request, 404, "NOT_FOUND", msg);
	}
	if (msg.includes("full") || msg.includes("equipment")) {
		return jsonV1Error(request, 409, "CAPACITY", msg);
	}
	if (
		msg.includes("slot") ||
		msg.includes("time slot") ||
		msg.includes("title is required")
	) {
		return jsonV1Error(request, 400, "INVALID_OPTIONS", msg);
	}
	return jsonV1Error(request, 400, "BOOKING_FAILED", msg);
}
