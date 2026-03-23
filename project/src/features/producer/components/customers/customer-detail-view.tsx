"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { updateCustomerNotes } from "~/app/api/customers/actions";
import type { CustomerDetailRow } from "~/app/api/customers/schemas/customers.schema";

type Props = {
  customer: CustomerDetailRow;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-MA", { dateStyle: "medium" }).format(value);
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
        await updateCustomerNotes({ customerId: customer.id, notes: notes.trim() || null });
        setMsg("Notes saved.");
      } catch {
        setMsg("Could not save notes.");
      }
    });
  }

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6 max-w-3xl">
      <div>
        <Link href="/producer/customers" className="font-sans text-xs text-(--text-2) hover:underline">
          ← Customers
        </Link>
        <h2 className="font-serif font-bold text-[20px] text-(--text-1) mt-2">{customer.name}</h2>
        <p className="font-sans text-sm text-(--text-2)">{customer.phone}</p>
      </div>

      <section className="card rounded-xl p-5">
        <h3 className="font-serif font-bold text-lg text-(--text-1)">Bookings</h3>
        <ul className="mt-3 flex flex-col gap-2">
          {customer.bookings.length === 0 && (
            <li className="font-sans text-sm text-(--text-2)">No bookings yet.</li>
          )}
          {customer.bookings.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-2 border-b border-white/40 pb-2 last:border-0">
              <div>
                <Link href={`/producer/bookings/${b.id}`} className="font-sans font-semibold text-sm text-(--text-1) hover:underline">
                  {b.activityTitle}
                </Link>
                <p className="font-sans text-xs text-(--text-2)">
                  {formatDate(b.startAt)} · {b.status}
                </p>
              </div>
              <span className="font-sans text-sm text-(--text-1)">
                {(b.priceCents / 100).toLocaleString("en-MA")} MAD
              </span>
            </li>
          ))}
        </ul>
      </section>

      <form onSubmit={saveNotes} className="card rounded-xl p-5 flex flex-col gap-3">
        <h3 className="font-serif font-bold text-lg text-(--text-1)">Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="VIP client, preferences, special requests…"
          className="rounded-lg border border-white/70 bg-white/80 px-3 py-2 text-sm"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl px-4 py-2 text-sm font-semibold bg-(--brand-primary) text-white disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save notes"}
          </button>
          {msg && <span className="font-sans text-sm text-(--text-2)">{msg}</span>}
        </div>
      </form>
    </div>
  );
}
