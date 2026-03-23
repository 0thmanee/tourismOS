"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { AuthField, AuthInput, AuthLayout } from "~/features/auth";
import { signUp } from "~/lib/auth-client";
import { RegisterVerifyEmail } from "./register-verify-email";

export function RegisterForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [agreeTerms, setAgreeTerms] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const canSubmit =
		name.trim().length > 0 &&
		email.trim().length > 0 &&
		password.length >= 8 &&
		password === confirmPassword &&
		agreeTerms;
	const passwordMismatch =
		confirmPassword.length > 0 && password !== confirmPassword;

	if (submitted) return <RegisterVerifyEmail email={email} />;

	return (
		<AuthLayout
			contentClassName="max-w-md"
			showLoginLink
			subtitle={<>Create your account, then verify your email to continue.</>}
			title="Join the Platform"
		>
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-4">
					<AuthField label="Full Name">
						<AuthInput
							onChange={(v) => setName(v)}
							placeholder="Rida Elmazary"
							value={name}
						/>
					</AuthField>
					<AuthField label="Email Address">
						<AuthInput
							onChange={(v) => setEmail(v)}
							placeholder="you@example.com"
							type="email"
							value={email}
						/>
					</AuthField>
					<AuthField label="Password">
						<AuthInput
							onChange={(v) => setPassword(v)}
							placeholder="Min. 8 characters"
							type="password"
							value={password}
						/>
					</AuthField>
					<AuthField
						error={passwordMismatch ? "Passwords do not match" : undefined}
						label="Confirm Password"
					>
						<AuthInput
							onChange={(v) => setConfirmPassword(v)}
							placeholder="Repeat password"
							type="password"
							value={confirmPassword}
						/>
					</AuthField>
					<label className="flex cursor-pointer items-start gap-3">
						<div
							aria-checked={agreeTerms}
							className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
								agreeTerms ? "border-gold bg-gold" : "auth-input"
							}`}
							onClick={() => setAgreeTerms(!agreeTerms)}
							onKeyDown={(e) => e.key === "Enter" && setAgreeTerms(!agreeTerms)}
							role="button"
							tabIndex={0}
						>
							{agreeTerms && (
								<Check aria-hidden className="text-forest-dark" size={12} />
							)}
						</div>
						<span className="font-sans text-[13px] text-white/60 leading-relaxed">
							I agree to the TourismOS Terms of Service and Privacy Policy{" "}
							<span className="text-gold">*</span>
						</span>
					</label>
				</div>

				{submitError && (
					<div className="auth-error rounded-xl px-4 py-3 font-sans text-sm">
						{submitError}
					</div>
				)}

				<div className="flex flex-col gap-4">
					<button
						className={`btn w-full rounded-xl px-8 py-3.5 font-sans font-semibold text-sm transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
							canSubmit && !submitting ? "btn-accent" : "btn-ghost"
						}`}
						disabled={!canSubmit || submitting}
						onClick={async () => {
							if (!canSubmit || submitting) return;
							setSubmitError(null);
							setSubmitting(true);
							const res = await signUp.email({
								name: name.trim() || email,
								email: email.trim(),
								password,
							});
							setSubmitting(false);
							if (res.error) {
								setSubmitError(
									res.error.message ?? "Registration failed. Try again.",
								);
								return;
							}
							setSubmitted(true);
						}}
						type="button"
					>
						{submitting ? "Creating account…" : "Create account"}
					</button>
					<Link
						className="text-center font-sans text-sm text-white/40 transition-colors hover:text-white/60"
						href="/auth/login"
					>
						Already have an account? Sign in
					</Link>
				</div>
			</div>

			<p className="mt-6 text-center font-sans text-[11px] text-white/25">
				Your data is handled in accordance with Moroccan Law 09-08 on personal
				data protection.
			</p>
		</AuthLayout>
	);
}
