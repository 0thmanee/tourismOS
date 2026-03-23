"use client";

import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AuthLayout } from "~/features/auth";
import { sendVerificationEmail } from "~/lib/auth-client";

const CALLBACK_URL = "/onboarding";

export function RegisterVerifyEmail({ email }: { email: string }) {
	const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
		"idle",
	);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	async function handleResend() {
		if (status === "sending") return;
		setErrorMessage(null);
		setStatus("sending");
		const res = await sendVerificationEmail({
			email,
			callbackURL: CALLBACK_URL,
		});
		if (res.error) {
			setStatus("error");
			setErrorMessage(res.error.message ?? "Failed to resend. Try again.");
			return;
		}
		setStatus("sent");
	}

	return (
		<AuthLayout
			contentClassName="max-w-md"
			showLoginLink
			subtitle="We sent you a verification link"
			title="Check your email"
		>
			<div className="flex flex-col gap-6 text-center">
				<div className="auth-badge mx-auto flex h-16 w-16 items-center justify-center rounded-full">
					<Mail aria-hidden size={28} />
				</div>
				<p className="font-sans text-sm text-white/80 leading-relaxed">
					We sent a verification link to{" "}
					<strong className="text-white">{email}</strong>. Click the link to
					verify your email, then you can sign in and complete your profile.
				</p>
				<p className="font-sans text-white/50 text-xs">
					Didn’t receive the email? Check your spam folder, or resend below.
				</p>

				<div className="flex flex-col gap-3">
					<button
						className="btn btn-ghost rounded-xl border-accent px-6 py-3 font-sans font-semibold text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
						disabled={status === "sending"}
						onClick={handleResend}
						type="button"
					>
						{status === "sending"
							? "Sending…"
							: status === "sent"
								? "Email sent again"
								: "Resend verification email"}
					</button>
					{status === "sent" && (
						<p className="font-sans text-[11px] text-white/50">
							Check your inbox (and spam) for the new link.
						</p>
					)}
					{status === "error" && errorMessage && (
						<p className="font-sans text-[11px] text-red-300">{errorMessage}</p>
					)}
					<Link
						className="font-sans font-semibold text-gold text-sm transition-colors hover:text-gold/80"
						href="/auth/login"
					>
						Go to Sign in{" "}
						<ArrowRight
							aria-hidden
							className="inline-block align-[-2px]"
							size={14}
						/>
					</Link>
				</div>
			</div>
		</AuthLayout>
	);
}
