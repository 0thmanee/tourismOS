"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import type { BookingDetailRow } from "~/app/api/bookings";
import { useUpdateBooking } from "../../hooks/use-mvp-bookings";

type Props = {
	booking: BookingDetailRow;
};

export function BookingEditForm({ booking }: Props) {
	const router = useRouter();
	const [activityTitle, setActivityTitle] = useState(booking.activityTitle);
	const [date, setDate] = useState(() =>
		new Date(booking.startAt).toISOString().slice(0, 10),
	);
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
		<section className="card flex flex-col gap-3 rounded-xl p-5">
			<h3 className="font-bold font-serif text-(--text-1) text-lg">
				Edit booking
			</h3>
			<p className="font-sans text-(--text-2) text-sm">
				Reschedule or update details — availability rules apply.
			</p>
			<form
				className="grid grid-cols-1 gap-3 sm:grid-cols-2"
				onSubmit={onSubmit}
			>
				<label className="flex flex-col gap-1">
					<span className="font-sans text-(--text-2) text-xs">Activity</span>
					<input
						className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
						onChange={(e) => setActivityTitle(e.target.value)}
						required
						value={activityTitle}
					/>
				</label>
				<label className="flex flex-col gap-1">
					<span className="font-sans text-(--text-2) text-xs">People</span>
					<input
						className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
						min={1}
						onChange={(e) =>
							setPeopleCount(Math.max(1, Number(e.target.value)))
						}
						type="number"
						value={peopleCount}
					/>
				</label>
				<label className="flex flex-col gap-1">
					<span className="font-sans text-(--text-2) text-xs">Date</span>
					<input
						className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
						onChange={(e) => setDate(e.target.value)}
						type="date"
						value={date}
					/>
				</label>
				<label className="flex flex-col gap-1">
					<span className="font-sans text-(--text-2) text-xs">Time</span>
					<input
						className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
						onChange={(e) => setTime(e.target.value)}
						type="time"
						value={time}
					/>
				</label>
				<label className="flex flex-col gap-1 sm:col-span-2">
					<span className="font-sans text-(--text-2) text-xs">Price (MAD)</span>
					<input
						className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
						min={0}
						onChange={(e) => setPriceMad(Math.max(0, Number(e.target.value)))}
						step={1}
						type="number"
						value={priceMad}
					/>
				</label>
				<div className="sm:col-span-2">
					<button
						className="rounded-lg bg-(--brand-primary) px-4 py-2 font-semibold text-sm text-white disabled:opacity-50"
						disabled={mutation.isPending}
						type="submit"
					>
						{mutation.isPending ? "Saving…" : "Save changes"}
					</button>
					{mutation.isError && (
						<p className="mt-2 font-sans text-red-500 text-sm">
							Could not update booking.
						</p>
					)}
				</div>
			</form>
		</section>
	);
}
