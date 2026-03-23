"use client";

import Link from "next/link";
import type React from "react";
import { useState, useTransition } from "react";
import { updateCustomerNotes } from "~/app/api/customers/actions";
import type { CustomerDetailRow } from "~/app/api/customers/schemas/customers.schema";

type Props = {
	customer: CustomerDetailRow;
};

function formatDate(value: Date) {
	return new Intl.DateTimeFormat("en-MA", { dateStyle: "medium" }).format(
		value,
	);
}

export function CustomerDetailView({ customer }: Props) {
	const [notes, setNotes] = useState(customer.notes ?? "");
	const [msg, setMsg] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	function saveNotes(e: React.FormEvent) {
		e.preventDefault();
		setMsg(null);
		startTransition(async () => {
			try {
				await updateCustomerNotes({
					customerId: customer.id,
					notes: notes.trim() || null,
				});
				setMsg("Notes saved.");
			} catch {
				setMsg("Could not save notes.");
			}
		});
	}

	return (
		<div className="flex max-w-3xl flex-col gap-6 p-4 lg:p-6">
			<div>
				<Link
					className="font-sans text-(--text-2) text-xs hover:underline"
					href="/producer/customers"
				>
					← Customers
				</Link>
				<h2 className="mt-2 font-bold font-serif text-(--text-1) text-[20px]">
					{customer.name}
				</h2>
				<p className="font-sans text-(--text-2) text-sm">{customer.phone}</p>
			</div>

			<section className="card rounded-xl p-5">
				<h3 className="font-bold font-serif text-(--text-1) text-lg">
					Bookings
				</h3>
				<ul className="mt-3 flex flex-col gap-2">
					{customer.bookings.length === 0 && (
						<li className="font-sans text-(--text-2) text-sm">
							No bookings yet.
						</li>
					)}
					{customer.bookings.map((b) => (
						<li
							className="flex items-center justify-between gap-2 border-white/40 border-b pb-2 last:border-0"
							key={b.id}
						>
							<div>
								<Link
									className="font-sans font-semibold text-(--text-1) text-sm hover:underline"
									href={`/producer/bookings/${b.id}`}
								>
									{b.activityTitle}
								</Link>
								<p className="font-sans text-(--text-2) text-xs">
									{formatDate(b.startAt)} · {b.status}
								</p>
							</div>
							<span className="font-sans text-(--text-1) text-sm">
								{(b.priceCents / 100).toLocaleString("en-MA")} MAD
							</span>
						</li>
					))}
				</ul>
			</section>

			<form
				className="card flex flex-col gap-3 rounded-xl p-5"
				onSubmit={saveNotes}
			>
				<h3 className="font-bold font-serif text-(--text-1) text-lg">Notes</h3>
				<textarea
					className="rounded-lg border border-white/70 bg-white/80 px-3 py-2 text-sm"
					onChange={(e) => setNotes(e.target.value)}
					placeholder="VIP client, preferences, special requests…"
					rows={5}
					value={notes}
				/>
				<div className="flex items-center gap-3">
					<button
						className="rounded-xl bg-(--brand-primary) px-4 py-2 font-semibold text-sm text-white disabled:opacity-50"
						disabled={pending}
						type="submit"
					>
						{pending ? "Saving…" : "Save notes"}
					</button>
					{msg && (
						<span className="font-sans text-(--text-2) text-sm">{msg}</span>
					)}
				</div>
			</form>
		</div>
	);
}
