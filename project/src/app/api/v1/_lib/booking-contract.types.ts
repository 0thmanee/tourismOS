/**
 * Canonical B2C booking write/read shapes for `/api/v1/bookings` and trips.
 * Source of truth for field names: docs/md/Unified_B2C_API_and_Domain_Strategy.md §6–§8.
 */

import type { ActivityKind } from "~/app/api/activities/schemas/activity.schema";

/** API-facing booking lifecycle (may include computed COMPLETED on trips). */
export type BookingStatusApi =
	| "NEW"
	| "PENDING"
	| "CONFIRMED"
	| "CANCELLED"
	| "COMPLETED";

export type PaymentStatusApi = "UNPAID" | "DEPOSIT" | "PAID";

export type BookingCreateRequest = {
	experienceId: string;
	priceMad: number;
	customer: {
		name: string;
		phone: string;
		email?: string | null;
	};
	booking: {
		startAtISO: string;
		peopleCount: number;
		meta?: {
			slotTime?: string | null;
			resourceUnits?: number | null;
			durationDays?: number | null;
			notes?: string | null;
		};
	};
	paymentIntent: {
		mode: "PAY_LATER" | "PAY_DEPOSIT" | "PAY_FULL";
	};
};

export type TripDTO = {
	bookingId: string;
	experienceId: string;
	title: string;
	city: string;
	heroImage: string;
	operatorName: string;
	meetingPoint: string;
	meetingNote: string | null;
	startAtISO: string;
	travelers: number;
	status: BookingStatusApi;
	paymentStatus: PaymentStatusApi;
	bookingType: ActivityKind;
	summary: {
		totalMad: number;
		depositMad: number | null;
		dueNowMad: number | null;
	};
	documents?: {
		voucherUrl?: string | null;
		receiptUrl?: string | null;
	};
};

export type BookingCreateResponse = {
	bookingId: string;
	status: BookingStatusApi;
	paymentStatus: PaymentStatusApi;
	trip: TripDTO;
	nextStep: {
		headline: string;
		message: string;
	};
};
