import { Star } from "lucide-react";

export default function OperatorFeaturesSection() {
	return (
		<section className="py-16 lg:py-24" id="features">
			<div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-4 sm:px-6 lg:gap-16 lg:px-12">
				<div className="flex flex-col items-center gap-5 text-center">
					<div className="flex items-center gap-3">
						<div className="h-px w-10 bg-gold/40" />
						<Star aria-hidden className="icon-accent" size={18} />
						<span className="font-sans font-semibold text-[11px] text-gold uppercase tracking-[0.18em]">
							Core features
						</span>
						<Star aria-hidden className="icon-accent" size={18} />
						<div className="h-px w-10 bg-gold/40" />
					</div>

					<h2 className="font-bold font-serif text-[34px] text-text-dark leading-tight md:text-[50px]">
						Your Tourism Operator OS
					</h2>

					<p className="max-w-[640px] font-sans text-lg text-text-muted leading-relaxed">
						Everything is designed around the inbox workflow: status clarity,
						quick actions, and message history. Future pages (calendar,
						customers, payments) grow from the same data.
					</p>
				</div>

				<div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					<div
						className="surface flex flex-col gap-4 rounded-2xl border border-emerald-200 p-7"
						id="inbox"
					>
						<h3 className="font-bold font-serif text-[19px] text-text-dark leading-snug">
							Booking Inbox
						</h3>
						<p className="font-sans text-sm text-text-muted leading-relaxed">
							WhatsApp-like conversations, but structured by booking so you
							never lose context.
						</p>
						<div className="flex flex-wrap gap-2 pt-2">
							<span className="badge badge-new rounded-full px-2.5 py-1 font-bold font-sans text-[10px]">
								NEW
							</span>
							<span className="badge badge-pending rounded-full px-2.5 py-1 font-bold font-sans text-[10px]">
								PENDING
							</span>
							<span className="badge badge-confirmed rounded-full px-2.5 py-1 font-bold font-sans text-[10px]">
								CONFIRMED
							</span>
						</div>
					</div>

					<div
						className="surface flex flex-col gap-4 rounded-2xl border-accent p-7"
						id="bookings"
					>
						<h3 className="font-bold font-serif text-[19px] text-text-dark leading-snug">
							Booking Tracking
						</h3>
						<p className="font-sans text-sm text-text-muted leading-relaxed">
							A structured list/table view is built on top of the same inbox
							bookings.
						</p>
						<p className="font-sans text-sm text-text-muted leading-relaxed">
							Next: filters, bulk actions, and rescheduling.
						</p>
					</div>

					<div
						className="surface-muted flex flex-col gap-4 rounded-2xl border-accent p-7"
						id="payments"
					>
						<h3 className="font-bold font-serif text-[19px] text-text-dark leading-snug">
							Deposits & Status
						</h3>
						<p className="font-sans text-sm text-text-muted leading-relaxed">
							Mark deposits with the real MAD amount so pricing and payment
							state stay consistent.
						</p>
						<p className="font-sans text-sm text-text-muted leading-relaxed">
							MVP supports UNPAID -{">"} DEPOSIT now.
						</p>
					</div>

					<div className="surface flex flex-col gap-4 rounded-2xl border-accent p-7">
						<h3 className="font-bold font-serif text-[19px] text-text-dark leading-snug">
							Message History
						</h3>
						<p className="font-sans text-sm text-text-muted leading-relaxed">
							Operator replies are stored as part of the booking conversation.
						</p>
					</div>

					<div className="surface-muted flex flex-col gap-4 rounded-2xl p-7">
						<h3 className="font-bold font-serif text-[19px] text-text-dark leading-snug">
							Availability Calendar
						</h3>
						<p className="font-sans text-sm text-text-muted leading-relaxed">
							Coming soon: rescheduling and conflict prevention directly on
							booking data.
						</p>
					</div>

					<div className="surface flex flex-col gap-4 rounded-2xl border border-emerald-200 p-7">
						<h3 className="font-bold font-serif text-[19px] text-text-dark leading-snug">
							Customers & Pages
						</h3>
						<p className="font-sans text-sm text-text-muted leading-relaxed">
							Coming soon: simple CRM and payments summaries based on your
							inbox.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
