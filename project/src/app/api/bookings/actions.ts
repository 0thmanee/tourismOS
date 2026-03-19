"use server";

import { redirect } from "next/navigation";
import { getSession } from "~/app/api/auth/actions";
import { prisma } from "~/lib/db";
import {
  createBookingSchema,
  markDepositSchema,
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
} from "./schemas/bookings.schema";
import {
  createBookingRepo,
  getMyBookingDetailRepo,
  listMyBookingsForInboxRepo,
  markDepositRepo,
  sendBookingMessageRepo,
  setBookingStatusRepo,
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

