"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
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
	return new Intl.DateTimeFormat("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
	}).format(d);
}

function formatTime(d: Date) {
	return new Intl.DateTimeFormat("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
	}).format(d);
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
				: Array.from({ length: 7 }, (_, i) =>
						addDays(startOfWeekMonday(cursor), i),
					);

		for (const d of days) {
			const key = new Date(
				d.getFullYear(),
				d.getMonth(),
				d.getDate(),
			).toDateString();
			map.set(key, []);
		}
		for (const b of bookings) {
			const start = new Date(b.startAt);
			const end = b.endAt ? new Date(b.endAt) : start;
			let cursor = new Date(
				start.getFullYear(),
				start.getMonth(),
				start.getDate(),
			);
			const endDay = new Date(
				end.getFullYear(),
				end.getMonth(),
				end.getDate(),
			);
			while (cursor <= endDay) {
				const key = cursor.toDateString();
				if (map.has(key)) {
					map.get(key)!.push(b);
				}
				cursor.setDate(cursor.getDate() + 1);
			}
		}
		for (const arr of map.values()) {
			arr.sort(
				(a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
			);
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
		<div className="flex flex-col gap-4 p-4 lg:p-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="font-bold font-serif text-(--text-1) text-[18px]">
						Calendar
					</h2>
					<p className="mt-1 font-sans text-(--text-2) text-sm">
						See your day in seconds — click a booking to open details.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<div className="flex overflow-hidden rounded-xl border border-white/50">
						<button
							className={`px-3 py-2 font-sans font-semibold text-xs ${view === "week" ? "bg-(--brand-primary) text-white" : "bg-white/60"}`}
							onClick={() => setView("week")}
							type="button"
						>
							Week
						</button>
						<button
							className={`px-3 py-2 font-sans font-semibold text-xs ${view === "day" ? "bg-(--brand-primary) text-white" : "bg-white/60"}`}
							onClick={() => setView("day")}
							type="button"
						>
							Day
						</button>
					</div>
					<button
						className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 font-semibold text-xs"
						onClick={() => shiftPeriod(-1)}
						type="button"
					>
						Prev
					</button>
					<button
						className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 font-semibold text-xs"
						onClick={() => setCursor(new Date())}
						type="button"
					>
						Today
					</button>
					<button
						className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 font-semibold text-xs"
						onClick={() => shiftPeriod(1)}
						type="button"
					>
						Next
					</button>
					<Link
						className="rounded-xl bg-(--brand-primary) px-3 py-2 font-semibold text-white text-xs"
						href="/producer/inbox?new=1"
					>
						+ Booking
					</Link>
				</div>
			</div>

			{isLoading ? (
				<div className="card rounded-xl p-8 text-center font-sans text-(--text-2) text-sm">
					Loading calendar…
				</div>
			) : (
				<div
					className={`grid gap-3 ${view === "day" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-7"}`}
				>
					{byDay.days.map((day) => {
						const key = new Date(
							day.getFullYear(),
							day.getMonth(),
							day.getDate(),
						).toDateString();
						const items = byDay.map.get(key) ?? [];
						return (
							<div
								className="flex min-h-[120px] flex-col gap-2 rounded-xl border border-white/50 bg-white/40 p-3"
								key={key}
							>
								<p className="font-bold font-sans text-(--text-2) text-[11px] uppercase tracking-widest">
									{formatDayLabel(day)}
								</p>
								{items.length === 0 ? (
									<Link
										className="mt-auto rounded-lg border border-white/50 border-dashed py-4 text-center font-sans text-(--text-2) text-xs hover:bg-white/30"
										href="/producer/inbox?new=1"
									>
										Empty slot — create booking
									</Link>
								) : (
									items.map((b) => (
										<Link
											className={`block rounded-lg border border-white/60 border-l-4 bg-white/80 px-3 py-2 ${statusColor(b.status)} hover:opacity-95`}
											href={`/producer/bookings/${b.id}`}
											key={b.id}
										>
											<p className="font-sans font-semibold text-(--text-1) text-xs">
												{formatTime(new Date(b.startAt))} — {b.activityTitle}
											</p>
											<p className="mt-0.5 font-sans text-(--text-2) text-[11px]">
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
