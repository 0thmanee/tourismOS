import { Star } from "lucide-react";
import Link from "next/link";

export default function HowItWorksSection() {
	return (
		<section className="section-alt py-16 lg:py-24" id="how-it-works">
			<div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-4 sm:px-6 lg:gap-16 lg:px-12">
				<div className="flex flex-col items-center gap-5 text-center">
					<div className="flex items-center gap-3">
						<div className="h-px w-10 bg-gold/40" />
						<Star aria-hidden className="icon-accent" size={18} />
						<span className="font-sans font-semibold text-[11px] text-gold uppercase tracking-[0.18em]">
							How it works
						</span>
						<Star aria-hidden className="icon-accent" size={18} />
						<div className="h-px w-10 bg-gold/40" />
					</div>

					<h2 className="font-bold font-serif text-[34px] text-text-dark leading-tight md:text-[50px]">
						From WhatsApp chaos
						<br />
						to organized bookings
					</h2>

					<p className="max-w-[560px] font-sans text-lg text-text-muted leading-relaxed">
						The MVP is built around one truth from operators: everything starts
						with WhatsApp. TourismOS replaces it with a structured inbox you can
						trust every day.
					</p>
				</div>

				<div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
					<div className="surface flex flex-col gap-5 rounded-2xl border-accent p-7">
						<div className="flex items-center justify-between">
							<span className="font-bold font-sans text-[11px] text-gold uppercase tracking-[0.18em]">
								Step 1
							</span>
							<span className="font-bold font-serif text-[26px] text-text-dark">
								New
							</span>
						</div>
						<div>
							<h3 className="font-bold font-serif text-[19px] text-text-dark leading-snug">
								Create a booking in seconds
							</h3>
							<p className="mt-2 font-sans text-sm text-text-muted leading-relaxed">
								Click “New Booking”, fill the essentials (customer, date/time,
								people, price), and you’re in.
							</p>
						</div>
					</div>

					<div className="surface-muted flex flex-col gap-5 rounded-2xl p-7">
						<div className="flex items-center justify-between">
							<span className="font-bold font-sans text-[11px] text-gold uppercase tracking-[0.18em]">
								Step 2
							</span>
							<span className="font-bold font-serif text-[26px] text-text-dark">
								Confirm
							</span>
						</div>
						<div>
							<h3 className="font-bold font-serif text-[19px] text-text-dark leading-snug">
								Manage status and deposits
							</h3>
							<p className="mt-2 font-sans text-sm text-text-muted leading-relaxed">
								Confirm or cancel in one click. Mark deposit with the real MAD
								amount so payments stay consistent.
							</p>
						</div>
					</div>

					<div className="surface flex flex-col gap-5 rounded-2xl border border-emerald-200 p-7">
						<div className="flex items-center justify-between">
							<span className="font-bold font-sans text-[11px] text-gold uppercase tracking-[0.18em]">
								Step 3
							</span>
							<span className="font-bold font-serif text-[26px] text-text-dark">
								Inbox
							</span>
						</div>
						<div>
							<h3 className="font-bold font-serif text-[19px] text-text-dark leading-snug">
								Keep every message organized
							</h3>
							<p className="mt-2 font-sans text-sm text-text-muted leading-relaxed">
								Customer replies and your updates live in one conversation. No
								lost chats, no notebook.
							</p>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-center pt-2">
					<Link
						className="btn btn-accent rounded-xl px-8 py-4 font-sans"
						href="/producer/inbox?new=1"
					>
						Try the inbox workflow
					</Link>
				</div>
			</div>
		</section>
	);
}
