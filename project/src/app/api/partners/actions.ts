"use server";

import { getSession } from "~/app/api/auth/actions";
import { redirect } from "next/navigation";
import {
  listPendingUsersRepo,
  listPartnersRepo,
  listPartnersPaginatedRepo,
  getPartnerByIdRepo,
  ensureOrganizationAndMemberForPartner,
  updatePartnerRepo,
  deletePartnerRepo,
} from "./repo/partners.repo";
import { paginationSchema } from "./schemas/partners.schema";
import type { UpdatePartnerInput } from "./schemas/partners.schema";

async function requireSuperadmin() {
  const session = await getSession();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "superadmin") {
    redirect("/producer");
  }
  return session!;
}

/** List users with status disabled (pending approval). */
export async function listPendingUsers() {
  await requireSuperadmin();
  return listPendingUsersRepo();
}

/** List all partners (optional organizationId = only members of that org). */
export async function listPartners(filters: { organizationId?: string } = {}) {
  await requireSuperadmin();
  return listPartnersRepo(filters);
}

/** Paginated list of partners (optional organizationId). */
export async function listPartnersPaginated(params: { page: number; pageSize: number; organizationId?: string }) {
  await requireSuperadmin();
  const { page, pageSize, organizationId } = paginationSchema.parse(params);
  return listPartnersPaginatedRepo({ page, pageSize, organizationId });
}

/** Approve a user: create their organization, link them as owner, and set status to enabled. */
export async function approveUser(userId: string) {
  await requireSuperadmin();
  await ensureOrganizationAndMemberForPartner(userId);
}

/** Update partner name, email, or status. */
export async function updatePartner(userId: string, data: UpdatePartnerInput) {
  await requireSuperadmin();
  return updatePartnerRepo(userId, data);
}

/** Get a single partner with full profile. */
export async function getPartner(userId: string) {
  await requireSuperadmin();
  return getPartnerByIdRepo(userId);
}

/** Delete a partner (cascades to profile, sessions, accounts). */
export async function deletePartner(userId: string) {
  await requireSuperadmin();
  await deletePartnerRepo(userId);
}
