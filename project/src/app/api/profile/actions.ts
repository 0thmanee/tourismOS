"use server";

import { redirect } from "next/navigation";
import { getSession } from "~/app/api/auth/actions";
import {
	getProfileByUserId,
	setProfileCompleted,
	updateProfileImageRepo,
	upsertProfileByUserId,
} from "./repo/profile.repo";
import type { OnboardingInput } from "./schemas/profile.schema";

async function requireUserId(): Promise<string> {
	const session = await getSession();
	if (!session?.user?.id) {
		redirect("/auth/login?callbackUrl=" + encodeURIComponent("/onboarding"));
	}
	return session.user.id;
}

/**
 * Get the current user's profile (onboarding data). Returns null if not yet filled.
 */
export async function getProfile() {
	const userId = await requireUserId();
	return getProfileByUserId(userId);
}

/**
 * Create or update the current user's profile with onboarding data.
 * Does not set profileCompleted; use completeProfile after submission.
 */
export async function upsertProfile(data: OnboardingInput) {
	const userId = await requireUserId();
	return upsertProfileByUserId(userId, data);
}

/**
 * Mark the current user's profile as completed (onboarding done).
 */
export async function completeProfile() {
	const userId = await requireUserId();
	await setProfileCompleted(userId);
}

/**
 * Returns the path the user should be redirected to after login or onboarding.
 */
export async function getRedirectPathAfterAuth(): Promise<string> {
	const session = await getSession();
	if (!session?.user) return "/auth/login";
	const user = session.user as { role?: string; status?: string };
	const role = user.role ?? "partner";
	const status = user.status ?? "disabled";
	if (role === "superadmin") return "/admin";
	if (role === "partner" && status === "enabled") return "/producer";
	return "/pending-approval";
}

/**
 * Completes onboarding (upsert profile + set profileCompleted) and returns the path to redirect to.
 */
export async function completeOnboardingAndGetRedirect(
	data: OnboardingInput,
): Promise<{ redirectTo: string }> {
	await requireUserId();
	await upsertProfile(data);
	await completeProfile();
	const redirectTo = await getRedirectPathAfterAuth();
	return { redirectTo };
}

/**
 * Save a profile image URL to the current user's profile (e.g. after uploading via global media).
 * Use with the URL returned from POST /api/media/upload with type "profilePictures".
 */
export async function updateProfileImageUrl(
	url: string,
): Promise<{ error?: string }> {
	try {
		const userId = await requireUserId();
		await updateProfileImageRepo(userId, url);
		return {};
	} catch {
		return { error: "You must be signed in to update your photo." };
	}
}
