import Link from "next/link";
import { Star } from "lucide-react";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 lg:py-24 section-alt">
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-12 flex flex-col gap-12 lg:gap-16">
        <div className="flex flex-col items-center text-center gap-5">
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-gold/40" />
            <Star className="icon-accent" size={18} aria-hidden />
            <span className="font-sans text-[11px] font-semibold tracking-[0.18em] text-gold uppercase">
              How it works
            </span>
            <Star className="icon-accent" size={18} aria-hidden />
            <div className="h-px w-10 bg-gold/40" />
          </div>

          <h2 className="font-serif font-bold text-text-dark leading-tight text-[34px] md:text-[50px]">
            From WhatsApp chaos
            <br />
            to organized bookings
          </h2>

          <p className="font-sans text-text-muted text-lg max-w-[560px] leading-relaxed">
            The MVP is built around one truth from operators: everything starts with WhatsApp. TourismOS replaces it
            with a structured inbox you can trust every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div
            className="flex flex-col gap-5 rounded-2xl p-7 surface border-accent"
          >
            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] font-bold tracking-[0.18em] text-gold uppercase">Step 1</span>
              <span className="font-serif font-bold text-[26px] text-text-dark">New</span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-[19px] text-text-dark leading-snug">Create a booking in seconds</h3>
              <p className="font-sans text-text-muted text-sm leading-relaxed mt-2">
                Click “New Booking”, fill the essentials (customer, date/time, people, price), and you’re in.
              </p>
            </div>
          </div>

          <div
            className="flex flex-col gap-5 rounded-2xl p-7 surface-muted"
          >
            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] font-bold tracking-[0.18em] text-gold uppercase">Step 2</span>
              <span className="font-serif font-bold text-[26px] text-text-dark">Confirm</span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-[19px] text-text-dark leading-snug">Manage status and deposits</h3>
              <p className="font-sans text-text-muted text-sm leading-relaxed mt-2">
                Confirm or cancel in one click. Mark deposit with the real MAD amount so payments stay consistent.
              </p>
            </div>
          </div>

          <div
            className="flex flex-col gap-5 rounded-2xl p-7 surface border border-emerald-200"
          >
            <div className="flex items-center justify-between">
              <span className="font-sans text-[11px] font-bold tracking-[0.18em] text-gold uppercase">Step 3</span>
              <span className="font-serif font-bold text-[26px] text-text-dark">Inbox</span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-[19px] text-text-dark leading-snug">Keep every message organized</h3>
              <p className="font-sans text-text-muted text-sm leading-relaxed mt-2">
                Customer replies and your updates live in one conversation. No lost chats, no notebook.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center pt-2">
          <Link
            href="/producer/inbox?new=1"
            className="font-sans rounded-xl px-8 py-4 btn btn-accent"
          >
            Try the inbox workflow
          </Link>
        </div>
      </div>
    </section>
  );
}

