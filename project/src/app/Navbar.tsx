"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useSession, signOut } from "~/lib/auth-client";

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-cream-dark">
      <div className="max-w-7xl mx-auto w-full px-4 h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/assets/logo.png"
            alt="TourismOS logo"
            width={120}
            height={40}
            className="object-contain rounded-full h-10 w-auto"
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            "How it works",
            "Inbox",
            "Calendar",
            "Bookings",
            "About",
          ].map((item) => (
            <a
              key={item}
              href="#"
              className="font-sans text-sm text-text-muted hover:text-text-dark transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {isPending ? (
            <span className="font-sans text-sm text-text-muted">…</span>
          ) : session?.user ? (
            <div className="relative flex items-center gap-2">
              <Link
                href="/producer"
                className="font-sans text-sm font-medium text-text-dark border border-text-dark/30 rounded-full px-5 py-2 hover:bg-text-dark/5 transition-colors hidden sm:inline-block"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="font-sans text-sm font-medium text-text-dark border border-text-dark/30 rounded-full px-4 py-2 hover:bg-text-dark/5 transition-colors flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-full bg-forest-mid flex items-center justify-center text-white text-xs font-bold">
                  {(session.user.name ?? session.user.email ?? "?").slice(0, 1).toUpperCase()}
                </span>
                <span className="max-w-[100px] truncate hidden sm:inline">
                  {session.user.name ?? session.user.email}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={menuOpen ? "rotate-180" : ""}
                >
                  <path
                    d="M2.5 4.5L6 8l3.5-3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    aria-hidden
                    onClick={() => setMenuOpen(false)}
                  />
                  <div
                    className="absolute right-0 top-full mt-2 py-2 w-48 rounded-xl bg-white border border-cream-dark shadow-lg z-50"
                    role="menu"
                  >
                    <div className="px-4 py-2 border-b border-cream-dark">
                      <p className="font-sans text-sm font-semibold text-text-dark truncate">
                        {session.user.name ?? "Account"}
                      </p>
                      <p className="font-sans text-xs text-text-muted truncate">
                        {session.user.email}
                      </p>
                    </div>
                    <Link
                      href="/producer"
                      className="block px-4 py-2 font-sans text-sm text-text-dark hover:bg-cream transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 font-sans text-sm text-text-dark hover:bg-cream transition-colors"
                      onClick={() => {
                        signOut();
                        setMenuOpen(false);
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="font-sans text-sm font-medium text-text-dark border border-text-dark/30 rounded-full px-5 py-2 hover:bg-text-dark/5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="font-sans text-sm font-medium text-white bg-forest-mid rounded-full px-5 py-[9px] hover:bg-forest-dark transition-colors"
              >
                Join Platform
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
