import { z } from "zod";
import type { BookingMessageRow } from "~/app/api/bookings/schemas/bookings.schema";
import {
	jsonV1Error,
	jsonV1Ok,
	v1OptionsResponse,
} from "~/app/api/v1/_lib/http";
import { getV1AuthSession } from "~/app/api/v1/_lib/auth";
import {
	appendCustomerBookingMessageForB2c,
	listBookingMessagesForCustomer,
} from "~/app/api/v1/bookings/repo/b2c-booking-messages.repo";

export const dynamic = "force-dynamic";

const phoneQuerySchema = z.object({
	phone: z.preprocess(
		(v) =>
			typeof v !== "string" || v.trim() === ""
				? undefined
				: v.trim(),
		z.string().min(3).max(30).optional(),
	),
});

const postBodySchema = z.object({
	body: z.string().min(1).max(2000),
});

function bookingMessageToV1Dto(m: BookingMessageRow) {
	return {
		id: m.id,
		sender: m.sender,
		type: m.type,
		body: m.body,
		metadata: m.metadata,
		createdAt: m.createdAt.toISOString(),
	};
}

export async function OPTIONS(request: Request) {
	return v1OptionsResponse(request);
}

export async function GET(
	request: Request,
	context: { params: Promise<{ bookingId: string }> },
) {
	try {
		const session = await getV1AuthSession(request);
		if (!session) {
			return jsonV1Error(
				request,
				401,
				"UNAUTHORIZED",
				"Authentication required",
			);
		}

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
		const parsed = phoneQuerySchema.safeParse(
			Object.fromEntries(url.searchParams.entries()),
		);
		if (!parsed.success) {
			return jsonV1Error(
				request,
				400,
				"VALIDATION_ERROR",
				"Invalid messages query",
				parsed.error.flatten(),
			);
		}

		const rows = await listBookingMessagesForCustomer(
			id,
			session.user.id,
			parsed.data.phone,
		);
		if (!rows) {
			return jsonV1Error(request, 404, "NOT_FOUND", "Booking not found");
		}

		return jsonV1Ok(request, {
			items: rows.map(bookingMessageToV1Dto),
		});
	} catch (e) {
		console.error("[GET /api/v1/bookings/:bookingId/messages]", e);
		return jsonV1Error(
			request,
			500,
			"INTERNAL_ERROR",
			"Failed to load messages",
		);
	}
}

export async function POST(
	request: Request,
	context: { params: Promise<{ bookingId: string }> },
) {
	try {
		const session = await getV1AuthSession(request);
		if (!session) {
			return jsonV1Error(
				request,
				401,
				"UNAUTHORIZED",
				"Authentication required",
			);
		}

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
		const phoneParsed = phoneQuerySchema.safeParse(
			Object.fromEntries(url.searchParams.entries()),
		);
		if (!phoneParsed.success) {
			return jsonV1Error(
				request,
				400,
				"VALIDATION_ERROR",
				"Invalid messages query",
				phoneParsed.error.flatten(),
			);
		}

		let json: unknown;
		try {
			json = await request.json();
		} catch {
			return jsonV1Error(
				request,
				400,
				"VALIDATION_ERROR",
				"Expected JSON body",
			);
		}

		const bodyParsed = postBodySchema.safeParse(json);
		if (!bodyParsed.success) {
			return jsonV1Error(
				request,
				400,
				"VALIDATION_ERROR",
				"Invalid message body",
				bodyParsed.error.flatten(),
			);
		}

		const trimmed = bodyParsed.data.body.trim();
		if (!trimmed) {
			return jsonV1Error(
				request,
				400,
				"VALIDATION_ERROR",
				"Message cannot be empty",
			);
		}

		const msg = await appendCustomerBookingMessageForB2c(
			id,
			session.user.id,
			phoneParsed.data.phone,
			trimmed,
		);
		if (!msg) {
			return jsonV1Error(request, 404, "NOT_FOUND", "Booking not found");
		}

		return jsonV1Ok(request, { item: bookingMessageToV1Dto(msg) });
	} catch (e) {
		console.error("[POST /api/v1/bookings/:bookingId/messages]", e);
		return jsonV1Error(
			request,
			500,
			"INTERNAL_ERROR",
			"Failed to send message",
		);
	}
}
