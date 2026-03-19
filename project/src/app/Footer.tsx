import React from "react";
import { Instagram, Linkedin, Twitter } from "lucide-react";

const navCols = [
  {
    label: "Product",
    links: [
      { label: "Inbox", href: "#inbox" },
      { label: "Bookings", href: "#bookings" },
      { label: "Payments", href: "#payments" },
      { label: "Calendar", href: "#features" },
    ],
  },
  {
    label: "Operators",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Get started", href: "/producer/inbox?new=1" },
      { label: "FAQ", href: "#faq" },
      { label: "Operator Inbox MVP", href: "/producer/inbox" },
    ],
  },
  {
    label: "Support",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Contact support", href: "#faq" },
      { label: "Release notes", href: "#features" },
      { label: "Changelog", href: "#features" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "About", href: "#features" },
      { label: "Pricing", href: "#features" },
      { label: "Contact", href: "#faq" },
      { label: "Careers", href: "#features" },
    ],
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
                <Twitter key="tw" size={16} aria-hidden />,
                <Linkedin key="li" size={16} aria-hidden />,
                <Instagram key="ig" size={16} aria-hidden />,
              ].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 transition-colors footer-iconbtn"
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
                      key={link.href}
                      href={link.href}
                      className="font-sans text-sm text-white/45 hover:text-white/75 transition-colors leading-none"
                    >
                      {link.label}
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
