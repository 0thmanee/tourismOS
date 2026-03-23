"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";

/**
 * Get current session (for server components / actions).
 * Returns null if not authenticated.
 */
export async function getSession() {
	return auth.api.getSession({
		headers: await headers(),
	});
}

/**
 * Require auth: redirect to /auth/login if no session.
 * Returns session.
 */
export async function requireSession() {
	const session = await getSession();
	if (!session?.user) {
		redirect("/auth/login?callbackUrl=" + encodeURIComponent("/producer"));
	}
	return session;
}
