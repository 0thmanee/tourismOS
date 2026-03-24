import type {
	BookingMetaInput,
	CreateBookingInput,
} from "~/app/api/bookings/schemas/bookings.schema";
import type { BookingCreateBody } from "~/app/api/v1/bookings/schemas/booking-create-body.schema";

export function bookingCreateBodyToProducerInput(
	body: BookingCreateBody,
): CreateBookingInput {
	const metaIn = body.booking.meta;
	const initialBits: string[] = [];
	if (metaIn?.notes?.trim()) initialBits.push(metaIn.notes.trim());
	if (body.customer.email?.trim()) {
		initialBits.push(`Email: ${body.customer.email.trim()}`);
	}
	initialBits.push(`Payment intent: ${body.paymentIntent.mode}`);

	const meta: BookingMetaInput = {};
	if (metaIn?.slotTime) meta.slotTime = metaIn.slotTime;
	if (metaIn?.resourceUnits != null) meta.resourceUnits = metaIn.resourceUnits;
	if (metaIn?.durationDays != null) meta.durationDays = metaIn.durationDays;
	const hasMeta = Object.keys(meta).length > 0;

	return {
		customerName: body.customer.name,
		customerPhone: body.customer.phone,
		activityId: body.experienceId,
		startAtISO: body.booking.startAtISO,
		peopleCount: body.booking.peopleCount,
		priceMad: body.priceMad,
		...(hasMeta ? { meta } : {}),
		initialNote: initialBits.length > 0 ? initialBits.join("\n") : undefined,
	};
}
