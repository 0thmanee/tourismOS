"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "~/app/api/auth/actions";
import { prisma } from "~/lib/db";
import {
	getCustomerDetailRepo,
	listCustomersForOrgRepo,
	updateCustomerNotesRepo,
} from "./repo/customers.repo";
import type {
	CustomerDetailRow,
	CustomerListRow,
} from "./schemas/customers.schema";
import { updateCustomerNotesSchema } from "./schemas/customers.schema";

async function requireProducerOrganizationId(
	redirectTo: string,
): Promise<string> {
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

export async function listMyCustomers(): Promise<CustomerListRow[]> {
	const organizationId = await requireProducerOrganizationId(
		"/producer/customers",
	);
	return listCustomersForOrgRepo(organizationId);
}

export async function getMyCustomerDetail(
	customerId: string,
): Promise<CustomerDetailRow | null> {
	const organizationId = await requireProducerOrganizationId(
		"/producer/customers",
	);
	if (!customerId) return null;
	return getCustomerDetailRepo(organizationId, customerId);
}

export async function updateCustomerNotes(input: unknown) {
	const organizationId = await requireProducerOrganizationId(
		"/producer/customers",
	);
	const parsed = updateCustomerNotesSchema.parse(input);
	const result = await updateCustomerNotesRepo({
		organizationId,
		customerId: parsed.customerId,
		notes: parsed.notes,
	});
	if (result) {
		revalidatePath("/producer/customers");
		revalidatePath(`/producer/customers/${parsed.customerId}`);
	}
	return result;
}
