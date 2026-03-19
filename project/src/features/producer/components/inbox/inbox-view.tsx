"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { BookingMessageSender, BookingStatus, PaymentStatus } from "~/app/api/bookings";
import {
  useCancelBooking,
  useConfirmBooking,
  useCreateBooking,
  useInboxBookingDetail,
  useInboxBookings,
  useMarkDeposit,
  useSendBookingMessage,
} from "../../hooks/use-inbox";

type CreateBookingFormState = {
  customerName: string;
  customerPhone: string;
  activityTitle: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  peopleCount: number;
  priceMad: number;
  initialNote: string;
};

function formatMad(cents: number | null | undefined) {
  const value = cents ?? 0;
  const mad = value / 100;
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(mad);
}

function formatDateTime(value: Date | string) {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function getStatusBadgeClass(status: BookingStatus): string {
  switch (status) {
    case "NEW":
      return "badge badge-new";
    case "PENDING":
      return "badge badge-pending";
    case "CONFIRMED":
      return "badge badge-confirmed";
    case "CANCELLED":
      return "badge badge-cancelled";
  }
}

function getPaymentBadgeClass(paymentStatus: PaymentStatus): string {
  switch (paymentStatus) {
    case "UNPAID":
      return "badge";
    case "DEPOSIT":
      return "badge badge-pending";
    case "PAID":
      return "badge badge-confirmed";
  }
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function toGoogleCalendarUrl(startAt: Date, title: string) {
  const endAt = new Date(startAt.getTime() + 60 * 60 * 1000); // 1h default duration for MVP
  const toStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const start = toStamp(startAt);
  const end = toStamp(endAt);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}`;
}

function ModalShell({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[520px] rounded-2xl card">
        <div className="px-6 py-4 border-b border-(--app-border)">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-serif font-bold text-[16px] text-(--text-1)">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors btn btn-ghost border-accent"
            >
              <span className="text-lg leading-none">X</span>
            </button>
          </div>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-sans text-sm font-semibold text-(--text-2)">{label}</span>
      <input
        value={value}
        type={type}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl px-4 py-2 field"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-sans text-sm font-semibold text-(--text-2)">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl px-4 py-2 field"
        rows={3}
      />
    </label>
  );
}

export function InboxView() {
  const { data: bookings = [], isLoading } = useInboxBookings();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setCreateOpen(true);
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("new");
      const qs = nextParams.toString();
      router.replace(qs ? `/producer/inbox?${qs}` : "/producer/inbox");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  useEffect(() => {
    if (!selectedBookingId && bookings.length > 0) {
      setSelectedBookingId(bookings[0]!.id);
    }
  }, [bookings, selectedBookingId]);

  useEffect(() => {
    setMessageDraft("");
  }, [selectedBookingId]);

  const {
    data: selectedBooking,
    isLoading: isDetailLoading,
  } = useInboxBookingDetail(selectedBookingId);

  const createBookingMutation = useCreateBooking();
  const confirmMutation = useConfirmBooking();
  const cancelMutation = useCancelBooking();
  const markDepositMutation = useMarkDeposit();
  const sendMessageMutation = useSendBookingMessage();

  const [form, setForm] = useState<CreateBookingFormState>(() => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = "10:00";
    return {
      customerName: "",
      customerPhone: "",
      activityTitle: "",
      date,
      time,
      peopleCount: 1,
      priceMad: 0,
      initialNote: "",
    };
  });

  const canSubmit = useMemo(() => {
    return form.customerName.trim() && form.customerPhone.trim() && form.activityTitle.trim() && form.date && form.time && form.peopleCount >= 1;
  }, [form]);

  const [messageDraft, setMessageDraft] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositMad, setDepositMad] = useState<number>(0);

  function statusBadge(status: BookingStatus) {
    const cls = getStatusBadgeClass(status);
    return (
      <span className={`font-sans text-[10px] font-bold tracking-wide rounded-full px-2.5 py-1 uppercase ${cls}`}>
        {status}
      </span>
    );
  }

  function paymentBadge(paymentStatus: PaymentStatus) {
    const cls = getPaymentBadgeClass(paymentStatus);
    return (
      <span className={`font-sans text-[10px] font-bold tracking-wide rounded-full px-2.5 py-1 uppercase ${cls}`}>
        {paymentStatus}
      </span>
    );
  }

  async function onCreate() {
    if (!canSubmit) return;
    const startAtISO = new Date(`${form.date}T${form.time}:00`).toISOString();

    await createBookingMutation.mutateAsync({
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      activityTitle: form.activityTitle.trim(),
      startAtISO,
      peopleCount: form.peopleCount,
      priceMad: form.priceMad,
      initialNote: form.initialNote.trim() ? form.initialNote.trim() : null,
    });

    setCreateOpen(false);
    setForm((prev) => ({
      ...prev,
      customerName: "",
      customerPhone: "",
      activityTitle: "",
      peopleCount: 1,
      priceMad: 0,
      initialNote: "",
    }));
  }

  async function onSendMessage() {
    if (!selectedBooking) return;
    const body = messageDraft.trim();
    if (!body) return;

    await sendMessageMutation.mutateAsync({
      bookingId: selectedBooking.id,
      body,
    });

    setMessageDraft("");
  }

  function openDepositModal() {
    if (!selectedBooking) return;
    setDepositOpen(true);
    setDepositMad(
      selectedBooking.depositCents !== null ? Math.round(selectedBooking.depositCents / 100) : Math.round(selectedBooking.priceCents / 200),
    );
  }

  async function onConfirmDeposit() {
    if (!selectedBooking) return;
    await markDepositMutation.mutateAsync({
      bookingId: selectedBooking.id,
      depositMad: depositMad,
    });
    setDepositOpen(false);
  }

  function renderConversation(messages: Array<{ id: string; sender: BookingMessageSender; body: string; createdAt: Date | string }>) {
    if (!messages.length) {
      return (
        <div className="rounded-xl p-4 field">
          <p className="font-sans text-sm text-(--text-2)">No messages yet. Send the first message below.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === "OPERATOR" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-2xl px-4 py-3 max-w-[80%] border ${
                m.sender === "OPERATOR"
                  ? "bg-forest-dark text-white border-white/10"
                  : "card text-(--text-1)"
              }`}
            >
              <p className="font-sans text-sm font-semibold">{m.body}</p>
              <p className={`font-sans text-[10px] mt-1 ${m.sender === "OPERATOR" ? "text-white/70" : "text-(--text-2)"}`}>
                {formatDateTime(m.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col">
          <h2 className="font-serif font-bold text-[18px] text-(--text-1)">Inbox</h2>
          <p className="font-sans text-sm text-(--text-2) mt-1">
            Your booking conversations, organized (by status).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="font-sans text-sm font-semibold rounded-xl px-4 py-2 transition-colors btn producer-new-booking"
        >
          + New Booking
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        <div className="rounded-xl overflow-hidden card">
          <div className="px-4 py-3 border-b border-(--app-border)">
            <p className="font-sans text-[11px] font-bold tracking-wide text-(--text-2) uppercase">Conversations</p>
          </div>
          {isLoading ? (
            <div className="p-6 text-center font-sans text-sm text-(--text-2)">Loading…</div>
          ) : bookings.length === 0 ? (
            <div className="p-6 text-center flex flex-col gap-2">
              <p className="font-sans text-sm text-(--text-2)">No bookings yet.</p>
              <p className="font-sans text-xs text-(--text-2)">Create the first one with “New Booking”.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {bookings.map((b) => {
                const active = b.id === selectedBookingId;
                const badgeClass = getStatusBadgeClass(b.status);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBookingId(b.id)}
                    className={`text-left px-4 py-3 border-b border-(--app-border) last:border-b-0 transition-colors ${
                      active ? "bg-gold/10" : "bg-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-sans font-bold text-xs shrink-0 ${
                          active ? "bg-gold text-forest-dark" : "bg-black/5 text-(--text-2)"
                        }`}
                      >
                        {initialsFromName(b.customerName || "—")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-sans font-semibold text-sm text-(--text-1) truncate">
                            {b.customerName} - {b.activityTitle}
                          </p>
                        </div>
                        <p className="font-sans text-[11px] text-(--text-2) mt-1">
                          {formatDateTime(b.startAt)}
                        </p>
                      </div>
                      <span
                        className={`font-sans text-[10px] font-bold tracking-wide rounded-full px-2.5 py-1 uppercase ${badgeClass}`}
                      >
                        {b.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl overflow-hidden card">
          <div className="px-4 py-3 border-b border-(--app-border) flex items-center justify-between gap-3">
            <p className="font-sans text-[11px] font-bold tracking-wide text-(--text-2) uppercase">Booking details</p>
            {selectedBooking && (
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {statusBadge(selectedBooking.status)}
                {paymentBadge(selectedBooking.paymentStatus)}
              </div>
            )}
          </div>

          {isDetailLoading ? (
            <div className="p-6 text-center font-sans text-sm text-(--text-2)">Loading details…</div>
          ) : !selectedBooking ? (
            <div className="p-6 text-center">
              <p className="font-sans text-sm text-(--text-2)">Select a conversation to see details.</p>
            </div>
          ) : (
            <div className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl p-4 field">
                  <p className="font-sans text-xs uppercase tracking-wide font-bold text-(--text-2)">Customer</p>
                  <p className="font-serif font-bold text-[16px] text-(--text-1) mt-2">{selectedBooking.customerName}</p>
                  <p className="font-sans text-sm text-(--text-2) mt-1">{selectedBooking.customerPhone}</p>
                </div>
                <div className="rounded-xl p-4 field">
                  <p className="font-sans text-xs uppercase tracking-wide font-bold text-(--text-2)">Activity</p>
                  <p className="font-serif font-bold text-[16px] text-(--text-1) mt-2">{selectedBooking.activityTitle}</p>
                  <p className="font-sans text-sm text-(--text-2) mt-1">
                    {formatDateTime(selectedBooking.startAt)} · {selectedBooking.peopleCount} people
                  </p>
                </div>
              </div>

              <div className="rounded-xl p-4 card">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-sans text-xs uppercase tracking-wide font-bold text-(--text-2)">Price</p>
                    <p className="font-serif font-bold text-[18px] text-(--text-1) mt-2">{formatMad(selectedBooking.priceCents)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-xs uppercase tracking-wide font-bold text-(--text-2)">Deposit</p>
                    <p className="font-sans text-sm text-(--text-2) mt-2">
                      {selectedBooking.paymentStatus === "UNPAID"
                        ? "Not marked yet"
                        : selectedBooking.paymentStatus === "DEPOSIT"
                          ? selectedBooking.depositCents !== null
                            ? `Deposit received (${formatMad(selectedBooking.depositCents)})`
                            : "Deposit received"
                          : "Paid"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky top-4 rounded-xl px-4 py-3 card">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={confirmMutation.isPending || selectedBooking.status === "CONFIRMED" || selectedBooking.status === "CANCELLED"}
                    onClick={() => confirmMutation.mutate({ bookingId: selectedBooking.id, status: "CONFIRMED" })}
                    className="font-sans text-sm font-semibold rounded-xl px-4 py-2 transition-colors border bg-zellige-teal/10 text-zellige-teal border-zellige-teal/20 disabled:opacity-60"
                  >
                    Confirm Booking
                  </button>
                  <button
                    type="button"
                    disabled={cancelMutation.isPending || selectedBooking.status === "CANCELLED"}
                    onClick={() => cancelMutation.mutate({ bookingId: selectedBooking.id, status: "CANCELLED" })}
                    className="font-sans text-sm font-semibold rounded-xl px-4 py-2 transition-colors border bg-red-400/10 text-red-600 border-red-400/20 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={markDepositMutation.isPending || selectedBooking.paymentStatus === "PAID"}
                    onClick={openDepositModal}
                    className="font-sans text-sm font-semibold rounded-xl px-4 py-2 transition-colors btn btn-ghost border-accent disabled:opacity-60"
                  >
                    Mark Deposit
                  </button>
                  <a
                    href={toGoogleCalendarUrl(new Date(selectedBooking.startAt), `${selectedBooking.activityTitle} - ${selectedBooking.customerName}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-sans text-sm font-semibold rounded-xl px-4 py-2 transition-colors btn producer-new-booking"
                  >
                    Add to Calendar
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <p className="font-sans text-[11px] font-bold tracking-wide text-(--text-2) uppercase">Conversation</p>
                {renderConversation(selectedBooking.messages)}
                <div className="flex flex-col gap-3 pt-1">
                  <TextArea
                    label="Your reply"
                    value={messageDraft}
                    onChange={(v) => setMessageDraft(v)}
                    placeholder="Write a message to the customer..."
                  />
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      className="font-sans text-sm font-semibold rounded-xl px-4 py-2 transition-colors btn btn-ghost border-accent"
                      onClick={() => setMessageDraft("")}
                      disabled={sendMessageMutation.isPending || !messageDraft.trim()}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      className="font-sans text-sm font-semibold rounded-xl px-4 py-2 transition-colors disabled:opacity-60 btn producer-new-booking"
                      onClick={onSendMessage}
                      disabled={sendMessageMutation.isPending || !messageDraft.trim()}
                    >
                      {sendMessageMutation.isPending ? "Sending…" : "Send"}
                    </button>
                  </div>
                  {sendMessageMutation.error && (
                    <p className="font-sans text-sm text-red-500">
                      Failed to send message
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ModalShell
        open={createOpen}
        onClose={() => {
          if (!createBookingMutation.isPending) setCreateOpen(false);
        }}
        title="New Booking"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Customer name"
              value={form.customerName}
              onChange={(v) => setForm((p) => ({ ...p, customerName: v }))}
              placeholder="Ahmed"
            />
            <Input
              label="Phone"
              value={form.customerPhone}
              onChange={(v) => setForm((p) => ({ ...p, customerPhone: v }))}
              placeholder="+2126…"
            />
            <Input
              label="Activity"
              value={form.activityTitle}
              onChange={(v) => setForm((p) => ({ ...p, activityTitle: v }))}
              placeholder="Desert Tour"
            />
            <Input
              label="People"
              value={form.peopleCount}
              type="number"
              onChange={(v) => setForm((p) => ({ ...p, peopleCount: Math.max(1, Number(v)) }))}
              placeholder="2"
            />
            <Input
              label="Date"
              value={form.date}
              type="date"
              onChange={(v) => setForm((p) => ({ ...p, date: v }))}
            />
            <Input
              label="Time"
              value={form.time}
              type="time"
              onChange={(v) => setForm((p) => ({ ...p, time: v }))}
            />
            <Input
              label="Price (MAD)"
              value={form.priceMad}
              type="number"
              onChange={(v) => setForm((p) => ({ ...p, priceMad: Math.max(0, Number(v)) }))}
              placeholder="800"
            />
          </div>
          <TextArea
            label="Initial note (optional)"
            value={form.initialNote}
            onChange={(v) => setForm((p) => ({ ...p, initialNote: v }))}
            placeholder="Example: Customer asked about pick-up at 9:00 AM."
          />

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="font-sans text-sm font-semibold rounded-xl px-4 py-2 transition-colors btn btn-ghost border-accent"
              onClick={() => setCreateOpen(false)}
              disabled={createBookingMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className="font-sans text-sm font-semibold rounded-xl px-4 py-2 transition-colors disabled:opacity-60 btn producer-new-booking"
              onClick={onCreate}
              disabled={!canSubmit || createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? "Creating…" : "Create Booking"}
            </button>
          </div>
          {createBookingMutation.error && (
            <p className="font-sans text-sm text-red-500">
              {createBookingMutation.error instanceof Error ? createBookingMutation.error.message : "Failed to create booking"}
            </p>
          )}
        </div>
      </ModalShell>

      <ModalShell
        open={depositOpen}
        onClose={() => {
          if (!markDepositMutation.isPending) setDepositOpen(false);
        }}
        title="Mark deposit"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Deposit amount (MAD)"
            value={depositMad}
            type="number"
            onChange={(v) => setDepositMad(Math.max(0, Number(v)))}
            placeholder="400"
          />

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="font-sans text-sm font-semibold rounded-xl px-4 py-2 transition-colors btn btn-ghost border-accent"
              onClick={() => setDepositOpen(false)}
              disabled={markDepositMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              className="font-sans text-sm font-semibold rounded-xl px-4 py-2 transition-colors disabled:opacity-60 btn producer-new-booking"
              onClick={onConfirmDeposit}
              disabled={markDepositMutation.isPending || depositMad < 0}
            >
              {markDepositMutation.isPending ? "Marking…" : "Confirm deposit"}
            </button>
          </div>

          {markDepositMutation.error && (
            <p className="font-sans text-sm text-red-500">
              Failed to mark deposit
            </p>
          )}
        </div>
      </ModalShell>
    </div>
  );
}

