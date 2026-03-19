import React from "react";
import { Globe, Quote, Star } from "lucide-react";

const testimonials = [
  {
    location: "SOUSS-MASSA REGION",
    icon: <Quote aria-hidden size={14} />,
    iconTone: "text-forest-mid",
    quote:
      '"TourismOS replaced our WhatsApp chaos with a structured inbox. We reply faster, confirm bookings confidently, and keep every detail in one place."',
    name: "Fatima Ait Benhaddou",
    role: "Director, Coopérative Tissint — Argan & Rose",
    initials: "FA",
    badge: "OPERATOR",
  },
  {
    location: "AMSTERDAM, NETHERLANDS",
    icon: <Globe aria-hidden size={14} />,
    iconTone: "text-gold",
    quote:
      '"We stopped chasing messages. TourismOS gives us clear booking statuses so confirmations and deposits never get messy."',
    name: "Lars Van der Berg",
    role: "Procurement Director, NaturaBio Imports — Amsterdam",
    initials: "LV",
    badge: "OPERATOR",
  },
  {
    location: "TALIOUINE REGION",
    icon: <Quote aria-hidden size={14} />,
    iconTone: "text-gold",
    quote:
      '"The inbox is simple. Our team can handle the weekend rush without losing bookings or repeating the same messages."',
    name: "Mohammed Benali",
    role: "Producer, Domaine Berbère — Saffron, Taliouine",
    initials: "MB",
    badge: "OPERATOR",
  },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function TestimonialsSection() {
  return (
    <section className="section-base py-16 lg:py-24">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col gap-12 lg:gap-16">
        {/* ── Section header ── */}
        <div className="flex flex-col items-center text-center gap-5">
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-gold/40" />
            <Star className="icon-accent" size={18} aria-hidden />
            <span className="font-sans text-[11px] font-semibold tracking-[0.18em] text-gold uppercase">
              Operator Stories
            </span>
            <Star className="icon-accent" size={18} aria-hidden />
            <div className="h-px w-10 bg-gold/40" />
          </div>

          <h2 className="font-serif font-bold text-text-dark leading-tight text-[34px] md:text-[50px]">
            Trusted by operators
            <br />
            who run bookings daily
          </h2>

          <p className="font-sans text-text-muted text-lg max-w-[480px] leading-relaxed">
            Less chaos, faster confirmations, and message history that you can actually find later.
          </p>
        </div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-[20px] overflow-hidden surface shadow-soft"
            >
              {/* Top gradient bar */}
              <div className="h-1.5 shrink-0 bg-gold" />

              {/* Card content */}
              <div className="flex flex-col gap-6 p-9 flex-1">
                {/* Location row */}
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center shrink-0 rounded-xl surface-muted ${t.iconTone}`}>
                    {t.icon}
                  </div>
                  <span
                    className="font-sans text-[11px] font-bold tracking-[0.14em] uppercase"
                  >
                    {t.location}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-gold" size={16} aria-hidden />
                  ))}
                </div>

                {/* Quote */}
                <p
                  className="font-serif italic text-[17px] leading-relaxed flex-1"
                >
                  {t.quote}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-sans font-bold text-sm text-white bg-forest-mid"
                  >
                    {t.initials}
                  </div>

                  {/* Name + role */}
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <p
                      className="font-sans font-semibold text-sm leading-tight"
                    >
                      {t.name}
                    </p>
                    <p
                      className="font-sans text-[12px] leading-tight"
                    >
                      {t.role}
                    </p>
                  </div>

                  {/* Badge */}
                  <span
                    className="font-sans text-[9px] font-bold tracking-wider rounded-full px-2.5 py-1 shrink-0 uppercase surface-muted border border-accent"
                  >
                    {t.badge}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
