import React from "react";

function IconTwitter() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M13 2L9 7l4.5 7H11L8 9.5 4.5 14H2l4.5-7L2 2h2.5L8 6.5 11.5 2H13z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M5 7v4M5 5v.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M8 11V8.5c0-1 .5-1.5 1.5-1.5S11 7.5 11 8.5V11"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="11.5" cy="4.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

const navCols = [
  {
    label: "Platform",
    links: [
      "How it works",
      "Inbox",
      "Calendar",
      "Bookings",
      "Payments",
    ],
  },
  {
    label: "For Partners",
    links: [
      "Apply as Operator",
      "Join as Cooperative",
      "Operator Portal",
      "Get Started",
      "Pricing",
    ],
  },
  {
    label: "For Buyers",
    links: [
      "Browse Experiences",
      "Request a booking",
      "Verified operators",
      "Category guide",
    ],
  },
  {
    label: "Company",
    links: ["About Us", "Press & Media", "Investors", "Careers", "Contact"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-forest-dark">
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-12 pt-14 pb-8 flex flex-col gap-10 lg:gap-12">
        {/* ── Main row ── */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-20">
          {/* Brand column */}
          <div className="flex flex-col gap-6 w-full lg:w-[280px] shrink-0">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {/* <div className="w-9 h-9 rounded-xl bg-forest-mid border border-gold/30 flex items-center justify-center text-gold text-base">
                ◎
              </div> */}
              <div className="flex flex-col">
                <span className="font-sans font-semibold text-white text-xl leading-tight">
                  TourismOS
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="font-sans text-white/45 text-sm leading-relaxed">
              Organize tourism bookings and customer conversations for Moroccan operators.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {[
                <IconTwitter key="tw" />,
                <IconLinkedIn key="li" />,
                <IconInstagram key="ig" />,
              ].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {navCols.map((col) => (
              <div key={col.label} className="flex flex-col gap-4">
                <span className="font-sans text-[10px] font-bold tracking-[0.18em] text-gold uppercase">
                  {col.label}
                </span>
                <div className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <a
                      key={link}
                      href="#"
                      className="font-sans text-sm text-white/45 hover:text-white/75 transition-colors leading-none"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-white/8" />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <span className="font-sans text-sm text-white/25">
            © 2026 TourismOS. All rights reserved. Morocco.
          </span>
          <div className="flex flex-wrap items-center gap-4 sm:gap-8">
            {[
              "Privacy Policy",
              "Terms of Service",
              "Legal Notices",
              "Cookie Settings",
            ].map((link) => (
              <a
                key={link}
                href="#"
                className="font-sans text-sm text-white/25 hover:text-white/50 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
