"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, sendVerificationEmail } from "~/lib/auth-client";
import { AuthLayout, AuthInput, AuthField } from "~/features/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/producer";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

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
            setError("Please verify your email first. Check your inbox or resend below.");
            return;
          }
          setError(ctx.error?.message ?? "Invalid email or password.");
        },
      }
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
      title="Sign in"
      subtitle={
        <>
          Welcome
          <br />
          <span className="italic text-gold">back</span>
        </>
      }
      showRegisterLink
    >
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-serif font-bold text-[28px] text-white leading-tight">
            Sign in to your account
          </h1>
          <p className="font-sans text-white/50 text-sm mt-1">
            Enter your credentials to access the Operator Portal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div
              className="rounded-xl px-4 py-3 font-sans text-sm text-[#f87171] space-y-2"
              style={{
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.25)",
              }}
            >
              <p>{error}</p>
              {needsVerification && email && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendStatus === "sending"}
                  className="font-sans text-xs font-semibold text-gold hover:text-gold/80 disabled:opacity-60"
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
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              required
              autoComplete="email"
            />
          </AuthField>
          <AuthField label="Password">
            <AuthInput
              type="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              required
              autoComplete="current-password"
            />
          </AuthField>
          <button
            type="submit"
            disabled={loading}
            className="font-sans font-semibold text-sm text-forest-dark bg-gold rounded-xl px-8 py-3.5 hover:bg-gold-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          {resendStatus === "sent" && (
            <p className="font-sans text-xs text-[#4ADE80]">
              Verification email sent. Check your inbox (and spam).
            </p>
          )}
        </form>

        <p className="font-sans text-[11px] text-white/25 text-center">
          <Link href="/" className="text-white/40 hover:text-white/60">
            ← Back to homepage
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
