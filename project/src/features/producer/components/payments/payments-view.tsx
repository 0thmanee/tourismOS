"use client";

import Link from "next/link";
import React from "react";
import { useInboxBookings } from "../../hooks/use-inbox";
import { useMarkBookingPaid } from "../../hooks/use-mvp-bookings";

function formatMad(cents: number) {
	return `${(cents / 100).toLocaleString("en-MA")} MAD`;
}

export function PaymentsView() {
	const { data: bookings = [], isLoading } = useInboxBookings();
	const markPaid = useMarkBookingPaid();

	return (
		<div className="flex flex-col gap-4 p-4 lg:p-6">
			<div>
				<h2 className="font-bold font-serif text-(--text-1) text-[18px]">
					Payments
				</h2>
				<p className="mt-1 font-sans text-(--text-2) text-sm">
					Track deposits and full payments per booking.
				</p>
			</div>

			<div className="card overflow-x-auto rounded-xl">
				<table className="w-full min-w-[640px]">
					<thead className="border-white/60 border-b bg-white/70">
						<tr className="text-left">
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-widest">
								Booking
							</th>
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-widest">
								Customer
							</th>
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-widest">
								Amount
							</th>
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-widest">
								Status
							</th>
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-widest">
								Action
							</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td
									className="px-4 py-8 text-center font-sans text-(--text-2) text-sm"
									colSpan={5}
								>
									Loading…
								</td>
							</tr>
						) : bookings.length === 0 ? (
							<tr>
								<td
									className="px-4 py-8 text-center font-sans text-(--text-2) text-sm"
									colSpan={5}
								>
									No bookings yet.
								</td>
							</tr>
						) : (
							bookings.map((b) => (
								<tr
									className="border-white/40 border-b last:border-b-0"
									key={b.id}
								>
									<td className="px-4 py-3 font-sans text-(--text-1) text-sm">
										<Link
											className="font-semibold hover:underline"
											href={`/producer/bookings/${b.id}`}
										>
											{b.activityTitle}
										</Link>
									</td>
									<td className="px-4 py-3 font-sans text-(--text-1) text-sm">
										{b.customerName}
									</td>
									<td className="px-4 py-3 font-sans text-(--text-1) text-sm">
										{formatMad(b.priceCents)}
									</td>
									<td className="px-4 py-3 font-sans text-(--text-1) text-sm">
										{b.paymentStatus}
									</td>
									<td className="px-4 py-3">
										<button
											className="rounded-lg bg-(--brand-primary) px-3 py-1.5 font-semibold text-white text-xs disabled:opacity-50"
											disabled={
												markPaid.isPending || b.paymentStatus === "PAID"
											}
											onClick={() => markPaid.mutate({ bookingId: b.id })}
											type="button"
										>
											Mark paid
										</button>
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
