"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signUp } from "~/lib/auth-client";
import { AuthLayout, AuthInput, AuthField } from "~/features/auth";
import { RegisterVerifyEmail } from "./register-verify-email";
import { Check } from "lucide-react";

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
      title="Join the Platform"
      subtitle={
        <>
          Create your account, then verify your email to continue.
        </>
      }
      showLoginLink
      contentClassName="max-w-md"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <AuthField label="Full Name">
            <AuthInput
              placeholder="Rida Elmazary"
              value={name}
              onChange={(v) => setName(v)}
            />
          </AuthField>
          <AuthField label="Email Address">
            <AuthInput
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(v) => setEmail(v)}
            />
          </AuthField>
          <AuthField label="Password">
            <AuthInput
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(v) => setPassword(v)}
            />
          </AuthField>
          <AuthField
            label="Confirm Password"
            error={passwordMismatch ? "Passwords do not match" : undefined}
          >
            <AuthInput
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(v) => setConfirmPassword(v)}
            />
          </AuthField>
          <label className="flex items-start gap-3 cursor-pointer">
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors border ${
                agreeTerms ? "bg-gold border-gold" : "auth-input"
              }`}
              onClick={() => setAgreeTerms(!agreeTerms)}
              onKeyDown={(e) => e.key === "Enter" && setAgreeTerms(!agreeTerms)}
              role="button"
              tabIndex={0}
              aria-checked={agreeTerms}
            >
              {agreeTerms && (
                <Check size={12} className="text-forest-dark" aria-hidden />
              )}
            </div>
            <span className="font-sans text-[13px] text-white/60 leading-relaxed">
              I agree to the TourismOS Terms of Service and Privacy Policy{" "}
              <span className="text-gold">*</span>
            </span>
          </label>
        </div>

        {submitError && (
          <div className="rounded-xl px-4 py-3 font-sans text-sm auth-error">
            {submitError}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <button
            type="button"
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
                  res.error.message ?? "Registration failed. Try again."
                );
                return;
              }
              setSubmitted(true);
            }}
            className={`font-sans font-semibold text-sm rounded-xl px-8 py-3.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed w-full btn ${
              canSubmit && !submitting ? "btn-accent" : "btn-ghost"
            }`}
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
          <Link
            href="/auth/login"
            className="font-sans text-sm text-white/40 hover:text-white/60 transition-colors text-center"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>

      <p className="font-sans text-[11px] text-white/25 mt-6 text-center">
        Your data is handled in accordance with Moroccan Law 09-08 on personal
        data protection.
      </p>
    </AuthLayout>
  );
}
