"use server";

import { redirect } from "next/navigation";
import { getSession } from "~/app/api/auth/actions";
import { prisma } from "~/lib/db";
import {
  assignStaffSchema,
  createStaffMemberSchema,
  unassignStaffSchema,
  updateStaffMemberSchema,
  type AssignStaffInput,
  type BookingAssignmentRow,
  type CreateStaffMemberInput,
  type StaffMemberRow,
  type UnassignStaffInput,
  type UpdateStaffMemberInput,
} from "./schemas/staff.schema";
import {
  assignStaffToBookingRepo,
  createStaffMemberRepo,
  deleteStaffMemberRepo,
  listAssignmentsForBookingRepo,
  listStaffMembersRepo,
  unassignStaffFromBookingRepo,
  updateStaffMemberRepo,
} from "./repo/staff.repo";

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

export async function listMyStaffMembers(): Promise<StaffMemberRow[]> {
  const organizationId = await requireProducerOrganizationId("/producer/staff");
  return listStaffMembersRepo(organizationId);
}

export async function createStaffMember(input: CreateStaffMemberInput): Promise<StaffMemberRow> {
  const organizationId = await requireProducerOrganizationId("/producer/staff");
  const parsed = createStaffMemberSchema.parse(input);
  return createStaffMemberRepo({
    organizationId,
    name: parsed.name,
    role: parsed.role,
    phone: parsed.phone ?? null,
  });
}

export async function updateStaffMember(input: UpdateStaffMemberInput): Promise<StaffMemberRow | null> {
  const organizationId = await requireProducerOrganizationId("/producer/staff");
  const parsed = updateStaffMemberSchema.parse(input);
  return updateStaffMemberRepo({
    organizationId,
    id: parsed.id,
    name: parsed.name,
    role: parsed.role,
    phone: parsed.phone ?? null,
    isActive: parsed.isActive,
  });
}

export async function deleteStaffMember(staffMemberId: string): Promise<boolean> {
  const organizationId = await requireProducerOrganizationId("/producer/staff");
  if (!staffMemberId) return false;
  return deleteStaffMemberRepo({
    organizationId,
    id: staffMemberId,
  });
}

export async function listAssignmentsForMyBooking(bookingId: string): Promise<BookingAssignmentRow[]> {
  const organizationId = await requireProducerOrganizationId("/producer/bookings");
  if (!bookingId) return [];
  return listAssignmentsForBookingRepo({
    organizationId,
    bookingId,
  });
}

export async function assignStaffToBooking(input: AssignStaffInput): Promise<BookingAssignmentRow | null> {
  const organizationId = await requireProducerOrganizationId("/producer/bookings");
  const parsed = assignStaffSchema.parse(input);
  return assignStaffToBookingRepo({
    organizationId,
    bookingId: parsed.bookingId,
    staffMemberId: parsed.staffMemberId,
    assignmentRole: parsed.assignmentRole ?? null,
    notes: parsed.notes ?? null,
  });
}

export async function unassignStaffFromBooking(input: UnassignStaffInput): Promise<boolean> {
  const organizationId = await requireProducerOrganizationId("/producer/bookings");
  const parsed = unassignStaffSchema.parse(input);
  return unassignStaffFromBookingRepo({
    organizationId,
    bookingId: parsed.bookingId,
    staffMemberId: parsed.staffMemberId,
  });
}
