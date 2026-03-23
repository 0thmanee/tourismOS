"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import type { ActivityRow } from "~/app/api/activities";
import type {
	BookingMessageSender,
	BookingStatus,
	PaymentStatus,
} from "~/app/api/bookings";
import {
	useCancelBooking,
	useConfirmBooking,
	useCreateBooking,
	useInboxBookingDetail,
	useInboxBookings,
	useMarkDeposit,
	useProducerActivities,
	useSendBookingMessage,
} from "../../hooks/use-inbox";

type CreateBookingFormState = {
	customerName: string;
	customerPhone: string;
	activitySource: "catalog" | "custom";
	activityId: string;
	activityTitle: string;
	date: string; // YYYY-MM-DD
	time: string; // HH:mm
	slotTime: string;
	durationDays: number;
	resourceUnits: number;
	peopleCount: number;
	priceMad: number;
	initialNote: string;
};

function formatActivityKindLabel(kind: ActivityRow["kind"]): string {
	switch (kind) {
		case "FIXED_SLOT":
			return "Fixed slots";
		case "FLEXIBLE":
			return "Flexible";
		case "MULTI_DAY":
			return "Multi-day";
		case "RESOURCE_BASED":
			return "Resource-based";
		default:
			return kind;
	}
}

function describeBookingMeta(
	meta: unknown,
	activityKind: string | null,
): string | null {
	if (!meta || typeof meta !== "object") return null;
	const m = meta as Record<string, unknown>;
	const parts: string[] = [];
	if (activityKind) {
		parts.push(formatActivityKindLabel(activityKind as ActivityRow["kind"]));
	}
	if (typeof m.slotTime === "string") parts.push(`Slot ${m.slotTime}`);
	if (typeof m.durationDays === "number") parts.push(`${m.durationDays} day(s)`);
	if (typeof m.resourceUnits === "number")
		parts.push(`${m.resourceUnits} unit(s)`);
	return parts.length > 1 ? parts.join(" · ") : parts[0] ?? null;
}

