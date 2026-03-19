"use client";

import React from "react";
import Link from "next/link";

const authLayoutBg =
  "linear-gradient(in oklab 160deg, oklab(14% -0.025 0.012) 0%, oklab(22% -0.038 0.018) 100%)";

const patternSvg = (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    style={{ opacity: 0.04 }}
    aria-hidden
  >
    <defs>
      <pattern
        id="auth-pattern"
        x="0"
        y="0"
        width="48"
        height="48"
        patternUnits="userSpaceOnUse"
      >
        <rect
          x="10"
          y="10"
          width="28"
          height="28"
          fill="none"
          stroke="rgba(201,145,61,1)"
          strokeWidth="0.7"
        />
        <rect
          x="10"
          y="10"
          width="28"
          height="28"
          fill="none"
          stroke="rgba(201,145,61,1)"
          strokeWidth="0.7"
          transform="rotate(45 24 24)"
        />
        <circle cx="24" cy="24" r="3" fill="rgba(201,145,61,0.4)" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#auth-pattern)" />
  </svg>
);

const inputCls =
  "font-sans text-sm text-white rounded-xl px-4 py-2.5 outline-none w-full transition-colors placeholder:text-white/25";
const inputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
};
const inputFocusStyle = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(201,145,61,0.4)",
};

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
    <div
      className="min-h-screen flex"
      style={{ background: authLayoutBg }}
    >
      {patternSvg}

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 px-10 py-12 relative z-10 border-r border-white/6">
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
        <div
          className="rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-gold text-sm">
                ★
              </span>
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

export { inputCls, inputStyle, inputFocusStyle };
