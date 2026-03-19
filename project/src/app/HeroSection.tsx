import Link from "next/link";
import { Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-forest-dark min-h-screen flex items-center pt-[72px] overflow-hidden">
      <div className="absolute inset-0 w-full h-full pointer-events-none bg-moroccan-pattern opacity-40" />

      {/* Warm gold glow */}
      <div className="hero-glow-gold" aria-hidden />

      {/* Zellige glow */}
      <div className="hero-glow-teal" aria-hidden />

      <div className="max-w-7xl mx-auto w-full px-4 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
        {/* Left: Headline & CTA */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <span className="text-gold text-sm">★</span>
            <span className="font-sans text-[11px] font-semibold tracking-[0.18em] text-white/60 uppercase">
              Tourism Operator OS
            </span>
            <span className="text-gold text-sm">★</span>
          </div>

          <div>
            <h1 className="font-serif text-white font-bold leading-[1.05] text-[42px] sm:text-[54px] lg:text-[64px]">
              Replace{" "}
              <span className="italic text-gold">WhatsApp chaos</span>
              <br />
              with a{" "}
              <span className="italic text-gold">structured</span> Operator Inbox
            </h1>
          </div>

          <p className="font-sans text-white/70 text-lg leading-relaxed max-w-[480px]">
            Create bookings, confirm/cancel in one click, collect deposits, and keep every customer message organized
            (tenant-scoped by organization).
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/producer/inbox?new=1"
              className="font-sans font-semibold text-forest-dark bg-gold rounded-xl px-8 py-4 hover:bg-gold-light transition-colors"
            >
              Open Inbox
            </Link>
            <Link
              href="/producer/inbox"
              className="font-sans font-semibold text-white border border-white/30 rounded-xl px-8 py-4 hover:bg-white/5 transition-colors"
            >
              View MVP workflow
            </Link>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-sans text-sm text-white/60">
              Built for Moroccan operators:
            </span>
            <span className="font-sans text-sm text-white font-semibold">fast replies</span>
            <span className="font-sans text-sm text-white font-semibold">clear status</span>
            <span className="font-sans text-sm text-white font-semibold">no double bookings</span>
          </div>
        </div>

        {/* Right: Inbox preview */}
        <div className="hidden lg:flex justify-end">
          <div className="relative">
            <div
              className="absolute rounded-full border border-gold/20 pointer-events-none w-[488px] h-[488px] -top-[52px] left-0 z-0"
            />

            <div
              className="absolute z-20 w-9 h-9 rounded-full bg-forest-mid border border-gold/50 flex items-center justify-center text-gold text-sm -top-[52px] left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
            <Star size={16} aria-hidden />
            </div>

            <div
              className="absolute z-10 text-gold text-xl opacity-70 pointer-events-none -top-[10px] -left-[40px]"
            >
            <Star size={18} aria-hidden />
            </div>

            <div
              className="absolute z-10 text-gold text-base opacity-50 pointer-events-none top-[14px] -right-[24px]"
            >
            <Star size={14} aria-hidden />
            </div>

            <div
              className="relative z-10 w-[488px] rounded-2xl border border-gold/25 overflow-hidden hero-preview-bg"
            >
              <div className="px-5 py-4 flex items-center justify-between">
                <span className="font-sans text-[10px] tracking-[0.2em] text-white/35 uppercase">
                  Operator Inbox MVP
                </span>
                <span
                  className="font-sans text-[10px] font-bold tracking-wider text-white rounded-full px-3 py-1 border"
                  className="font-sans text-[10px] font-bold tracking-wider text-white rounded-full px-3 py-1 border pill-inverse"
                >
                  NEW • PENDING • CONFIRMED
                </span>
              </div>

              <div className="px-5 pb-5">
                <div className="grid grid-cols-[170px_1fr] gap-4">
                  {/* Inbox list */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="font-sans text-[11px] font-bold tracking-wide text-white/60 uppercase">Bookings</p>
                    <div className="flex flex-col gap-2 mt-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-sans text-sm font-semibold text-white truncate">Ahmed - Desert Tour</p>
                          <p className="font-sans text-[11px] text-white/50 mt-0.5">Tomorrow • 10:00</p>
                        </div>
                        <span
                          className="font-sans text-[9px] font-bold rounded-full px-2 py-0.5 uppercase badge badge-pending"
                        >
                          PENDING
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-sans text-sm font-semibold text-white truncate">John - Quad Bike</p>
                          <p className="font-sans text-[11px] text-white/50 mt-0.5">In 2 days • 14:00</p>
                        </div>
                        <span
                          className="font-sans text-[9px] font-bold rounded-full px-2 py-0.5 uppercase badge badge-confirmed"
                        >
                          CONFIRMED
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Booking details */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="font-sans text-[11px] font-bold tracking-wide text-white/60 uppercase">Details</p>

                    <div className="mt-3 flex flex-col gap-2">
                      <div>
                        <p className="font-sans text-[11px] text-white/60 uppercase">Customer</p>
                        <p className="font-serif font-bold text-white text-[14px] mt-0.5">Ahmed</p>
                        <p className="font-sans text-[11px] text-white/55 mt-0.5">+2126xxxxxxx</p>
                      </div>

                      <div>
                        <p className="font-sans text-[11px] text-white/60 uppercase">Activity</p>
                        <p className="font-serif font-bold text-white text-[14px] mt-0.5">Desert Tour</p>
                        <p className="font-sans text-[11px] text-white/55 mt-0.5">Tomorrow • 10:00 • 2 people</p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <span
                          className="font-sans text-[9px] font-bold rounded-full px-2 py-0.5 uppercase badge badge-confirmed"
                        >
                          DEPOSIT
                        </span>
                        <span
                          className="font-sans text-[9px] font-bold rounded-full px-2 py-0.5 uppercase badge badge-new"
                        >
                          INBOX
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span
                        className="font-sans text-[11px] font-semibold rounded-xl px-3 py-1 btn btn-ghost border-accent"
                      >
                        Confirm
                      </span>
                      <span
                        className="font-sans text-[11px] font-semibold rounded-xl px-3 py-1 border border-red-400/25 bg-red-400/10 text-red-300"
                      >
                        Cancel
                      </span>
                      <span
                        className="font-sans text-[11px] font-semibold rounded-xl px-3 py-1 btn btn-ghost border-accent"
                      >
                        Mark Deposit
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 mt-1 flex items-center justify-between border-t border-white/10">
                <span className="font-sans text-[11px] text-white/35">
                  Replace WhatsApp chaos
                </span>
                <Link
                  href="/producer/inbox?new=1"
                  className="font-sans text-[11px] font-bold btn btn-accent"
                >
                  New Booking
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

