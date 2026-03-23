import { after } from "next/server";
import { Resend } from "resend";
import { env } from "~/env";

/** Lazy Resend client — only created when API key is set (server-side only). */
function getResendClient(): Resend | null {
	const key = env.RESEND_API_KEY;
	if (!key || key.length < 20) return null;
	return new Resend(key);
}

/** Default from address: Resend test domain or your verified domain via env. */
const DEFAULT_FROM = "onboarding@resend.dev";

function getFromEmail(): string {
	const from = env.RESEND_FROM_EMAIL;
	if (from) return from;
	return DEFAULT_FROM;
}

/** Basic email format check to avoid unnecessary Resend calls and rate-limit abuse. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(value: string): boolean {
	return (
		typeof value === "string" && value.length <= 254 && EMAIL_REGEX.test(value)
	);
}

/** Escape for safe use inside HTML attributes (e.g. href). */
function escapeHtmlAttr(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

export type SendVerificationEmailParams = {
	to: string;
	subject: string;
	text: string;
	html: string;
};

/**
 * Sends a verification email via Resend.
 * - Does not await the send so auth response is not delayed (timing-attack safe).
 * - Schedules the actual send with Next.js `after()` so it runs after the response (serverless-safe).
 * - No-ops if RESEND_API_KEY is missing or `to` is invalid.
 * - Never logs the recipient address.
 */
export async function sendVerificationEmail(
	params: SendVerificationEmailParams,
): Promise<void> {
	if (!isValidEmail(params.to)) {
		return;
	}

	const resend = getResendClient();
	if (!resend) {
		if (env.NODE_ENV === "development") {
			console.warn(
				"[email] RESEND_API_KEY not set; verification email skipped.",
			);
		}
		return;
	}

	const from = getFromEmail();
	const payload = {
		from,
		to: params.to,
		subject: params.subject,
		text: params.text,
		html: params.html,
	};

	// Run the send after the response is sent so we don't block auth and so serverless keeps the invocation alive.
	after(async () => {
		try {
			const { error } = await resend.emails.send(payload);
			if (error && env.NODE_ENV === "development") {
				console.error("[email] Resend error:", error.message);
			}
		} catch (err) {
			if (env.NODE_ENV === "development") {
				console.error("[email] Send failed:", err);
			}
		}
	});
}

/**
 * Builds HTML and text for the standard verification email.
 * URL is escaped for safe use in HTML.
 */
export function buildVerificationEmailContent(params: {
	verificationUrl: string;
	productName?: string;
}): { text: string; html: string } {
	const { verificationUrl, productName = "TourismOS" } = params;
	const safeUrl = escapeHtmlAttr(verificationUrl);
	const text = `Verify your email for ${productName}\n\nClick the link below to verify your email:\n${verificationUrl}\n\nIf you didn't request this, you can ignore this email.`;
	const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:sans-serif;line-height:1.5;color:#333;"><p>Click the link below to verify your email and complete your ${productName} account.</p><p><a href="${safeUrl}" style="color:#C9913D;font-weight:600;">Verify my email</a></p><p style="color:#666;font-size:14px;">If you didn't request this, you can ignore this email.</p></body></html>`;
	return { text, html };
}
