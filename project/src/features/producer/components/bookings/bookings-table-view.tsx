"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
    <div className="p-4 lg:p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <h2 className="font-serif font-bold text-[18px] text-(--text-1)">Bookings</h2>
        <p className="font-sans text-sm text-(--text-2)">Filter and act on every booking in one place.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 items-end">
          <label className="flex flex-col gap-1">
            <span className="font-sans text-xs text-(--text-2)">Search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Customer, phone, activity…"
              className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-sans text-xs text-(--text-2)">Activity contains</span>
            <input
              value={activityContains}
              onChange={(e) => setActivityContains(e.target.value)}
              placeholder="Desert, quad…"
              className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-sans text-xs text-(--text-2)">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus | "")}
              className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
            >
              <option value="">All</option>
              <option value="NEW">New</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-sans text-xs text-(--text-2)">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-sans text-xs text-(--text-2)">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl card overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="bg-white/70 border-b border-white/60">
            <tr className="text-left">
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-widest text-(--text-2)">Customer</th>
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-widest text-(--text-2)">Activity</th>
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-widest text-(--text-2)">Start</th>
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-widest text-(--text-2)">Status</th>
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-widest text-(--text-2)">Payment</th>
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-widest text-(--text-2)">Amount</th>
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-widest text-(--text-2)">Quick</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center font-sans text-sm text-(--text-2)">
                  Loading…
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center font-sans text-sm text-(--text-2)">
                  No bookings match. Clear filters or create one from Inbox.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-white/40 last:border-b-0">
                  <td className="px-4 py-3 font-sans text-sm text-(--text-1)">
                    <Link href={`/producer/bookings/${booking.id}`} className="font-semibold hover:underline">
                      {booking.customerName}
                    </Link>
                    <p className="text-xs text-(--text-2)">{booking.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-(--text-1)">{booking.activityTitle}</td>
                  <td className="px-4 py-3 font-sans text-sm text-(--text-2)">{formatDateTime(booking.startAt)}</td>
                  <td className="px-4 py-3 font-sans text-sm text-(--text-1)">{booking.status}</td>
                  <td className="px-4 py-3 font-sans text-sm text-(--text-1)">{booking.paymentStatus}</td>
                  <td className="px-4 py-3 font-sans text-sm text-(--text-1)">{formatMad(booking.priceCents)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        disabled={
                          confirmMutation.isPending ||
                          booking.status === "PENDING" ||
                          booking.status === "CONFIRMED" ||
                          booking.status === "CANCELLED"
                        }
                        onClick={() =>
                          confirmMutation.mutate({ bookingId: booking.id, status: "PENDING" })
                        }
                        className="rounded-md px-2 py-1 text-[11px] font-semibold bg-amber-500/15 text-amber-800 border border-amber-500/25"
                      >
                        Pending
                      </button>
                      <button
                        type="button"
                        disabled={
                          confirmMutation.isPending ||
                          booking.status === "CONFIRMED" ||
                          booking.status === "CANCELLED"
                        }
                        onClick={() =>
                          confirmMutation.mutate({ bookingId: booking.id, status: "CONFIRMED" })
                        }
                        className="rounded-md px-2 py-1 text-[11px] font-semibold bg-(--brand-primary)/15 text-(--brand-primary) border border-(--brand-primary)/30"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        disabled={cancelMutation.isPending || booking.status === "CANCELLED"}
                        onClick={() =>
                          cancelMutation.mutate({ bookingId: booking.id, status: "CANCELLED" })
                        }
                        className="rounded-md px-2 py-1 text-[11px] font-semibold bg-red-500/10 text-red-600 border border-red-500/20"
                      >
                        Cancel
                      </button>
                      <Link
                        href={`/producer/bookings/${booking.id}`}
                        className="rounded-md px-2 py-1 text-[11px] font-semibold bg-white/80 border border-white/60"
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
