import type { ActivityKind } from "~/app/api/activities/schemas/activity.schema";
import type { BookingStatus } from "./schemas/bookings.schema";

export type BookingMeta = {
	slotTime?: string;
	resourceUnits?: number;
	durationDays?: number;
};

export function initialStatusForActivityKind(
	kind: ActivityKind,
): BookingStatus {
	switch (kind) {
		case "FIXED_SLOT":
			return "CONFIRMED";
		case "FLEXIBLE":
		case "MULTI_DAY":
			return "PENDING";
		case "RESOURCE_BASED":
			return "NEW";
		default:
			return "NEW";
	}
}

export function computeMultiDayEndAt(
	startAt: Date,
	durationDays: number,
): Date {
	const end = new Date(startAt);
	end.setHours(0, 0, 0, 0);
	end.setDate(end.getDate() + Math.max(1, durationDays) - 1);
	end.setHours(23, 59, 59, 999);
	return end;
}

export function dayBoundsUTC(d: Date): { dayStart: Date; dayEnd: Date } {
	const dayStart = new Date(d);
	dayStart.setHours(0, 0, 0, 0);
	const dayEnd = new Date(dayStart);
	dayEnd.setDate(dayEnd.getDate() + 1);
	return { dayStart, dayEnd };
}
