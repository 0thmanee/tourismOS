"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "~/features/auth";
import { sendVerificationEmail } from "~/lib/auth-client";
import { ArrowRight, Mail } from "lucide-react";

const CALLBACK_URL = "/onboarding";

export function RegisterVerifyEmail({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
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
      title="Check your email"
      subtitle="We sent you a verification link"
      showLoginLink
      contentClassName="max-w-md"
    >
      <div className="flex flex-col gap-6 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto auth-badge"
        >
          <Mail size={28} aria-hidden />
        </div>
        <p className="font-sans text-white/80 text-sm leading-relaxed">
          We sent a verification link to{" "}
          <strong className="text-white">{email}</strong>. Click the link to
          verify your email, then you can sign in and complete your profile.
        </p>
        <p className="font-sans text-white/50 text-xs">
          Didn’t receive the email? Check your spam folder, or resend below.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={status === "sending"}
            className="font-sans font-semibold text-sm rounded-xl px-6 py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed btn btn-ghost border-accent"
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
            href="/auth/login"
            className="font-sans font-semibold text-sm text-gold hover:text-gold/80 transition-colors"
          >
            Go to Sign in <ArrowRight size={14} className="inline-block align-[-2px]" aria-hidden />
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
