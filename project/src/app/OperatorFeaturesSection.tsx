import { Star } from "lucide-react";

export default function OperatorFeaturesSection() {
  return (
    <section id="features" className="py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-12 flex flex-col gap-12 lg:gap-16">
        <div className="flex flex-col items-center text-center gap-5">
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-gold/40" />
            <Star className="icon-accent" size={18} aria-hidden />
            <span className="font-sans text-[11px] font-semibold tracking-[0.18em] text-gold uppercase">
              Core features
            </span>
            <Star className="icon-accent" size={18} aria-hidden />
            <div className="h-px w-10 bg-gold/40" />
          </div>

          <h2 className="font-serif font-bold text-text-dark leading-tight text-[34px] md:text-[50px]">
            Your Tourism Operator OS
          </h2>

          <p className="font-sans text-text-muted text-lg max-w-[640px] leading-relaxed">
            Everything is designed around the inbox workflow: status clarity, quick actions, and message history.
            Future pages (calendar, customers, payments) grow from the same data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          <div
            id="inbox"
            className="flex flex-col gap-4 rounded-2xl p-7 surface border border-emerald-200"
          >
            <h3 className="font-serif font-bold text-[19px] text-text-dark leading-snug">Booking Inbox</h3>
            <p className="font-sans text-text-muted text-sm leading-relaxed">
              WhatsApp-like conversations, but structured by booking so you never lose context.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="font-sans text-[10px] font-bold rounded-full px-2.5 py-1 badge badge-new">NEW</span>
              <span className="font-sans text-[10px] font-bold rounded-full px-2.5 py-1 badge badge-pending">PENDING</span>
              <span className="font-sans text-[10px] font-bold rounded-full px-2.5 py-1 badge badge-confirmed">CONFIRMED</span>
            </div>
          </div>

          <div
            id="bookings"
            className="flex flex-col gap-4 rounded-2xl p-7 surface border-accent"
          >
            <h3 className="font-serif font-bold text-[19px] text-text-dark leading-snug">Booking Tracking</h3>
            <p className="font-sans text-text-muted text-sm leading-relaxed">
              A structured list/table view is built on top of the same inbox bookings.
            </p>
            <p className="font-sans text-text-muted text-sm leading-relaxed">
              Next: filters, bulk actions, and rescheduling.
            </p>
          </div>

          <div
            id="payments"
            className="flex flex-col gap-4 rounded-2xl p-7 surface-muted border-accent"
          >
            <h3 className="font-serif font-bold text-[19px] text-text-dark leading-snug">Deposits & Status</h3>
            <p className="font-sans text-text-muted text-sm leading-relaxed">
              Mark deposits with the real MAD amount so pricing and payment state stay consistent.
            </p>
            <p className="font-sans text-text-muted text-sm leading-relaxed">
              MVP supports UNPAID -{">"} DEPOSIT now.
            </p>
          </div>

          <div
            className="flex flex-col gap-4 rounded-2xl p-7 surface border-accent"
          >
            <h3 className="font-serif font-bold text-[19px] text-text-dark leading-snug">Message History</h3>
            <p className="font-sans text-text-muted text-sm leading-relaxed">
              Operator replies are stored as part of the booking conversation.
            </p>
          </div>

          <div
            className="flex flex-col gap-4 rounded-2xl p-7 surface-muted"
          >
            <h3 className="font-serif font-bold text-[19px] text-text-dark leading-snug">Availability Calendar</h3>
            <p className="font-sans text-text-muted text-sm leading-relaxed">
              Coming soon: rescheduling and conflict prevention directly on booking data.
            </p>
          </div>

          <div
            className="flex flex-col gap-4 rounded-2xl p-7 surface border border-emerald-200"
          >
            <h3 className="font-serif font-bold text-[19px] text-text-dark leading-snug">Customers & Pages</h3>
            <p className="font-sans text-text-muted text-sm leading-relaxed">
              Coming soon: simple CRM and payments summaries based on your inbox.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

