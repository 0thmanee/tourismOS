"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import type { BookingStatus } from "~/app/api/bookings";
import { useCancelBooking, useConfirmBooking } from "../../hooks/use-inbox";
import { useFilteredBookings } from "../../hooks/use-mvp-bookings";

function formatDateTime(value: Date) {
	return new Intl.DateTimeFormat("en-MA", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(value);
}

function formatMad(cents: number) {
	return `${(cents / 100).toLocaleString("en-MA")} MAD`;
}

type Props = {
	initialSearch?: string;
};

export function BookingsTableView({ initialSearch = "" }: Props) {
	const [status, setStatus] = useState<BookingStatus | "">("");
	const [activityContains, setActivityContains] = useState("");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [search, setSearch] = useState(initialSearch);

	useEffect(() => {
		setSearch(initialSearch);
	}, [initialSearch]);

	const filters = useMemo(() => {
		const f: {
			status?: BookingStatus;
			activityContains?: string;
			dateFrom?: string;
			dateTo?: string;
			search?: string;
		} = {};
		if (status) f.status = status;
		if (activityContains.trim()) f.activityContains = activityContains.trim();
		if (dateFrom) f.dateFrom = new Date(`${dateFrom}T00:00:00`).toISOString();
		if (dateTo) f.dateTo = new Date(`${dateTo}T23:59:59.999`).toISOString();
		if (search.trim()) f.search = search.trim();
		return f;
	}, [status, activityContains, dateFrom, dateTo, search]);

	const { data: bookings = [], isLoading } = useFilteredBookings(filters);
	const confirmMutation = useConfirmBooking();
	const cancelMutation = useCancelBooking();

	return (
		<div className="flex flex-col gap-4 p-4 lg:p-6">
			<div className="flex flex-col gap-3">
				<h2 className="font-bold font-serif text-(--text-1) text-[18px]">
					Bookings
				</h2>
				<p className="font-sans text-(--text-2) text-sm">
					Filter and act on every booking in one place.
				</p>
				<div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-2 lg:grid-cols-5">
					<label className="flex flex-col gap-1">
						<span className="font-sans text-(--text-2) text-xs">Search</span>
						<input
							className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Customer, phone, activity…"
							value={search}
						/>
					</label>
					<label className="flex flex-col gap-1">
						<span className="font-sans text-(--text-2) text-xs">
							Activity contains
						</span>
						<input
							className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
							onChange={(e) => setActivityContains(e.target.value)}
							placeholder="Desert, quad…"
							value={activityContains}
						/>
					</label>
					<label className="flex flex-col gap-1">
						<span className="font-sans text-(--text-2) text-xs">Status</span>
						<select
							className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
							onChange={(e) => setStatus(e.target.value as BookingStatus | "")}
							value={status}
						>
							<option value="">All</option>
							<option value="NEW">New</option>
							<option value="PENDING">Pending</option>
							<option value="CONFIRMED">Confirmed</option>
							<option value="CANCELLED">Cancelled</option>
						</select>
					</label>
					<label className="flex flex-col gap-1">
						<span className="font-sans text-(--text-2) text-xs">From</span>
						<input
							className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
							onChange={(e) => setDateFrom(e.target.value)}
							type="date"
							value={dateFrom}
						/>
					</label>
					<label className="flex flex-col gap-1">
						<span className="font-sans text-(--text-2) text-xs">To</span>
						<input
							className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
							onChange={(e) => setDateTo(e.target.value)}
							type="date"
							value={dateTo}
						/>
					</label>
				</div>
			</div>

			<div className="card overflow-x-auto rounded-xl">
				<table className="w-full min-w-[720px]">
					<thead className="border-white/60 border-b bg-white/70">
						<tr className="text-left">
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-widest">
								Customer
							</th>
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-widest">
								Activity
							</th>
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-widest">
								Start
							</th>
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-widest">
								Status
							</th>
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-widest">
								Payment
							</th>
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-widest">
								Amount
							</th>
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-widest">
								Quick
							</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td
									className="px-4 py-8 text-center font-sans text-(--text-2) text-sm"
									colSpan={7}
								>
									Loading…
								</td>
							</tr>
						) : bookings.length === 0 ? (
							<tr>
								<td
									className="px-4 py-8 text-center font-sans text-(--text-2) text-sm"
									colSpan={7}
								>
									No bookings match. Clear filters or create one from Inbox.
								</td>
							</tr>
						) : (
							bookings.map((booking) => (
								<tr
									className="border-white/40 border-b last:border-b-0"
									key={booking.id}
								>
									<td className="px-4 py-3 font-sans text-(--text-1) text-sm">
										<Link
											className="font-semibold hover:underline"
											href={`/producer/bookings/${booking.id}`}
										>
											{booking.customerName}
										</Link>
										<p className="text-(--text-2) text-xs">
											{booking.customerPhone}
										</p>
									</td>
									<td className="px-4 py-3 font-sans text-(--text-1) text-sm">
										{booking.activityTitle}
									</td>
									<td className="px-4 py-3 font-sans text-(--text-2) text-sm">
										{formatDateTime(booking.startAt)}
									</td>
									<td className="px-4 py-3 font-sans text-(--text-1) text-sm">
										{booking.status}
									</td>
									<td className="px-4 py-3 font-sans text-(--text-1) text-sm">
										{booking.paymentStatus}
									</td>
									<td className="px-4 py-3 font-sans text-(--text-1) text-sm">
										{formatMad(booking.priceCents)}
									</td>
									<td className="px-4 py-3">
										<div className="flex flex-wrap gap-1">
											<button
												className="rounded-md border border-amber-500/25 bg-amber-500/15 px-2 py-1 font-semibold text-[11px] text-amber-800"
												disabled={
													confirmMutation.isPending ||
													booking.status === "PENDING" ||
													booking.status === "CONFIRMED" ||
													booking.status === "CANCELLED"
												}
												onClick={() =>
													confirmMutation.mutate({
														bookingId: booking.id,
														status: "PENDING",
													})
												}
												type="button"
											>
												Pending
											</button>
											<button
												className="rounded-md border border-(--brand-primary)/30 bg-(--brand-primary)/15 px-2 py-1 font-semibold text-(--brand-primary) text-[11px]"
												disabled={
													confirmMutation.isPending ||
													booking.status === "CONFIRMED" ||
													booking.status === "CANCELLED"
												}
												onClick={() =>
													confirmMutation.mutate({
														bookingId: booking.id,
														status: "CONFIRMED",
													})
												}
												type="button"
											>
												Confirm
											</button>
											<button
												className="rounded-md border border-red-500/20 bg-red-500/10 px-2 py-1 font-semibold text-[11px] text-red-600"
												disabled={
													cancelMutation.isPending ||
													booking.status === "CANCELLED"
												}
												onClick={() =>
													cancelMutation.mutate({
														bookingId: booking.id,
														status: "CANCELLED",
													})
												}
												type="button"
											>
												Cancel
											</button>
											<Link
												className="rounded-md border border-white/60 bg-white/80 px-2 py-1 font-semibold text-[11px]"
												href={`/producer/bookings/${booking.id}`}
											>
												Edit
											</Link>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
