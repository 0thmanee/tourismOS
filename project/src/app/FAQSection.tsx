"use client";

import React, { useState } from "react";
import { ArrowRight, Star } from "lucide-react";

const faqs = [
  {
    q: "What is TourismOS and who is it for?",
    a: "TourismOS helps Moroccan tourism operators organize bookings and customer conversations in one place. It's designed for small teams that currently run everything through WhatsApp and manual coordination.",
  },
  {
    q: "How does the booking workflow work?",
    a: "Create bookings with date/time and people count, keep all messages in a structured inbox, and manage status (New, Pending, Confirmed, Cancelled) to prevent double bookings.",
  },
  {
    q: "Can I confirm or cancel a booking?",
    a: "Yes. In the inbox detail view, you can confirm or cancel with one click. The booking status updates instantly and stays consistent across your workflow.",
  },
  {
    q: "Do you support deposits?",
    a: "MVP supports marking deposits with the real MAD amount. This helps you track UNPAID vs DEPOSIT consistently and avoid payment confusion.",
  },
  {
    q: "Is TourismOS a marketplace?",
    a: "No. TourismOS is your operator system of record. It replaces WhatsApp chaos with structured inbox + booking tracking. Discovery and broader marketplace layers can come later.",
  },
  {
    q: "How does multi-operator / team access work?",
    a: "Data is scoped by organization (tenant). Your inbox and bookings are isolated per organization so you can manage multiple teams safely.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="py-16 lg:py-24 section-alt">
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-12 flex flex-col gap-12 lg:gap-16">
        {/* ── Section header ── */}
        <div className="flex flex-col items-center text-center gap-5">
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-gold/40" />
            <Star className="icon-accent" size={18} aria-hidden />
            <span className="font-sans text-[11px] font-semibold tracking-[0.18em] text-gold uppercase">
              Frequently Asked Questions
            </span>
            <Star className="icon-accent" size={18} aria-hidden />
            <div className="h-px w-10 bg-gold/40" />
          </div>

          <h2 className="font-serif font-bold text-text-dark leading-tight text-[34px] md:text-[50px]">
            Everything you need
            <br />
            to know
          </h2>

          <p className="font-sans text-text-muted text-lg max-w-[480px] leading-relaxed">
            Answers to the most common questions from tourism operators using TourismOS.
          </p>
        </div>

        {/* ── FAQ list ── */}
        <div className="flex flex-col max-w-[820px] w-full mx-auto">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-cream-dark">
              <button
                className="w-full flex items-center justify-between gap-6 py-7 text-left"
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                <span className="font-sans font-semibold text-text-dark text-[17px] leading-snug">
                  {faq.q}
                </span>
                <div
                  className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center border border-accent"
                >
                  <span
                    className="text-gold text-base leading-none relative -top-px"
                  >
                    {open === i ? "−" : "+"}
                  </span>
                </div>
              </button>
              {open === i && (
                <p className="font-sans text-text-muted text-[15px] leading-relaxed pb-7 max-w-[720px]">
                  {faq.a}
                </p>
              )}
            </div>
          ))}

          {/* Still have questions card */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl px-6 sm:px-8 py-6 surface-muted border-accent">
            <div>
              <p className="font-sans font-semibold text-text-dark text-[15px] mb-0.5">
                Still have questions?
              </p>
              <p className="font-sans text-text-muted text-sm">
                Our team typically responds within one business day.
              </p>
            </div>
            <button
              className="shrink-0 flex items-center gap-2 font-sans text-sm text-white rounded-xl px-6 py-3 btn btn-primary"
            >
              Contact Support
              <ArrowRight size={14} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
