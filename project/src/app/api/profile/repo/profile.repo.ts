import { cache } from "react";
import { prisma } from "~/lib/db";
import type { OnboardingInput } from "../schemas/profile.schema";

export const getProfileByUserId = cache(async (userId: string) => {
	return prisma.profile.findUnique({
		where: { userId },
	});
});

export async function upsertProfileByUserId(
	userId: string,
	data: OnboardingInput,
) {
	return prisma.profile.upsert({
		where: { userId },
		create: {
			userId,
			firstName: data.firstName,
			lastName: data.lastName,
			phone: data.phone,
			entityType: data.entityType,
			entityName: data.entityName,
			registrationNumber: data.registrationNumber ?? null,
			region: data.region,
			city: data.city,
			yearEstablished: data.yearEstablished ?? null,
			website: data.website ?? null,
			categories: data.categories as string[],
			annualCapacity: data.annualCapacity ?? null,
			exportExperience: data.exportExperience ?? null,
			agreeTerms: data.agreeTerms,
			agreeMarketing: data.agreeMarketing,
		},
		update: {
			firstName: data.firstName,
			lastName: data.lastName,
			phone: data.phone,
			entityType: data.entityType,
			entityName: data.entityName,
			registrationNumber: data.registrationNumber ?? null,
			region: data.region,
			city: data.city,
			yearEstablished: data.yearEstablished ?? null,
			website: data.website ?? null,
			categories: data.categories as string[],
			annualCapacity: data.annualCapacity ?? null,
			exportExperience: data.exportExperience ?? null,
			agreeTerms: data.agreeTerms,
			agreeMarketing: data.agreeMarketing,
		},
	});
}

export async function setProfileCompleted(userId: string) {
	return prisma.user.update({
		where: { id: userId },
		data: { profileCompleted: true },
	});
}

export async function updateProfileImageRepo(
	userId: string,
	profileImageUrl: string | null,
) {
	return prisma.profile.update({
		where: { userId },
		data: { profileImage: profileImageUrl },
	});
}
