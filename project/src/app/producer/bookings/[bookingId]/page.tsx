import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
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
    if (typeof id !== "string" || typeof body !== "string" || !body.trim()) return;

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
      assignmentRole: typeof assignmentRole === "string" ? assignmentRole : null,
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
    <div className="p-4 lg:p-6 flex flex-col gap-4">
      <section className="card rounded-xl p-5">
        <h2 className="font-serif font-bold text-[20px] text-(--text-1)">{booking.activityTitle}</h2>
        <p className="font-sans text-sm text-(--text-2) mt-1">
          {booking.customerName} - {booking.customerPhone}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
          <div>
            <p className="font-sans text-xs uppercase text-(--text-2)">Start</p>
            <p className="font-sans text-sm text-(--text-1)">{formatDateTime(booking.startAt)}</p>
          </div>
          <div>
            <p className="font-sans text-xs uppercase text-(--text-2)">People</p>
            <p className="font-sans text-sm text-(--text-1)">{booking.peopleCount}</p>
          </div>
          <div>
            <p className="font-sans text-xs uppercase text-(--text-2)">Price</p>
            <p className="font-sans text-sm text-(--text-1)">{formatMad(booking.priceCents)}</p>
          </div>
          <div>
            <p className="font-sans text-xs uppercase text-(--text-2)">Status</p>
            <p className="font-sans text-sm text-(--text-1)">
              {booking.status} / {booking.paymentStatus}
            </p>
          </div>
        </div>
      </section>

      <BookingEditForm booking={booking} />

      <section className="card rounded-xl p-5 flex flex-col gap-3">
        <h3 className="font-serif font-bold text-lg text-(--text-1)">Booking Actions</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <form action={updateStatusAction}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <input type="hidden" name="status" value="PENDING" />
            <button className="rounded-lg px-3 py-2 text-xs font-semibold bg-white border border-white/60">
              Mark Pending
            </button>
          </form>
          <form action={updateStatusAction}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <input type="hidden" name="status" value="CONFIRMED" />
            <button className="rounded-lg px-3 py-2 text-xs font-semibold bg-(--brand-primary) text-white">
              Confirm
            </button>
          </form>
          <form action={updateStatusAction}>
            <input type="hidden" name="bookingId" value={booking.id} />
            <input type="hidden" name="status" value="CANCELLED" />
            <button className="rounded-lg px-3 py-2 text-xs font-semibold bg-(--danger) text-white">
              Cancel
            </button>
          </form>
        </div>

        <form action={markDepositAction} className="flex items-end gap-2 flex-wrap pt-2">
          <input type="hidden" name="bookingId" value={booking.id} />
          <label className="flex flex-col gap-1">
            <span className="font-sans text-xs text-(--text-2)">Deposit (MAD)</span>
            <input
              type="number"
              name="depositMad"
              step="1"
              min="0"
              defaultValue={booking.depositCents ? Math.round(booking.depositCents / 100) : ""}
              className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
            />
          </label>
          <button className="h-10 rounded-lg px-3 text-xs font-semibold bg-(--brand-primary) text-white">
            Save Deposit
          </button>
        </form>
      </section>

      <section className="card rounded-xl p-5 flex flex-col gap-3">
        <h3 className="font-serif font-bold text-lg text-(--text-1)">Team Assignment</h3>
        {staffMembers.filter((m) => m.isActive).length === 0 && (
          <p className="font-sans text-sm text-(--text-2)">
            Add team members under <Link href="/producer/staff" className="underline font-semibold">Team</Link> to assign guides and drivers.
          </p>
        )}
        <form action={assignStaffAction} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
          <input type="hidden" name="bookingId" value={booking.id} />
          <label className="flex flex-col gap-1">
            <span className="font-sans text-xs text-(--text-2)">Staff member</span>
            <select
              name="staffMemberId"
              required
              disabled={staffMembers.filter((m) => m.isActive).length === 0}
              className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm disabled:opacity-60"
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
            <span className="font-sans text-xs text-(--text-2)">Assignment role</span>
            <input
              type="text"
              name="assignmentRole"
              placeholder="Lead guide, Driver..."
              className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-sans text-xs text-(--text-2)">Notes</span>
            <input
              type="text"
              name="notes"
              placeholder="Pickup at 08:00"
              className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
            />
          </label>
          <button className="h-10 rounded-lg px-3 text-xs font-semibold bg-(--brand-primary) text-white">
            Assign
          </button>
        </form>

        <div className="flex flex-col gap-2">
          {booking.assignments.length === 0 && (
            <p className="font-sans text-sm text-(--text-2)">
              No team assigned yet.
            </p>
          )}
          {booking.assignments.map((assignment) => (
            <div key={assignment.id} className="rounded-lg border border-white/60 bg-white/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-sans text-sm text-(--text-1)">
                    {assignment.staffMember.name} ({assignment.staffMember.role})
                  </p>
                  <p className="font-sans text-xs text-(--text-2)">
                    {assignment.assignmentRole || "Assigned"} {assignment.notes ? `- ${assignment.notes}` : ""}
                  </p>
                </div>
                <form action={unassignStaffAction}>
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <input type="hidden" name="staffMemberId" value={assignment.staffMemberId} />
                  <button className="h-8 rounded-lg px-2 text-[11px] font-semibold bg-white border border-white/70">
                    Remove
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card rounded-xl p-5 flex flex-col gap-3">
        <h3 className="font-serif font-bold text-lg text-(--text-1)">Operator Notes</h3>
        <form action={sendMessageAction} className="flex flex-col gap-2">
          <input type="hidden" name="bookingId" value={booking.id} />
          <textarea
            name="body"
            rows={3}
            placeholder="Add a note or internal message..."
            className="rounded-lg border border-white/70 bg-white/80 px-3 py-2 text-sm"
          />
          <button className="self-start rounded-lg px-3 py-2 text-xs font-semibold bg-(--brand-primary) text-white">
            Add Note
          </button>
        </form>
        <div className="flex flex-col gap-2">
          {booking.messages.length === 0 && (
            <p className="font-sans text-sm text-(--text-2)">No notes yet.</p>
          )}
          {booking.messages.map((message) => (
            <div key={message.id} className="rounded-lg border border-white/60 bg-white/60 p-3">
              <p className="font-sans text-xs text-(--text-2)">
                {message.sender} - {formatDateTime(message.createdAt)}
              </p>
              <p className="font-sans text-sm text-(--text-1) mt-1">{message.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
