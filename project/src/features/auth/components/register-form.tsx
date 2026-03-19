"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signUp } from "~/lib/auth-client";
import { AuthLayout, AuthInput, AuthField } from "~/features/auth";
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
              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors"
              style={
                agreeTerms
                  ? { background: "#C9913D", border: "1px solid #C9913D" }
                  : {
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }
              }
              onClick={() => setAgreeTerms(!agreeTerms)}
              onKeyDown={(e) => e.key === "Enter" && setAgreeTerms(!agreeTerms)}
              role="button"
              tabIndex={0}
              aria-checked={agreeTerms}
            >
              {agreeTerms && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  stroke="#0D2818"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 5l2 2 4-4" />
                </svg>
              )}
            </div>
            <span className="font-sans text-[13px] text-white/60 leading-relaxed">
              I agree to the TourismOS Terms of Service and Privacy Policy{" "}
              <span className="text-gold">*</span>
            </span>
          </label>
        </div>

        {submitError && (
          <div
            className="rounded-xl px-4 py-3 font-sans text-sm text-[#f87171]"
            style={{
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.25)",
            }}
          >
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
            className="font-sans font-semibold text-sm rounded-xl px-8 py-3.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed w-full"
            style={
              canSubmit && !submitting
                ? { background: "#C9913D", color: "#0D2818" }
                : {
                    background: "rgba(201,145,61,0.2)",
                    color: "rgba(201,145,61,0.4)",
                    cursor: "not-allowed",
                  }
            }
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
