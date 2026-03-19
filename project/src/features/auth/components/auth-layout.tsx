"use client";

import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";

export const inputCls =
  "font-sans text-sm rounded-xl px-4 py-2.5 w-full transition-colors placeholder:text-white/25 auth-input";

export function AuthLayout({
  children,
  title,
  subtitle,
  showRegisterLink = false,
  showLoginLink = false,
  contentClassName = "max-w-md",
  contentCenter = true,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: React.ReactNode;
  showRegisterLink?: boolean;
  showLoginLink?: boolean;
  contentClassName?: string;
  contentCenter?: boolean;
}) {
  return (
    <div className="auth-shell">
      <div className="auth-pattern bg-moroccan-pattern" aria-hidden />

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 px-10 py-12 relative z-10 border-r auth-panel">
        <div>
          <Link href="/" className="flex flex-col gap-0.5 mb-14">
            <span className="font-sans font-semibold text-white text-[18px] leading-tight">
              TourismOS
            </span>
            <span className="font-sans text-[9px] font-bold tracking-[0.2em] text-white/35 uppercase">
              Operator Portal
            </span>
          </Link>
          <div className="flex flex-col gap-3 mb-10">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-gold/40" />
              <span className="font-sans text-[10px] font-semibold tracking-[0.18em] text-gold uppercase">
                {title}
              </span>
            </div>
            <h2 className="font-serif font-bold text-[36px] text-white leading-tight">
              {subtitle}
            </h2>
            <p className="font-sans text-white/55 text-sm leading-relaxed max-w-[300px]">
              A structured operator inbox for Moroccan tourism bookings.
            </p>
          </div>
        </div>
        <div className="rounded-2xl p-5 auth-card">
          <div className="flex gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="text-gold" size={14} aria-hidden />
            ))}
          </div>
          <p className="font-serif italic text-[14px] text-white/80 leading-relaxed">
            &ldquo;We stopped losing messages and double booking by keeping everything in one inbox.&rdquo;
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col relative z-10 overflow-y-auto">
        <div className="flex items-center justify-between px-6 lg:px-10 py-6 shrink-0">
          <Link
            href="/"
            className="lg:hidden font-sans font-semibold text-white text-[16px]"
          >
            TourismOS
          </Link>
          <div className="hidden lg:block" />
          <span className="font-sans text-sm text-white/40">
            {showRegisterLink && (
              <>
                New here?{" "}
                <Link
                  href="/auth/register"
                  className="text-gold hover:text-gold/80 transition-colors font-semibold"
                >
                  Join Platform
                </Link>
              </>
            )}
            {showLoginLink && (
              <>
                Already a partner?{" "}
                <Link
                  href="/auth/login"
                  className="text-gold hover:text-gold/80 transition-colors font-semibold"
                >
                  Sign in
                </Link>
              </>
            )}
          </span>
        </div>
        <div className={`flex-1 flex flex-col px-6 lg:px-10 pb-10 ${contentCenter ? "items-center justify-center" : "items-center"}`}>
          <div className={`w-full ${contentClassName}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}
