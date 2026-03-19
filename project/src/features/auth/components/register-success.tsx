"use client";

import React from "react";
import Link from "next/link";
import type { RegisterFormData } from "../config/register";

const bg =
  "linear-gradient(in oklab 160deg, oklab(14% -0.025 0.012) 0%, oklab(22% -0.038 0.018) 100%)";

export function RegisterSuccess({ form }: { form: RegisterFormData }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: bg }}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.04 }}
        aria-hidden
      >
        <defs>
          <pattern
            id="reg-success-pattern"
            x="0"
            y="0"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <rect x="10" y="10" width="28" height="28" fill="none" stroke="rgba(201,145,61,1)" strokeWidth="0.7" />
            <rect x="10" y="10" width="28" height="28" fill="none" stroke="rgba(201,145,61,1)" strokeWidth="0.7" transform="rotate(45 24 24)" />
            <circle cx="24" cy="24" r="3" fill="rgba(201,145,61,0.4)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#reg-success-pattern)" />
      </svg>

      <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-md">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)" }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M7 18l6 6 16-14" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-gold text-sm">★</span>
            <span className="font-sans text-[11px] font-semibold tracking-[0.18em] text-white/50 uppercase">Application Submitted</span>
            <span className="text-gold text-sm">★</span>
          </div>
          <h1 className="font-serif font-bold text-[32px] text-white leading-tight">Welcome, {form.firstName}.</h1>
          <p className="font-sans text-white/60 text-base leading-relaxed mt-3 max-w-sm">
            Your application has been received. Our team will review your documents and get back to you within 3-5 business days.
          </p>
        </div>
        <div
          className="w-full rounded-2xl p-5 flex flex-col gap-3 text-left"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {[
            { step: "1", label: "Application review", detail: "1-2 business days" },
            { step: "2", label: "Document verification", detail: "1-2 business days" },
            { step: "3", label: "On-site audit scheduled", detail: "1-3 weeks" },
            { step: "4", label: "Booking workflow enabled", detail: "Up to 1 week" },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center font-sans font-bold text-[10px] text-gold shrink-0"
                style={{ background: "rgba(201,145,61,0.15)", border: "1px solid rgba(201,145,61,0.25)" }}
              >
                {s.step}
              </div>
              <div className="flex-1 flex items-center justify-between gap-2">
                <span className="font-sans text-sm text-white/80">{s.label}</span>
                <span className="font-sans text-[11px] text-white/35">{s.detail}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/producer"
            className="font-sans font-semibold text-sm text-forest-dark bg-gold rounded-xl px-8 py-3.5 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link href="/" className="font-sans text-sm text-white/60 hover:text-white/80 transition-colors">
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
