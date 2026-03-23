"use client";

import React from "react";
import Link from "next/link";
import { useInboxBookings } from "../../hooks/use-inbox";
import { useMarkBookingPaid } from "../../hooks/use-mvp-bookings";

function formatMad(cents: number) {
  return `${(cents / 100).toLocaleString("en-MA")} MAD`;
}

export function PaymentsView() {
  const { data: bookings = [], isLoading } = useInboxBookings();
  const markPaid = useMarkBookingPaid();

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-4">
      <div>
        <h2 className="font-serif font-bold text-[18px] text-(--text-1)">Payments</h2>
        <p className="font-sans text-sm text-(--text-2) mt-1">Track deposits and full payments per booking.</p>
      </div>

      <div className="rounded-xl card overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-white/70 border-b border-white/60">
            <tr className="text-left">
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-widest text-(--text-2)">Booking</th>
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-widest text-(--text-2)">Customer</th>
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-widest text-(--text-2)">Amount</th>
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-widest text-(--text-2)">Status</th>
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-widest text-(--text-2)">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center font-sans text-sm text-(--text-2)">
                  Loading…
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center font-sans text-sm text-(--text-2)">
                  No bookings yet.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="border-b border-white/40 last:border-b-0">
                  <td className="px-4 py-3 font-sans text-sm text-(--text-1)">
                    <Link href={`/producer/bookings/${b.id}`} className="font-semibold hover:underline">
                      {b.activityTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-(--text-1)">{b.customerName}</td>
                  <td className="px-4 py-3 font-sans text-sm text-(--text-1)">{formatMad(b.priceCents)}</td>
                  <td className="px-4 py-3 font-sans text-sm text-(--text-1)">{b.paymentStatus}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={markPaid.isPending || b.paymentStatus === "PAID"}
                      onClick={() => markPaid.mutate({ bookingId: b.id })}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-(--brand-primary) text-white disabled:opacity-50"
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
