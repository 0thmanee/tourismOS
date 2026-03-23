"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import type { BookingInboxRow, BookingStatus } from "~/app/api/bookings";
import { useCalendarBookings } from "../../hooks/use-mvp-bookings";

function startOfWeekMonday(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function formatDayLabel(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(d);
}

function formatTime(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(d);
}

function statusColor(status: BookingStatus): string {
  switch (status) {
    case "NEW":
      return "border-l-[var(--color-info)]";
    case "PENDING":
      return "border-l-[var(--color-warning)]";
    case "CONFIRMED":
      return "border-l-[var(--color-success)]";
    case "CANCELLED":
      return "border-l-[var(--color-danger)]";
    default:
      return "border-l-white/40";
  }
}

type ViewMode = "week" | "day";

export function CalendarView() {
  const [view, setView] = useState<ViewMode>("week");
  const [cursor, setCursor] = useState(() => new Date());

  const range = useMemo(() => {
    if (view === "day") {
      const start = new Date(cursor);
      start.setHours(0, 0, 0, 0);
      const end = new Date(cursor);
      end.setHours(23, 59, 59, 999);
      return {
        rangeStartISO: start.toISOString(),
        rangeEndISO: end.toISOString(),
      };
    }
    const weekStart = startOfWeekMonday(cursor);
    const weekEnd = addDays(weekStart, 7);
    weekEnd.setMilliseconds(-1);
    return {
      rangeStartISO: weekStart.toISOString(),
      rangeEndISO: weekEnd.toISOString(),
    };
  }, [cursor, view]);

  const { data: bookings = [], isLoading } = useCalendarBookings(range);

  const byDay = useMemo(() => {
    const map = new Map<string, BookingInboxRow[]>();
    const days =
      view === "day"
        ? [new Date(cursor)]
        : Array.from({ length: 7 }, (_, i) => addDays(startOfWeekMonday(cursor), i));

    for (const d of days) {
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString();
      map.set(key, []);
    }
    for (const b of bookings) {
      const d = new Date(b.startAt);
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(b);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    }
    return { map, days };
  }, [bookings, cursor, view]);

  function shiftPeriod(dir: -1 | 1) {
    setCursor((prev) => {
      const n = new Date(prev);
      if (view === "day") {
        n.setDate(n.getDate() + dir);
        return n;
      }
      n.setDate(n.getDate() + dir * 7);
      return n;
    });
  }

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-serif font-bold text-[18px] text-(--text-1)">Calendar</h2>
          <p className="font-sans text-sm text-(--text-2) mt-1">See your day in seconds — click a booking to open details.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl border border-white/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setView("week")}
              className={`px-3 py-2 text-xs font-semibold font-sans ${view === "week" ? "bg-(--brand-primary) text-white" : "bg-white/60"}`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setView("day")}
              className={`px-3 py-2 text-xs font-semibold font-sans ${view === "day" ? "bg-(--brand-primary) text-white" : "bg-white/60"}`}
            >
              Day
            </button>
          </div>
          <button
            type="button"
            onClick={() => shiftPeriod(-1)}
            className="rounded-xl px-3 py-2 text-xs font-semibold border border-white/60 bg-white/70"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setCursor(new Date())}
            className="rounded-xl px-3 py-2 text-xs font-semibold border border-white/60 bg-white/70"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => shiftPeriod(1)}
            className="rounded-xl px-3 py-2 text-xs font-semibold border border-white/60 bg-white/70"
          >
            Next
          </button>
          <Link
            href="/producer/inbox?new=1"
            className="rounded-xl px-3 py-2 text-xs font-semibold bg-(--brand-primary) text-white"
          >
            + Booking
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl card p-8 text-center font-sans text-sm text-(--text-2)">Loading calendar…</div>
      ) : (
        <div
          className={`grid gap-3 ${view === "day" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-7"}`}
        >
          {byDay.days.map((day) => {
            const key = new Date(day.getFullYear(), day.getMonth(), day.getDate()).toDateString();
            const items = byDay.map.get(key) ?? [];
            return (
              <div key={key} className="rounded-xl border border-white/50 bg-white/40 p-3 min-h-[120px] flex flex-col gap-2">
                <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-(--text-2)">{formatDayLabel(day)}</p>
                {items.length === 0 ? (
                  <Link
                    href="/producer/inbox?new=1"
                    className="mt-auto text-center font-sans text-xs text-(--text-2) py-4 rounded-lg border border-dashed border-white/50 hover:bg-white/30"
                  >
                    Empty slot — create booking
                  </Link>
                ) : (
                  items.map((b) => (
                    <Link
                      key={b.id}
                      href={`/producer/bookings/${b.id}`}
                      className={`block rounded-lg px-3 py-2 bg-white/80 border border-white/60 border-l-4 ${statusColor(b.status)} hover:opacity-95`}
                    >
                      <p className="font-sans text-xs font-semibold text-(--text-1)">
                        {formatTime(new Date(b.startAt))} — {b.activityTitle}
                      </p>
                      <p className="font-sans text-[11px] text-(--text-2) mt-0.5">
                        {b.customerName} · {b.peopleCount} ppl · {b.status}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
