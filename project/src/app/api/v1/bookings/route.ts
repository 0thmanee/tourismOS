import { ZodError } from "zod";
import { createBookingForOrganization } from "~/app/api/bookings/create-booking-for-organization";
import { createBookingSchema } from "~/app/api/bookings/schemas/bookings.schema";
import { bookingCreateBodyToProducerInput } from "~/app/api/v1/_lib/booking-b2c.mapper";
import type { BookingCreateResponse } from "~/app/api/v1/_lib/booking-contract.types";
import {
	jsonV1Error,
	jsonV1Ok,
	v1OptionsResponse,
} from "~/app/api/v1/_lib/http";
import {
	bookingRowToTripDTO,
	nextStepForBookingResponse,
} from "~/app/api/v1/_lib/trip.mapper";
import { mapCreateBookingErrorToResponse } from "~/app/api/v1/bookings/create-booking-http";
import { getTripRowByIdForB2c } from "~/app/api/v1/bookings/repo/b2c-trips.repo";
import { getV1AuthSession } from "~/app/api/v1/_lib/auth";
import { bookingCreateBodySchema } from "~/app/api/v1/bookings/schemas/booking-create-body.schema";
import { getMarketplaceExperienceById } from "~/app/api/v1/experiences/repo/marketplace-experiences.repo";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
	return v1OptionsResponse(request);
}

export async function POST(request: Request) {
	try {
		let json: unknown;
		try {
			json = await request.json();
		} catch {
			return jsonV1Error(request, 400, "INVALID_JSON", "Expected JSON body");
		}

		const parsed = bookingCreateBodySchema.safeParse(json);
		if (!parsed.success) {
			return jsonV1Error(
				request,
				400,
				"VALIDATION_ERROR",
				"Invalid request body",
				parsed.error.flatten(),
			);
		}

		const body = parsed.data;
		const session = await getV1AuthSession(request);
		const travelerUserId = session?.user?.id ?? null;

		const activity = await getMarketplaceExperienceById(body.experienceId);
		if (!activity) {
			return jsonV1Error(
				request,
				404,
				"NOT_FOUND",
				"Experience not found or inactive",
			);
		}

		const organizationId = activity.organizationId;
		const producerInput = bookingCreateBodyToProducerInput(body);
		const createInput = createBookingSchema.parse(producerInput);

		const detail = await createBookingForOrganization(
			organizationId,
			createInput,
			travelerUserId
				? { travelerUserId }
				: undefined,
		);

		const row = await getTripRowByIdForB2c(detail.id);
		if (!row) {
			return jsonV1Error(
				request,
				500,
				"INTERNAL_ERROR",
				"Booking created but could not load trip payload",
			);
		}

		const trip = bookingRowToTripDTO(row);
		const responseBody: BookingCreateResponse = {
			bookingId: detail.id,
			status: trip.status,
			paymentStatus: trip.paymentStatus,
			trip,
			nextStep: nextStepForBookingResponse({
				paymentMode: body.paymentIntent.mode,
				trip,
			}),
		};

		return jsonV1Ok(request, responseBody, { status: 201 });
	} catch (err) {
		if (err instanceof ZodError) {
			return jsonV1Error(
				request,
				400,
				"VALIDATION_ERROR",
				"Invalid booking payload",
				err.flatten(),
			);
		}
		return mapCreateBookingErrorToResponse(request, err);
	}
}
