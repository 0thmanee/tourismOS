"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { AuthField, AuthInput, AuthLayout } from "~/features/auth";
import { sendVerificationEmail, signIn } from "~/lib/auth-client";

export function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") ?? "/producer";

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [needsVerification, setNeedsVerification] = useState(false);
	const [resendStatus, setResendStatus] = useState<
		"idle" | "sending" | "sent" | "error"
	>("idle");

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setNeedsVerification(false);
		setLoading(true);
		const res = await signIn.email(
			{ email, password, callbackURL: callbackUrl },
			{
				onError: (ctx) => {
					if (ctx.error?.status === 403) {
						setNeedsVerification(true);
						setError(
							"Please verify your email first. Check your inbox or resend below.",
						);
						return;
					}
					setError(ctx.error?.message ?? "Invalid email or password.");
				},
			},
		);
		setLoading(false);
		if (res.error) return;
		router.push(callbackUrl);
		router.refresh();
	}

	async function handleResendVerification() {
		if (!email || resendStatus === "sending") return;
		setResendStatus("sending");
		setError(null);
		const res = await sendVerificationEmail({
			email,
			callbackURL: callbackUrl,
		});
		if (res.error) {
			setResendStatus("error");
			setError(res.error.message ?? "Failed to resend. Try again.");
			return;
		}
		setResendStatus("sent");
		setError(null);
		setNeedsVerification(false);
	}

	return (
		<AuthLayout
			showRegisterLink
			subtitle={
				<>
					Welcome
					<br />
					<span className="text-gold italic">back</span>
				</>
			}
			title="Sign in"
		>
			<div className="flex flex-col gap-6">
				<div>
					<h1 className="font-bold font-serif text-[28px] text-white leading-tight">
						Sign in to your account
					</h1>
					<p className="mt-1 font-sans text-sm text-white/50">
						Enter your credentials to access the Operator Portal.
					</p>
				</div>

				<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
					{error && (
						<div className="auth-error space-y-2 rounded-xl px-4 py-3 font-sans text-sm">
							<p>{error}</p>
							{needsVerification && email && (
								<button
									className="font-sans font-semibold text-gold text-xs hover:text-gold/80 disabled:opacity-60"
									disabled={resendStatus === "sending"}
									onClick={handleResendVerification}
									type="button"
								>
									{resendStatus === "sending"
										? "Sending…"
										: resendStatus === "sent"
											? "Email sent again"
											: "Resend verification email"}
								</button>
							)}
						</div>
					)}
					<AuthField label="Email Address">
						<AuthInput
							autoComplete="email"
							name="email"
							onChange={setEmail}
							placeholder="you@example.com"
							required
							type="email"
							value={email}
						/>
					</AuthField>
					<AuthField label="Password">
						<AuthInput
							autoComplete="current-password"
							name="password"
							onChange={setPassword}
							placeholder="••••••••"
							required
							type="password"
							value={password}
						/>
					</AuthField>
					<button
						className="rounded-xl bg-gold px-8 py-3.5 font-sans font-semibold text-forest-dark text-sm transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
						disabled={loading}
						type="submit"
					>
						{loading ? "Signing in…" : "Sign in"}
					</button>
					{resendStatus === "sent" && (
						<p className="font-sans text-[#4ADE80] text-xs">
							Verification email sent. Check your inbox (and spam).
						</p>
					)}
				</form>

				<p className="text-center font-sans text-[11px] text-white/25">
					<Link className="text-white/40 hover:text-white/60" href="/">
						← Back to homepage
					</Link>
				</p>
			</div>
		</AuthLayout>
	);
}