function formatMad(cents: number | null | undefined) {
	const value = cents ?? 0;
	const mad = value / 100;
	return new Intl.NumberFormat("fr-MA", {
		style: "currency",
		currency: "MAD",
	}).format(mad);
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

function toGoogleCalendarUrl(startAt: Date, endAt: Date, title: string) {
	const toStamp = (d: Date) =>
		d
			.toISOString()
			.replace(/[-:]/g, "")
			.replace(/\.\d{3}Z$/, "Z");
	const start = toStamp(startAt);
	const end = toStamp(endAt);
	return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}`;
}

function defaultCreateForm(): CreateBookingFormState {
	const now = new Date();
	const date = now.toISOString().slice(0, 10);
	return {
		customerName: "",
		customerPhone: "",
		activitySource: "catalog",
		activityId: "",
		activityTitle: "",
		date,
		time: "10:00",
		slotTime: "",
		durationDays: 1,
		resourceUnits: 1,
		peopleCount: 1,
		priceMad: 0,
		initialNote: "",
	};
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
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />
			<div className="card relative w-full max-w-[520px] rounded-2xl">
				<div className="border-(--app-border) border-b px-6 py-4">
					<div className="flex items-center justify-between gap-3">
						<h3 className="font-bold font-serif text-(--text-1) text-[16px]">
							{title}
						</h3>
						<button
							className="btn btn-ghost flex h-9 w-9 items-center justify-center rounded-xl border-accent transition-colors"
							onClick={onClose}
							type="button"
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
			<span className="font-sans font-semibold text-(--text-2) text-sm">
				{label}
			</span>
			<input
				className="field rounded-xl px-4 py-2"
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				type={type}
				value={value}
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
			<span className="font-sans font-semibold text-(--text-2) text-sm">
				{label}
			</span>
			<textarea
				className="field rounded-xl px-4 py-2"
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				rows={3}
				value={value}
			/>
		</label>
	);
}

export function InboxView() {
	const { data: bookings = [], isLoading } = useInboxBookings();
	const { data: activities = [], isLoading: activitiesLoading } =
		useProducerActivities();
	const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
		null,
	);
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

	const { data: selectedBooking, isLoading: isDetailLoading } =
		useInboxBookingDetail(selectedBookingId);

	const createBookingMutation = useCreateBooking();
	const confirmMutation = useConfirmBooking();
	const cancelMutation = useCancelBooking();
	const markDepositMutation = useMarkDeposit();
	const sendMessageMutation = useSendBookingMessage();

	const [form, setForm] = useState<CreateBookingFormState>(defaultCreateForm);

	const selectedActivity = useMemo((): ActivityRow | null => {
		if (form.activitySource !== "catalog" || !form.activityId) return null;
		return activities.find((a) => a.id === form.activityId) ?? null;
	}, [activities, form.activityId, form.activitySource]);

	useEffect(() => {
		if (!selectedActivity) return;
		setForm((prev) => ({
			...prev,
			priceMad:
				selectedActivity.defaultPriceMad != null
					? selectedActivity.defaultPriceMad
					: prev.priceMad,
			slotTime:
				selectedActivity.kind === "FIXED_SLOT" &&
				selectedActivity.fixedSlots.length > 0
					? selectedActivity.fixedSlots.includes(prev.slotTime)
						? prev.slotTime
						: selectedActivity.fixedSlots[0]!
					: prev.slotTime,
			durationDays:
				selectedActivity.kind === "MULTI_DAY"
					? selectedActivity.defaultDurationDays
					: prev.durationDays,
		}));
	}, [selectedActivity?.id]);

	const canSubmit = useMemo(() => {
		const base =
			Boolean(form.customerName.trim()) &&
			Boolean(form.customerPhone.trim()) &&
			Boolean(form.date) &&
			form.peopleCount >= 1;

		if (!base) return false;

		if (form.activitySource === "custom") {
			return Boolean(form.activityTitle.trim() && form.time);
		}

		if (!form.activityId || !selectedActivity) return false;

		switch (selectedActivity.kind) {
			case "FIXED_SLOT":
				return (
					Boolean(form.slotTime) &&
					selectedActivity.fixedSlots.includes(form.slotTime)
				);
			case "FLEXIBLE":
				return Boolean(form.time);
			case "MULTI_DAY":
				return form.durationDays >= 1;
			case "RESOURCE_BASED":
				return Boolean(form.time) && form.resourceUnits >= 1;
			default:
				return Boolean(form.time);
		}
	}, [form, selectedActivity]);

	const [messageDraft, setMessageDraft] = useState("");
	const [depositOpen, setDepositOpen] = useState(false);
	const [depositMad, setDepositMad] = useState<number>(0);

	function statusBadge(status: BookingStatus) {
		const cls = getStatusBadgeClass(status);
		return (
			<span
				className={`rounded-full px-2.5 py-1 font-bold font-sans text-[10px] uppercase tracking-wide ${cls}`}
			>
				{status}
			</span>
		);
	}

	function paymentBadge(paymentStatus: PaymentStatus) {
		const cls = getPaymentBadgeClass(paymentStatus);
		return (
			<span
				className={`rounded-full px-2.5 py-1 font-bold font-sans text-[10px] uppercase tracking-wide ${cls}`}
			>
				{paymentStatus}
			</span>
		);
	}

	function buildStartAtISO(): string {
		if (form.activitySource === "custom" || !selectedActivity) {
			return new Date(`${form.date}T${form.time}:00`).toISOString();
		}
		if (selectedActivity.kind === "FIXED_SLOT") {
			return new Date(`${form.date}T12:00:00`).toISOString();
		}
		return new Date(`${form.date}T${form.time}:00`).toISOString();
	}

	async function onCreate() {
		if (!canSubmit) return;
		const startAtISO = buildStartAtISO();

		const meta: {
			slotTime?: string;
			durationDays?: number;
			resourceUnits?: number;
		} = {};
		if (selectedActivity?.kind === "FIXED_SLOT") meta.slotTime = form.slotTime;
		if (selectedActivity?.kind === "MULTI_DAY")
			meta.durationDays = form.durationDays;
		if (selectedActivity?.kind === "RESOURCE_BASED")
			meta.resourceUnits = form.resourceUnits;

		await createBookingMutation.mutateAsync({
			customerName: form.customerName.trim(),
			customerPhone: form.customerPhone.trim(),
			...(form.activitySource === "catalog" && form.activityId
				? { activityId: form.activityId }
				: { activityTitle: form.activityTitle.trim() }),
			startAtISO,
			peopleCount: form.peopleCount,
			priceMad: form.priceMad,
			initialNote: form.initialNote.trim() ? form.initialNote.trim() : null,
			...(Object.keys(meta).length ? { meta } : {}),
		});

		setCreateOpen(false);
		setForm(defaultCreateForm());
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
			selectedBooking.depositCents !== null
				? Math.round(selectedBooking.depositCents / 100)
				: Math.round(selectedBooking.priceCents / 200),
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

	function renderConversation(
		messages: Array<{
			id: string;
			sender: BookingMessageSender;
			body: string;
			createdAt: Date | string;
		}>,
	) {
		if (!messages.length) {
			return (
				<div className="field rounded-xl p-4">
					<p className="font-sans text-(--text-2) text-sm">
						No messages yet. Send the first message below.
					</p>
				</div>
			);
		}

		return (
			<div className="flex flex-col gap-2">
				{messages.map((m) => (
					<div
						className={`flex ${m.sender === "OPERATOR" ? "justify-end" : "justify-start"}`}
						key={m.id}
					>
						<div
							className={`max-w-[80%] rounded-2xl border px-4 py-3 ${
								m.sender === "OPERATOR"
									? "border-white/10 bg-forest-dark text-white"
									: "card text-(--text-1)"
							}`}
						>
							<p className="font-sans font-semibold text-sm">{m.body}</p>
							<p
								className={`mt-1 font-sans text-[10px] ${m.sender === "OPERATOR" ? "text-white/70" : "text-(--text-2)"}`}
							>
								{formatDateTime(m.createdAt)}
							</p>
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 p-4 lg:p-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-col">
					<h2 className="font-bold font-serif text-(--text-1) text-[18px]">
						Inbox
					</h2>
					<p className="mt-1 font-sans text-(--text-2) text-sm">
						Your booking conversations, organized (by status).
					</p>
				</div>
				<button
					className="btn producer-new-booking rounded-xl px-4 py-2 font-sans font-semibold text-sm transition-colors"
					onClick={() => setCreateOpen(true)}
					type="button"
				>
					+ New Booking
				</button>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
				<div className="card overflow-hidden rounded-xl">
					<div className="border-(--app-border) border-b px-4 py-3">
						<p className="font-bold font-sans text-(--text-2) text-[11px] uppercase tracking-wide">
							Conversations
						</p>
					</div>
					{isLoading ? (
						<div className="p-6 text-center font-sans text-(--text-2) text-sm">
							Loading…
						</div>
					) : bookings.length === 0 ? (
						<div className="flex flex-col gap-2 p-6 text-center">
							<p className="font-sans text-(--text-2) text-sm">
								No bookings yet.
							</p>
							<p className="font-sans text-(--text-2) text-xs">
								Create the first one with “New Booking”.
							</p>
						</div>
					) : (
						<div className="flex flex-col">
							{bookings.map((b) => {
								const active = b.id === selectedBookingId;
								const badgeClass = getStatusBadgeClass(b.status);
								return (
									<button
										className={`border-(--app-border) border-b px-4 py-3 text-left transition-colors last:border-b-0 ${
											active ? "bg-gold/10" : "bg-transparent"
										}`}
										key={b.id}
										onClick={() => setSelectedBookingId(b.id)}
										type="button"
									>
										<div className="flex items-center gap-3">
											<div
												className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold font-sans text-xs ${
													active
														? "bg-gold text-forest-dark"
														: "bg-black/5 text-(--text-2)"
												}`}
											>
												{initialsFromName(b.customerName || "—")}
											</div>
											<div className="min-w-0 flex-1">
												<div className="flex items-center justify-between gap-2">
													<p className="truncate font-sans font-semibold text-(--text-1) text-sm">
														{b.customerName} - {b.activityTitle}
													</p>
												</div>
												<p className="mt-1 font-sans text-(--text-2) text-[11px]">
													{formatDateTime(b.startAt)}
												</p>
											</div>
											<span
												className={`rounded-full px-2.5 py-1 font-bold font-sans text-[10px] uppercase tracking-wide ${badgeClass}`}
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

				<div className="card overflow-hidden rounded-xl">
					<div className="flex items-center justify-between gap-3 border-(--app-border) border-b px-4 py-3">
						<p className="font-bold font-sans text-(--text-2) text-[11px] uppercase tracking-wide">
							Booking details
						</p>
						{selectedBooking && (
							<div className="flex flex-wrap items-center justify-end gap-2">
								{statusBadge(selectedBooking.status)}
								{paymentBadge(selectedBooking.paymentStatus)}
							</div>
						)}
					</div>

					{isDetailLoading ? (
						<div className="p-6 text-center font-sans text-(--text-2) text-sm">
							Loading details…
						</div>
					) : !selectedBooking ? (
						<div className="p-6 text-center">
							<p className="font-sans text-(--text-2) text-sm">
								Select a conversation to see details.
							</p>
						</div>
					) : (
						<div className="flex flex-col gap-4 p-5">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="field rounded-xl p-4">
									<p className="font-bold font-sans text-(--text-2) text-xs uppercase tracking-wide">
										Customer
									</p>
									<p className="mt-2 font-bold font-serif text-(--text-1) text-[16px]">
										{selectedBooking.customerName}
									</p>
									<p className="mt-1 font-sans text-(--text-2) text-sm">
										{selectedBooking.customerPhone}
									</p>
								</div>
								<div className="field rounded-xl p-4">
									<p className="font-bold font-sans text-(--text-2) text-xs uppercase tracking-wide">
										Activity
									</p>
									<p className="mt-2 font-bold font-serif text-(--text-1) text-[16px]">
										{selectedBooking.activityTitle}
									</p>
									<p className="mt-1 font-sans text-(--text-2) text-sm">
										{formatDateTime(selectedBooking.startAt)}
										{selectedBooking.endAt
											? ` → ${formatDateTime(selectedBooking.endAt)}`
											: ""}{" "}
										· {selectedBooking.peopleCount} people
									</p>
									{(() => {
										const line = describeBookingMeta(
											selectedBooking.meta,
											selectedBooking.activityKind,
										);
										return line ? (
											<p className="mt-2 font-sans text-(--text-2) text-xs">
												{line}
											</p>
										) : null;
									})()}
								</div>
							</div>

							<div className="card rounded-xl p-4">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p className="font-bold font-sans text-(--text-2) text-xs uppercase tracking-wide">
											Price
										</p>
										<p className="mt-2 font-bold font-serif text-(--text-1) text-[18px]">
											{formatMad(selectedBooking.priceCents)}
										</p>
									</div>
									<div className="text-right">
										<p className="font-bold font-sans text-(--text-2) text-xs uppercase tracking-wide">
											Deposit
										</p>
										<p className="mt-2 font-sans text-(--text-2) text-sm">
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

							<div className="card sticky top-4 rounded-xl px-4 py-3">
								<div className="flex flex-wrap items-center gap-2">
									<button
										className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2 font-sans font-semibold text-amber-800 text-sm transition-colors disabled:opacity-60"
										disabled={
											confirmMutation.isPending ||
											selectedBooking.status === "PENDING" ||
											selectedBooking.status === "CONFIRMED" ||
											selectedBooking.status === "CANCELLED"
										}
										onClick={() =>
											confirmMutation.mutate({
												bookingId: selectedBooking.id,
												status: "PENDING",
											})
										}
										type="button"
									>
										Mark Pending
									</button>
									<button
										className="rounded-xl border border-zellige-teal/20 bg-zellige-teal/10 px-4 py-2 font-sans font-semibold text-sm text-zellige-teal transition-colors disabled:opacity-60"
										disabled={
											confirmMutation.isPending ||
											selectedBooking.status === "CONFIRMED" ||
											selectedBooking.status === "CANCELLED"
										}
										onClick={() =>
											confirmMutation.mutate({
												bookingId: selectedBooking.id,
												status: "CONFIRMED",
											})
										}
										type="button"
									>
										Confirm Booking
									</button>
									<button
										className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 font-sans font-semibold text-red-600 text-sm transition-colors disabled:opacity-60"
										disabled={
											cancelMutation.isPending ||
											selectedBooking.status === "CANCELLED"
										}
										onClick={() =>
											cancelMutation.mutate({
												bookingId: selectedBooking.id,
												status: "CANCELLED",
											})
										}
										type="button"
									>
										Cancel
									</button>
									<button
										className="btn btn-ghost rounded-xl border-accent px-4 py-2 font-sans font-semibold text-sm transition-colors disabled:opacity-60"
										disabled={
											markDepositMutation.isPending ||
											selectedBooking.paymentStatus === "PAID"
										}
										onClick={openDepositModal}
										type="button"
									>
										Mark Deposit
									</button>
									<a
										className="btn producer-new-booking rounded-xl px-4 py-2 font-sans font-semibold text-sm transition-colors"
										href={toGoogleCalendarUrl(
											new Date(selectedBooking.startAt),
											selectedBooking.endAt
												? new Date(selectedBooking.endAt)
												: new Date(
														new Date(selectedBooking.startAt).getTime() +
															60 * 60 * 1000,
													),
											`${selectedBooking.activityTitle} - ${selectedBooking.customerName}`,
										)}
										rel="noreferrer"
										target="_blank"
									>
										Add to Calendar
									</a>
								</div>
							</div>

							<div className="flex flex-col gap-3">
								<p className="font-bold font-sans text-(--text-2) text-[11px] uppercase tracking-wide">
									Conversation
								</p>
								{renderConversation(selectedBooking.messages)}
								<div className="flex flex-col gap-3 pt-1">
									<TextArea
										label="Your reply"
										onChange={(v) => setMessageDraft(v)}
										placeholder="Write a message to the customer..."
										value={messageDraft}
									/>
									<div className="flex items-center justify-end gap-3">
										<button
											className="btn btn-ghost rounded-xl border-accent px-4 py-2 font-sans font-semibold text-sm transition-colors"
											disabled={
												sendMessageMutation.isPending || !messageDraft.trim()
											}
											onClick={() => setMessageDraft("")}
											type="button"
										>
											Clear
										</button>
										<button
											className="btn producer-new-booking rounded-xl px-4 py-2 font-sans font-semibold text-sm transition-colors disabled:opacity-60"
											disabled={
												sendMessageMutation.isPending || !messageDraft.trim()
											}
											onClick={onSendMessage}
											type="button"
										>
											{sendMessageMutation.isPending ? "Sending…" : "Send"}
										</button>
									</div>
									{sendMessageMutation.error && (
										<p className="font-sans text-red-500 text-sm">
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
				onClose={() => {
					if (!createBookingMutation.isPending) setCreateOpen(false);
				}}
				open={createOpen}
				title="New Booking"
			>
				<div className="flex flex-col gap-4">
					{activitiesLoading && (
						<p className="font-sans text-(--text-2) text-sm">
							Loading activities…
						</p>
					)}
					<div className="flex flex-wrap gap-3">
						<button
							className={`rounded-xl border px-4 py-2 font-sans font-semibold text-sm transition-colors ${
								form.activitySource === "catalog"
									? "border-gold bg-gold/15 text-forest-dark"
									: "border-(--app-border) text-(--text-2)"
							}`}
							onClick={() =>
								setForm((p) => ({ ...p, activitySource: "catalog" }))
							}
							type="button"
						>
							From catalog
						</button>
						<button
							className={`rounded-xl border px-4 py-2 font-sans font-semibold text-sm transition-colors ${
								form.activitySource === "custom"
									? "border-gold bg-gold/15 text-forest-dark"
									: "border-(--app-border) text-(--text-2)"
							}`}
							onClick={() =>
								setForm((p) => ({
									...p,
									activitySource: "custom",
									activityId: "",
								}))
							}
							type="button"
						>
							Custom title
						</button>
					</div>

					{form.activitySource === "catalog" && !activities.length && !activitiesLoading && (
						<p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 font-sans text-amber-900 text-sm">
							No activities in your catalog yet. Add them in Settings, or use
							“Custom title” for a one-off booking.
						</p>
					)}

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Input
							label="Customer name"
							onChange={(v) => setForm((p) => ({ ...p, customerName: v }))}
							placeholder="Ahmed"
							value={form.customerName}
						/>
						<Input
							label="Phone"
							onChange={(v) => setForm((p) => ({ ...p, customerPhone: v }))}
							placeholder="+2126…"
							value={form.customerPhone}
						/>

						{form.activitySource === "catalog" ? (
							<label className="flex flex-col gap-2 font-sans text-sm">
								<span className="font-bold text-(--text-2)">Activity</span>
								<select
									className="field rounded-xl px-4 py-2"
									disabled={activitiesLoading || !activities.length}
									onChange={(e) =>
										setForm((p) => ({ ...p, activityId: e.target.value }))
									}
									value={form.activityId}
								>
									<option value="">Select…</option>
									{activities.map((a) => (
										<option key={a.id} value={a.id}>
											{a.name} ({formatActivityKindLabel(a.kind)})
										</option>
									))}
								</select>
							</label>
						) : (
							<Input
								label="Activity title"
								onChange={(v) => setForm((p) => ({ ...p, activityTitle: v }))}
								placeholder="Desert tour (one-off)"
								value={form.activityTitle}
							/>
						)}

						<Input
							label="People"
							onChange={(v) =>
								setForm((p) => ({ ...p, peopleCount: Math.max(1, Number(v)) }))
							}
							placeholder="2"
							type="number"
							value={form.peopleCount}
						/>

						<Input
							label="Date"
							onChange={(v) => setForm((p) => ({ ...p, date: v }))}
							type="date"
							value={form.date}
						/>

						{form.activitySource === "custom" ||
						(selectedActivity &&
							selectedActivity.kind !== "FIXED_SLOT" &&
							selectedActivity.kind !== "MULTI_DAY") ? (
							<Input
								label="Time"
								onChange={(v) => setForm((p) => ({ ...p, time: v }))}
								type="time"
								value={form.time}
							/>
						) : null}

						{selectedActivity?.kind === "MULTI_DAY" ? (
							<label className="flex flex-col gap-2 font-sans text-sm">
								<span className="font-bold text-(--text-2)">Duration (days)</span>
								<select
									className="field rounded-xl px-4 py-2"
									onChange={(e) =>
										setForm((p) => ({
											...p,
											durationDays: Math.max(1, Number(e.target.value)),
										}))
									}
									value={form.durationDays}
								>
									{(selectedActivity.durationOptions.length
										? selectedActivity.durationOptions
										: [1, 2, 3]
									).map((d) => (
										<option key={d} value={d}>
											{d} day{d > 1 ? "s" : ""}
										</option>
									))}
								</select>
							</label>
						) : null}

						{selectedActivity?.kind === "FIXED_SLOT" &&
						selectedActivity.fixedSlots.length > 0 ? (
							<label className="flex flex-col gap-2 font-sans text-sm">
								<span className="font-bold text-(--text-2)">Time slot</span>
								<select
									className="field rounded-xl px-4 py-2"
									onChange={(e) =>
										setForm((p) => ({ ...p, slotTime: e.target.value }))
									}
									value={form.slotTime}
								>
									<option value="">Select slot…</option>
									{selectedActivity.fixedSlots.map((s) => (
										<option key={s} value={s}>
											{s}
										</option>
									))}
								</select>
							</label>
						) : null}

						{selectedActivity?.kind === "RESOURCE_BASED" ? (
							<Input
								label="Resource units"
								onChange={(v) =>
									setForm((p) => ({
										...p,
										resourceUnits: Math.max(1, Number(v)),
									}))
								}
								placeholder="2"
								type="number"
								value={form.resourceUnits}
							/>
						) : null}

						<Input
							label="Price (MAD)"
							onChange={(v) =>
								setForm((p) => ({ ...p, priceMad: Math.max(0, Number(v)) }))
							}
							placeholder="800"
							type="number"
							value={form.priceMad}
						/>
					</div>

					{selectedActivity?.kind === "FIXED_SLOT" &&
						selectedActivity.fixedSlots.length === 0 && (
							<p className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 font-sans text-red-700 text-sm">
								This activity has no time slots configured. Add slots in Settings or
								pick another activity.
							</p>
						)}

					{selectedActivity && (
						<p className="font-sans text-(--text-2) text-xs">
							{selectedActivity.kind === "FIXED_SLOT" && (
								<>Slot bookings are confirmed immediately when capacity allows.</>
							)}
							{selectedActivity.kind === "FLEXIBLE" && (
								<>You’ll confirm the exact time after the customer request.</>
							)}
							{selectedActivity.kind === "MULTI_DAY" && (
								<>End date is calculated from the duration you pick.</>
							)}
							{selectedActivity.kind === "RESOURCE_BASED" && (
								<>Equipment capacity is checked for this start time.</>
							)}
						</p>
					)}

					<TextArea
						label="Initial note (optional)"
						onChange={(v) => setForm((p) => ({ ...p, initialNote: v }))}
						placeholder="Example: Customer asked about pick-up at 9:00 AM."
						value={form.initialNote}
					/>

					<div className="flex items-center justify-end gap-3">
						<button
							className="btn btn-ghost rounded-xl border-accent px-4 py-2 font-sans font-semibold text-sm transition-colors"
							disabled={createBookingMutation.isPending}
							onClick={() => setCreateOpen(false)}
							type="button"
						>
							Cancel
						</button>
						<button
							className="btn producer-new-booking rounded-xl px-4 py-2 font-sans font-semibold text-sm transition-colors disabled:opacity-60"
							disabled={!canSubmit || createBookingMutation.isPending}
							onClick={onCreate}
							type="button"
						>
							{createBookingMutation.isPending ? "Creating…" : "Create Booking"}
						</button>
					</div>
					{createBookingMutation.error && (
						<p className="font-sans text-red-500 text-sm">
							{createBookingMutation.error instanceof Error
								? createBookingMutation.error.message
								: "Failed to create booking"}
						</p>
					)}
				</div>
			</ModalShell>

			<ModalShell
				onClose={() => {
					if (!markDepositMutation.isPending) setDepositOpen(false);
				}}
				open={depositOpen}
				title="Mark deposit"
			>
				<div className="flex flex-col gap-4">
					<Input
						label="Deposit amount (MAD)"
						onChange={(v) => setDepositMad(Math.max(0, Number(v)))}
						placeholder="400"
						type="number"
						value={depositMad}
					/>

					<div className="flex items-center justify-end gap-3">
						<button
							className="btn btn-ghost rounded-xl border-accent px-4 py-2 font-sans font-semibold text-sm transition-colors"
							disabled={markDepositMutation.isPending}
							onClick={() => setDepositOpen(false)}
							type="button"
						>
							Cancel
						</button>
						<button
							className="btn producer-new-booking rounded-xl px-4 py-2 font-sans font-semibold text-sm transition-colors disabled:opacity-60"
							disabled={markDepositMutation.isPending || depositMad < 0}
							onClick={onConfirmDeposit}
							type="button"
						>
							{markDepositMutation.isPending ? "Marking…" : "Confirm deposit"}
						</button>
					</div>

					{markDepositMutation.error && (
						<p className="font-sans text-red-500 text-sm">
							Failed to mark deposit
						</p>
					)}
				</div>
			</ModalShell>
		</div>
	);
}
