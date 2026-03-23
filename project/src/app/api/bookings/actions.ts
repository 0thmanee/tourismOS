"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "~/app/api/auth/actions";
import { prisma } from "~/lib/db";
import {
  bookingsFilterSchema,
  calendarRangeSchema,
  createBookingSchema,
  markDepositSchema,
  markPaidSchema,
  updateBookingSchema,
  updateBookingStatusSchema,
  sendBookingMessageSchema,
  type CreateBookingInput,
  type MarkDepositInput,
  type UpdateBookingStatusInput,
  type SendBookingMessageInput,
  type BookingDetailRow,
  type BookingInboxRow,
  type BookingStatus,
  type BookingMessageRow,
  type BookingsFilterInput,
  type CalendarRangeInput,
  type UpdateBookingInput,
  type MarkPaidInput,
} from "./schemas/bookings.schema";
import {
  createBookingRepo,
  getMyBookingDetailRepo,
  listMyBookingsFilteredRepo,
  listMyBookingsForInboxRepo,
  listMyBookingsInRangeRepo,
  markDepositRepo,
  markPaidRepo,
  sendBookingMessageRepo,
  setBookingStatusRepo,
  updateBookingRepo,
} from "./repo/bookings.repo";

async function requireProducerOrganizationId(redirectTo: string): Promise<string> {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=" + encodeURIComponent(redirectTo));
  }
  const member = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      user: { status: "enabled" },
      role: { in: ["owner", "admin", "member"] },
    },
    select: { organizationId: true },
  });
  if (!member) redirect("/producer");
  return member.organizationId;
}

export async function listMyBookingsForInbox(): Promise<BookingInboxRow[]> {
  const organizationId = await requireProducerOrganizationId("/producer/inbox");
  return listMyBookingsForInboxRepo(organizationId);
}

export async function listMyBookingsFiltered(filters: BookingsFilterInput): Promise<BookingInboxRow[]> {
  const organizationId = await requireProducerOrganizationId("/producer/bookings");
  const parsed = bookingsFilterSchema.parse(filters);
  return listMyBookingsFilteredRepo(organizationId, {
    dateFrom: parsed.dateFrom ? new Date(parsed.dateFrom) : undefined,
    dateTo: parsed.dateTo ? new Date(parsed.dateTo) : undefined,
    status: parsed.status,
    activityContains: parsed.activityContains,
    search: parsed.search,
  });
}

export async function listMyBookingsForCalendar(range: CalendarRangeInput): Promise<BookingInboxRow[]> {
  const organizationId = await requireProducerOrganizationId("/producer/calendar");
  const parsed = calendarRangeSchema.parse(range);
  const start = new Date(parsed.rangeStartISO);
  const end = new Date(parsed.rangeEndISO);
  return listMyBookingsInRangeRepo(organizationId, start, end);
}

export async function updateBooking(input: UpdateBookingInput): Promise<BookingDetailRow | null> {
  const organizationId = await requireProducerOrganizationId("/producer/bookings");
  const parsed = updateBookingSchema.parse(input);
  const priceCents =
    parsed.priceMad !== undefined ? Math.round(parsed.priceMad * 100) : undefined;
  const result = await updateBookingRepo({
    organizationId,
    bookingId: parsed.bookingId,
    activityTitle: parsed.activityTitle,
    startAt: parsed.startAtISO ? new Date(parsed.startAtISO) : undefined,
    peopleCount: parsed.peopleCount,
    priceCents,
  });
  if (result) {
    revalidatePath("/producer/bookings");
    revalidatePath(`/producer/bookings/${parsed.bookingId}`);
    revalidatePath("/producer/inbox");
    revalidatePath("/producer/calendar");
  }
  return result;
}

export async function markBookingPaid(input: MarkPaidInput): Promise<BookingInboxRow | null> {
  const organizationId = await requireProducerOrganizationId("/producer/payments");
  const parsed = markPaidSchema.parse(input);
  const row = await markPaidRepo({
    bookingId: parsed.bookingId,
    organizationId,
  });
  if (row) {
    revalidatePath("/producer/payments");
    revalidatePath("/producer/bookings");
    revalidatePath(`/producer/bookings/${parsed.bookingId}`);
    revalidatePath("/producer/inbox");
  }
  return row;
}

export async function getMyBookingDetail(bookingId: string): Promise<BookingDetailRow | null> {
  const organizationId = await requireProducerOrganizationId("/producer/inbox");
  if (!bookingId) return null;
  return getMyBookingDetailRepo(bookingId, organizationId);
}

export async function createBooking(data: CreateBookingInput): Promise<BookingDetailRow> {
  const organizationId = await requireProducerOrganizationId("/producer/inbox");
  const parsed = createBookingSchema.parse(data);
  const startAt = new Date(parsed.startAtISO);
  const priceCents = Math.round(parsed.priceMad * 100);

  return createBookingRepo({
    organizationId,
    customerName: parsed.customerName,
    customerPhone: parsed.customerPhone,
    activityTitle: parsed.activityTitle,
    startAt,
    peopleCount: parsed.peopleCount,
    priceCents,
    initialNote: parsed.initialNote ?? null,
  });
}

export async function confirmBooking(input: UpdateBookingStatusInput): Promise<BookingInboxRow | null> {
  const organizationId = await requireProducerOrganizationId("/producer/inbox");
  const parsed = updateBookingStatusSchema.parse(input);
  const status = parsed.status as BookingStatus;

  return setBookingStatusRepo({
    bookingId: parsed.bookingId,
    organizationId,
    status,
  });
}

export async function cancelBooking(input: UpdateBookingStatusInput): Promise<BookingInboxRow | null> {
  const organizationId = await requireProducerOrganizationId("/producer/inbox");
  const parsed = updateBookingStatusSchema.parse(input);

  return setBookingStatusRepo({
    bookingId: parsed.bookingId,
    organizationId,
    status: parsed.status,
  });
}

export async function markDeposit(input: MarkDepositInput): Promise<BookingInboxRow | null> {
  const organizationId = await requireProducerOrganizationId("/producer/inbox");
  const parsed = markDepositSchema.parse(input);

  return markDepositRepo({
    bookingId: parsed.bookingId,
    organizationId,
    depositCents: Math.round(parsed.depositMad * 100),
  });
}

export async function sendBookingMessage(
  input: SendBookingMessageInput,
): Promise<BookingMessageRow | null> {
  const organizationId = await requireProducerOrganizationId("/producer/inbox");
  const parsed = sendBookingMessageSchema.parse(input);
  return sendBookingMessageRepo({
    bookingId: parsed.bookingId,
    organizationId,
    body: parsed.body.trim(),
  });
}

