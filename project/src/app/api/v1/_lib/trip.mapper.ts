import type { ActivityKind as PrismaActivityKind } from "@prisma/client";
import type { ActivityKind } from "~/app/api/activities/schemas/activity.schema";
import type { BookingStatus } from "~/app/api/bookings/schemas/bookings.schema";
import type {
	BookingCreateResponse,
	BookingStatusApi,
	PaymentStatusApi,
	TripDTO,
} from "~/app/api/v1/_lib/booking-contract.types";
import {
	type OrgForExperience,
	resolveExperienceCity,
	resolveMeetingNote,
	resolveMeetingPoint,
	resolveOperatorName,
} from "~/app/api/v1/_lib/experience-fields";

export type BookingForTripRow = {
	id: string;
	activityId: string | null;
	activityTitle: string;
	activityKind: PrismaActivityKind | null;
	startAt: Date;
	endAt: Date | null;
	peopleCount: number;
	priceCents: number;
	status: string;
	paymentStatus: string;
	depositCents: number | null;
	organization: OrgForExperience;
};

function toBookingStatusApi(
	status: BookingStatus,
	startAt: Date,
): BookingStatusApi {
	const now = Date.now();
	if (status === "CONFIRMED" && startAt.getTime() < now) {
		return "COMPLETED";
	}
	return status as BookingStatusApi;
}

function toPaymentStatusApi(s: string): PaymentStatusApi {
	if (s === "UNPAID" || s === "DEPOSIT" || s === "PAID") return s;
	return "UNPAID";
}

function activityKindOrDefault(k: PrismaActivityKind | null): ActivityKind {
	if (
		k === "FIXED_SLOT" ||
		k === "FLEXIBLE" ||
		k === "MULTI_DAY" ||
		k === "RESOURCE_BASED"
	) {
		return k;
	}
	return "FLEXIBLE";
}

export function bookingRowToTripDTO(row: BookingForTripRow): TripDTO {
	const totalMad = Math.round(row.priceCents / 100);
	const depositMad =
		row.depositCents != null ? Math.round(row.depositCents / 100) : null;
	const pay = toPaymentStatusApi(row.paymentStatus);

	let dueNowMad: number | null = null;
	if (pay === "PAID") dueNowMad = 0;
	else if (pay === "DEPOSIT" && depositMad != null)
		dueNowMad = Math.max(0, totalMad - depositMad);
	else dueNowMad = totalMad;

	const org = row.organization;

	return {
		bookingId: row.id,
		experienceId: row.activityId ?? "",
		title: row.activityTitle,
		city: resolveExperienceCity(org),
		heroImage: org.logo ?? "",
		operatorName: resolveOperatorName(org),
		meetingPoint: resolveMeetingPoint(org),
		meetingNote: resolveMeetingNote(org),
		startAtISO: row.startAt.toISOString(),
		travelers: row.peopleCount,
		status: toBookingStatusApi(row.status as BookingStatus, row.startAt),
		paymentStatus: pay,
		bookingType: activityKindOrDefault(row.activityKind),
		summary: {
			totalMad,
			depositMad,
			dueNowMad,
		},
	};
}

export function nextStepForBookingResponse(params: {
	paymentMode: "PAY_LATER" | "PAY_DEPOSIT" | "PAY_FULL";
	trip: TripDTO;
}): BookingCreateResponse["nextStep"] {
	const { paymentMode, trip } = params;
	if (trip.status === "COMPLETED") {
		return {
			headline: "Past experience",
			message: "This trip is in the past. We hope you enjoyed it.",
		};
	}
	switch (paymentMode) {
		case "PAY_FULL":
			return {
				headline: "Booking recorded",
				message:
					"Full payment will be coordinated with the operator. Check Trips for updates.",
			};
		case "PAY_DEPOSIT":
			return {
				headline: "Deposit may be required",
				message:
					"The operator will confirm and share deposit instructions if needed.",
			};
		default:
			return {
				headline: "You're on the list",
				message:
					trip.status === "CONFIRMED"
						? "Your booking is confirmed. See Trips for details."
						: "The operator will confirm shortly. You can track status in Trips.",
			};
	}
}
