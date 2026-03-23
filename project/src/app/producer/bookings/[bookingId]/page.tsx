import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
	cancelBooking,
	confirmBooking,
	getMyBookingDetail,
	markDeposit,
	sendBookingMessage,
} from "~/app/api/bookings/actions";
import {
	assignStaffToBooking,
	listMyStaffMembers,
	unassignStaffFromBooking,
} from "~/app/api/staff/actions";
import { BookingEditForm } from "~/features/producer/components/bookings/booking-edit-form";

type Props = {
	params: Promise<{ bookingId: string }>;
};

function formatDateTime(value: Date) {
	return new Intl.DateTimeFormat("en-MA", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(value);
}

function formatMad(cents: number) {
	return `${(cents / 100).toLocaleString("en-MA")} MAD`;
}

export default async function BookingDetailPage({ params }: Props) {
	const { bookingId } = await params;
	const [booking, staffMembers] = await Promise.all([
		getMyBookingDetail(bookingId),
		listMyStaffMembers(),
	]);

	if (!booking) notFound();

	async function updateStatusAction(formData: FormData) {
		"use server";

		const status = formData.get("status");
		const id = formData.get("bookingId");
		if (typeof status !== "string" || typeof id !== "string") return;

		if (status === "CONFIRMED" || status === "PENDING") {
			await confirmBooking({ bookingId: id, status });
		}
		if (status === "CANCELLED") {
			await cancelBooking({ bookingId: id, status });
		}

		revalidatePath("/producer/bookings");
		revalidatePath(`/producer/bookings/${id}`);
		revalidatePath("/producer/inbox");
	}

	async function markDepositAction(formData: FormData) {
		"use server";

		const id = formData.get("bookingId");
		const depositMad = formData.get("depositMad");
		if (typeof id !== "string" || typeof depositMad !== "string") return;

		const value = Number(depositMad);
		if (!Number.isFinite(value) || value < 0) return;

		await markDeposit({ bookingId: id, depositMad: value });
		revalidatePath("/producer/bookings");
		revalidatePath(`/producer/bookings/${id}`);
		revalidatePath("/producer/inbox");
	}

	async function sendMessageAction(formData: FormData) {
		"use server";

		const id = formData.get("bookingId");
		const body = formData.get("body");
		if (typeof id !== "string" || typeof body !== "string" || !body.trim())
			return;

		await sendBookingMessage({ bookingId: id, body });
		revalidatePath(`/producer/bookings/${id}`);
	}

	async function assignStaffAction(formData: FormData) {
		"use server";

		const id = formData.get("bookingId");
		const staffMemberId = formData.get("staffMemberId");
		const assignmentRole = formData.get("assignmentRole");
		const notes = formData.get("notes");
		if (typeof id !== "string" || typeof staffMemberId !== "string") return;

		await assignStaffToBooking({
			bookingId: id,
			staffMemberId,
			assignmentRole:
				typeof assignmentRole === "string" ? assignmentRole : null,
			notes: typeof notes === "string" ? notes : null,
		});
		revalidatePath(`/producer/bookings/${id}`);
		revalidatePath("/producer/staff");
	}

	async function unassignStaffAction(formData: FormData) {
		"use server";

		const id = formData.get("bookingId");
		const staffMemberId = formData.get("staffMemberId");
		if (typeof id !== "string" || typeof staffMemberId !== "string") return;

		await unassignStaffFromBooking({
			bookingId: id,
			staffMemberId,
		});
		revalidatePath(`/producer/bookings/${id}`);
		revalidatePath("/producer/staff");
	}

	return (
		<div className="flex flex-col gap-4 p-4 lg:p-6">
			<section className="card rounded-xl p-5">
				<h2 className="font-bold font-serif text-(--text-1) text-[20px]">
					{booking.activityTitle}
				</h2>
				<p className="mt-1 font-sans text-(--text-2) text-sm">
					{booking.customerName} - {booking.customerPhone}
				</p>
				<div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
					<div>
						<p className="font-sans text-(--text-2) text-xs uppercase">Start</p>
						<p className="font-sans text-(--text-1) text-sm">
							{formatDateTime(booking.startAt)}
						</p>
					</div>
					<div>
						<p className="font-sans text-(--text-2) text-xs uppercase">
							People
						</p>
						<p className="font-sans text-(--text-1) text-sm">
							{booking.peopleCount}
						</p>
					</div>
					<div>
						<p className="font-sans text-(--text-2) text-xs uppercase">Price</p>
						<p className="font-sans text-(--text-1) text-sm">
							{formatMad(booking.priceCents)}
						</p>
					</div>
					<div>
						<p className="font-sans text-(--text-2) text-xs uppercase">
							Status
						</p>
						<p className="font-sans text-(--text-1) text-sm">
							{booking.status} / {booking.paymentStatus}
						</p>
					</div>
				</div>
			</section>

			<BookingEditForm booking={booking} />

			<section className="card flex flex-col gap-3 rounded-xl p-5">
				<h3 className="font-bold font-serif text-(--text-1) text-lg">
					Booking Actions
				</h3>
				<div className="flex flex-wrap items-center gap-2">
					<form action={updateStatusAction}>
						<input name="bookingId" type="hidden" value={booking.id} />
						<input name="status" type="hidden" value="PENDING" />
						<button className="rounded-lg border border-white/60 bg-white px-3 py-2 font-semibold text-xs">
							Mark Pending
						</button>
					</form>
					<form action={updateStatusAction}>
						<input name="bookingId" type="hidden" value={booking.id} />
						<input name="status" type="hidden" value="CONFIRMED" />
						<button className="rounded-lg bg-(--brand-primary) px-3 py-2 font-semibold text-white text-xs">
							Confirm
						</button>
					</form>
					<form action={updateStatusAction}>
						<input name="bookingId" type="hidden" value={booking.id} />
						<input name="status" type="hidden" value="CANCELLED" />
						<button className="rounded-lg bg-(--danger) px-3 py-2 font-semibold text-white text-xs">
							Cancel
						</button>
					</form>
				</div>

				<form
					action={markDepositAction}
					className="flex flex-wrap items-end gap-2 pt-2"
				>
					<input name="bookingId" type="hidden" value={booking.id} />
					<label className="flex flex-col gap-1">
						<span className="font-sans text-(--text-2) text-xs">
							Deposit (MAD)
						</span>
						<input
							className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
							defaultValue={
								booking.depositCents
									? Math.round(booking.depositCents / 100)
									: ""
							}
							min="0"
							name="depositMad"
							step="1"
							type="number"
						/>
					</label>
					<button className="h-10 rounded-lg bg-(--brand-primary) px-3 font-semibold text-white text-xs">
						Save Deposit
					</button>
				</form>
			</section>

			<section className="card flex flex-col gap-3 rounded-xl p-5">
				<h3 className="font-bold font-serif text-(--text-1) text-lg">
					Team Assignment
				</h3>
				{staffMembers.filter((m) => m.isActive).length === 0 && (
					<p className="font-sans text-(--text-2) text-sm">
						Add team members under{" "}
						<Link className="font-semibold underline" href="/producer/staff">
							Team
						</Link>{" "}
						to assign guides and drivers.
					</p>
				)}
				<form
					action={assignStaffAction}
					className="grid grid-cols-1 items-end gap-2 md:grid-cols-4"
				>
					<input name="bookingId" type="hidden" value={booking.id} />
					<label className="flex flex-col gap-1">
						<span className="font-sans text-(--text-2) text-xs">
							Staff member
						</span>
						<select
							className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm disabled:opacity-60"
							disabled={staffMembers.filter((m) => m.isActive).length === 0}
							name="staffMemberId"
							required
						>
							<option value="">Select staff…</option>
							{staffMembers
								.filter((member) => member.isActive)
								.map((member) => (
									<option key={member.id} value={member.id}>
										{member.name} ({member.role})
									</option>
								))}
						</select>
					</label>
					<label className="flex flex-col gap-1">
						<span className="font-sans text-(--text-2) text-xs">
							Assignment role
						</span>
						<input
							className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
							name="assignmentRole"
							placeholder="Lead guide, Driver..."
							type="text"
						/>
					</label>
					<label className="flex flex-col gap-1">
						<span className="font-sans text-(--text-2) text-xs">Notes</span>
						<input
							className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
							name="notes"
							placeholder="Pickup at 08:00"
							type="text"
						/>
					</label>
					<button className="h-10 rounded-lg bg-(--brand-primary) px-3 font-semibold text-white text-xs">
						Assign
					</button>
				</form>

				<div className="flex flex-col gap-2">
					{booking.assignments.length === 0 && (
						<p className="font-sans text-(--text-2) text-sm">
							No team assigned yet.
						</p>
					)}
					{booking.assignments.map((assignment) => (
						<div
							className="rounded-lg border border-white/60 bg-white/60 p-3"
							key={assignment.id}
						>
							<div className="flex items-center justify-between gap-2">
								<div>
									<p className="font-sans text-(--text-1) text-sm">
										{assignment.staffMember.name} ({assignment.staffMember.role}
										)
									</p>
									<p className="font-sans text-(--text-2) text-xs">
										{assignment.assignmentRole || "Assigned"}{" "}
										{assignment.notes ? `- ${assignment.notes}` : ""}
									</p>
								</div>
								<form action={unassignStaffAction}>
									<input name="bookingId" type="hidden" value={booking.id} />
									<input
										name="staffMemberId"
										type="hidden"
										value={assignment.staffMemberId}
									/>
									<button className="h-8 rounded-lg border border-white/70 bg-white px-2 font-semibold text-[11px]">
										Remove
									</button>
								</form>
							</div>
						</div>
					))}
				</div>
			</section>

			<section className="card flex flex-col gap-3 rounded-xl p-5">
				<h3 className="font-bold font-serif text-(--text-1) text-lg">
					Operator Notes
				</h3>
				<form action={sendMessageAction} className="flex flex-col gap-2">
					<input name="bookingId" type="hidden" value={booking.id} />
					<textarea
						className="rounded-lg border border-white/70 bg-white/80 px-3 py-2 text-sm"
						name="body"
						placeholder="Add a note or internal message..."
						rows={3}
					/>
					<button className="self-start rounded-lg bg-(--brand-primary) px-3 py-2 font-semibold text-white text-xs">
						Add Note
					</button>
				</form>
				<div className="flex flex-col gap-2">
					{booking.messages.length === 0 && (
						<p className="font-sans text-(--text-2) text-sm">No notes yet.</p>
					)}
					{booking.messages.map((message) => (
						<div
							className="rounded-lg border border-white/60 bg-white/60 p-3"
							key={message.id}
						>
							<p className="font-sans text-(--text-2) text-xs">
								{message.sender} - {formatDateTime(message.createdAt)}
							</p>
							<p className="mt-1 font-sans text-(--text-1) text-sm">
								{message.body}
							</p>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
