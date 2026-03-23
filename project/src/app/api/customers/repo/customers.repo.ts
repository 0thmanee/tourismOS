import { prisma } from "~/lib/db";
import type { CustomerDetailRow, CustomerListRow } from "../schemas/customers.schema";

export async function listCustomersForOrgRepo(organizationId: string): Promise<CustomerListRow[]> {
  const rows = await prisma.customer.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      phone: true,
      bookings: {
        select: {
          priceCents: true,
          status: true,
          startAt: true,
        },
        orderBy: { startAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return rows.map((c) => {
    const bookingCount = c.bookings.length;
    const totalPriceCents = c.bookings
      .filter((b) => b.status !== "CANCELLED")
      .reduce((sum, b) => sum + b.priceCents, 0);
    const lastBookingAt = c.bookings[0]?.startAt ?? null;
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      bookingCount,
      totalPriceMad: Math.round(totalPriceCents / 100),
      lastBookingAt,
    };
  });
}

export async function getCustomerDetailRepo(
  organizationId: string,
  customerId: string
): Promise<CustomerDetailRow | null> {
  const row = await prisma.customer.findFirst({
    where: { id: customerId, organizationId },
    select: {
      id: true,
      name: true,
      phone: true,
      notes: true,
      bookings: {
        orderBy: { startAt: "desc" },
        select: {
          id: true,
          activityTitle: true,
          startAt: true,
          status: true,
          priceCents: true,
        },
      },
    },
  });
  return row;
}

export async function updateCustomerNotesRepo(data: {
  organizationId: string;
  customerId: string;
  notes: string | null;
}) {
  const existing = await prisma.customer.findFirst({
    where: { id: data.customerId, organizationId: data.organizationId },
    select: { id: true },
  });
  if (!existing) return null;

  return prisma.customer.update({
    where: { id: data.customerId },
    data: { notes: data.notes },
    select: { id: true, notes: true },
  });
}
