"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingDetailRow } from "~/app/api/bookings";
import { useUpdateBooking } from "../../hooks/use-mvp-bookings";

type Props = {
  booking: BookingDetailRow;
};

export function BookingEditForm({ booking }: Props) {
  const router = useRouter();
  const [activityTitle, setActivityTitle] = useState(booking.activityTitle);
  const [date, setDate] = useState(() => new Date(booking.startAt).toISOString().slice(0, 10));
  const [time, setTime] = useState(() => {
    const d = new Date(booking.startAt);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [peopleCount, setPeopleCount] = useState(booking.peopleCount);
  const [priceMad, setPriceMad] = useState(booking.priceCents / 100);
  const mutation = useUpdateBooking();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const startAtISO = new Date(`${date}T${time}:00`).toISOString();
    await mutation.mutateAsync({
      bookingId: booking.id,
      activityTitle,
      startAtISO,
      peopleCount,
      priceMad,
    });
    router.refresh();
  }

  return (
    <section className="card rounded-xl p-5 flex flex-col gap-3">
      <h3 className="font-serif font-bold text-lg text-(--text-1)">Edit booking</h3>
      <p className="font-sans text-sm text-(--text-2)">Reschedule or update details — availability rules apply.</p>
      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-sans text-xs text-(--text-2)">Activity</span>
          <input
            value={activityTitle}
            onChange={(e) => setActivityTitle(e.target.value)}
            className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-sans text-xs text-(--text-2)">People</span>
          <input
            type="number"
            min={1}
            value={peopleCount}
            onChange={(e) => setPeopleCount(Math.max(1, Number(e.target.value)))}
            className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-sans text-xs text-(--text-2)">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-sans text-xs text-(--text-2)">Time</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="font-sans text-xs text-(--text-2)">Price (MAD)</span>
          <input
            type="number"
            min={0}
            step={1}
            value={priceMad}
            onChange={(e) => setPriceMad(Math.max(0, Number(e.target.value)))}
            className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg px-4 py-2 text-sm font-semibold bg-(--brand-primary) text-white disabled:opacity-50"
          >
            {mutation.isPending ? "Saving…" : "Save changes"}
          </button>
          {mutation.isError && (
            <p className="font-sans text-sm text-red-500 mt-2">Could not update booking.</p>
          )}
        </div>
      </form>
    </section>
  );
}
