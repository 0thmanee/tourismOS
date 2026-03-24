import type { BookingForTripRow } from "~/app/api/v1/_lib/trip.mapper";
import { bookingRowToTripDTO } from "~/app/api/v1/_lib/trip.mapper";

export function tripRowMatchesBucket(
	row: BookingForTripRow,
	bucket: "all" | "upcoming" | "pending" | "past",
): boolean {
	if (bucket === "all") return true;
	const now = Date.now();
	const start = row.startAt.getTime();
	const apiStatus = bookingRowToTripDTO(row).status;

	switch (bucket) {
		case "past":
			return start < now || apiStatus === "COMPLETED";
		case "pending":
			return (row.status === "NEW" || row.status === "PENDING") && start >= now;
		case "upcoming":
			return (
				start >= now && apiStatus !== "COMPLETED" && row.status !== "CANCELLED"
			);
		default:
			return true;
	}
}
