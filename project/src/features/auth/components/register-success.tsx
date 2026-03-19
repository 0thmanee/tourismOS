"use client";

import React from "react";
import Link from "next/link";
import type { RegisterFormData } from "../config/register";
import { CheckCircle2, Star } from "lucide-react";

export function RegisterSuccess({ form }: { form: RegisterFormData }) {
  return (
    <div className="auth-shell items-center justify-center px-4">
      <div className="auth-pattern bg-moroccan-pattern" aria-hidden />
      <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-md">
        <div className="w-20 h-20 rounded-full flex items-center justify-center badge badge-confirmed">
          <CheckCircle2 size={36} aria-hidden />
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="text-gold" size={14} aria-hidden />
            <span className="font-sans text-[11px] font-semibold tracking-[0.18em] text-white/50 uppercase">Application Submitted</span>
            <Star className="text-gold" size={14} aria-hidden />
          </div>
          <h1 className="font-serif font-bold text-[32px] text-white leading-tight">Welcome, {form.firstName}.</h1>
          <p className="font-sans text-white/60 text-base leading-relaxed mt-3 max-w-sm">
            Your application has been received. Our team will review your documents and get back to you within 3-5 business days.
          </p>
        </div>
        <div className="w-full rounded-2xl p-5 flex flex-col gap-3 text-left auth-card">
          {[
            { step: "1", label: "Application review", detail: "1-2 business days" },
            { step: "2", label: "Document verification", detail: "1-2 business days" },
            { step: "3", label: "On-site audit scheduled", detail: "1-3 weeks" },
            { step: "4", label: "Booking workflow enabled", detail: "Up to 1 week" },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center font-sans font-bold text-[10px] text-gold shrink-0 auth-badge">
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
            className="font-sans font-semibold text-sm rounded-xl px-8 py-3.5 transition-colors btn btn-accent"
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
