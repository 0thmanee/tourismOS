"use client";

import Link from "next/link";
import { signOut } from "~/lib/auth-client";

export function PendingApprovalContent() {
  return (
    <div className="relative z-10 flex flex-col items-center text-center max-w-md gap-6">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background: "rgba(201,145,61,0.15)",
          border: "1px solid rgba(201,145,61,0.35)",
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C9913D"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
      <div>
        <h1 className="font-serif font-bold text-[28px] text-white leading-tight">
          Account pending approval
        </h1>
        <p className="font-sans text-white/70 text-sm mt-3 leading-relaxed">
          Your profile has been submitted. A TourismOS admin will review
          your account and enable access to the Operator Portal. You’ll be able
          to sign in and use the portal once approved.
        </p>
      </div>
      <p className="font-sans text-white/50 text-xs">
        This usually takes 1-2 business days. If you have questions, contact
        support.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => signOut()}
          className="font-sans font-semibold text-sm text-gold hover:text-gold/80 transition-colors"
        >
          Sign out
        </button>
        <Link
          href="/"
          className="font-sans text-sm text-white/50 hover:text-white/70 transition-colors"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
