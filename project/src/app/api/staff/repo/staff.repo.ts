import { prisma } from "~/lib/db";
import type { BookingAssignmentRow, StaffMemberRow, StaffRole } from "../schemas/staff.schema";

const staffSelect = {
  id: true,
  organizationId: true,
  name: true,
  role: true,
  phone: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listStaffMembersRepo(organizationId: string): Promise<StaffMemberRow[]> {
  const rows = await prisma.staffMember.findMany({
    where: { organizationId },
    select: staffSelect,
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({ ...row, role: row.role as StaffRole }));
}

export async function createStaffMemberRepo(data: {
  organizationId: string;
  name: string;
  role: string;
  phone?: string | null;
}): Promise<StaffMemberRow> {
  const row = await prisma.staffMember.create({
    data: {
      organizationId: data.organizationId,
      name: data.name,
      role: data.role,
      phone: data.phone ?? null,
      isActive: true,
    },
    select: staffSelect,
  });
  return { ...row, role: row.role as StaffRole };
}

export async function updateStaffMemberRepo(data: {
  organizationId: string;
  id: string;
  name: string;
  role: string;
  phone?: string | null;
  isActive: boolean;
}): Promise<StaffMemberRow | null> {
  const existing = await prisma.staffMember.findFirst({
    where: { id: data.id, organizationId: data.organizationId },
    select: { id: true },
  });
  if (!existing) return null;

  const row = await prisma.staffMember.update({
    where: { id: data.id },
    data: {
      name: data.name,
      role: data.role,
      phone: data.phone ?? null,
      isActive: data.isActive,
    },
    select: staffSelect,
  });
  return { ...row, role: row.role as StaffRole };
}

export async function deleteStaffMemberRepo(data: {
  organizationId: string;
  id: string;
}): Promise<boolean> {
  const existing = await prisma.staffMember.findFirst({
    where: { id: data.id, organizationId: data.organizationId },
    select: { id: true },
  });
  if (!existing) return false;
  await prisma.staffMember.delete({ where: { id: data.id } });
  return true;
}

const bookingAssignmentSelect = {
  id: true,
  bookingId: true,
  staffMemberId: true,
  assignmentRole: true,
  notes: true,
  createdAt: true,
  staffMember: {
    select: {
      id: true,
      name: true,
      role: true,
      phone: true,
      isActive: true,
    },
  },
} as const;

export async function listAssignmentsForBookingRepo(data: {
  organizationId: string;
  bookingId: string;
}): Promise<BookingAssignmentRow[]> {
  const booking = await prisma.booking.findFirst({
    where: { id: data.bookingId, organizationId: data.organizationId },
    select: { id: true },
  });
  if (!booking) return [];

  const rows = await prisma.bookingAssignment.findMany({
    where: { bookingId: data.bookingId },
    select: bookingAssignmentSelect,
    orderBy: { createdAt: "asc" },
  });

  return rows.map((row) => ({
    ...row,
    staffMember: {
      ...row.staffMember,
      role: row.staffMember.role as StaffRole,
    },
  }));
}

export async function assignStaffToBookingRepo(data: {
  organizationId: string;
  bookingId: string;
  staffMemberId: string;
  assignmentRole?: string | null;
  notes?: string | null;
}): Promise<BookingAssignmentRow | null> {
  const [booking, member] = await Promise.all([
    prisma.booking.findFirst({
      where: { id: data.bookingId, organizationId: data.organizationId },
      select: { id: true, startAt: true, status: true },
    }),
    prisma.staffMember.findFirst({
      where: { id: data.staffMemberId, organizationId: data.organizationId, isActive: true },
      select: { id: true },
    }),
  ]);

  if (!booking || !member) return null;
  if (booking.status === "CANCELLED") return null;

  // Basic availability rule for MVP:
  // prevent assigning one staff member to multiple active bookings at the same start time.
  const conflictingAssignment = await prisma.bookingAssignment.findFirst({
    where: {
      staffMemberId: data.staffMemberId,
      bookingId: { not: data.bookingId },
      booking: {
        organizationId: data.organizationId,
        startAt: booking.startAt,
        status: { not: "CANCELLED" },
      },
    },
    select: { id: true },
  });
  if (conflictingAssignment) return null;

  const row = await prisma.bookingAssignment.upsert({
    where: {
      bookingId_staffMemberId: {
        bookingId: data.bookingId,
        staffMemberId: data.staffMemberId,
      },
    },
    update: {
      assignmentRole: data.assignmentRole ?? null,
      notes: data.notes ?? null,
    },
    create: {
      bookingId: data.bookingId,
      staffMemberId: data.staffMemberId,
      assignmentRole: data.assignmentRole ?? null,
      notes: data.notes ?? null,
    },
    select: bookingAssignmentSelect,
  });

  return {
    ...row,
    staffMember: { ...row.staffMember, role: row.staffMember.role as StaffRole },
  };
}

export async function unassignStaffFromBookingRepo(data: {
  organizationId: string;
  bookingId: string;
  staffMemberId: string;
}): Promise<boolean> {
  const booking = await prisma.booking.findFirst({
    where: { id: data.bookingId, organizationId: data.organizationId },
    select: { id: true },
  });
  if (!booking) return false;

  await prisma.bookingAssignment.deleteMany({
    where: {
      bookingId: data.bookingId,
      staffMemberId: data.staffMemberId,
    },
  });
  return true;
}
