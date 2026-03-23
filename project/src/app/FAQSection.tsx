"use client";

import { ArrowRight, Star } from "lucide-react";
import React, { useState } from "react";

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
		<section className="section-alt py-16 lg:py-24" id="faq">
			<div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-4 sm:px-6 lg:gap-16 lg:px-12">
				{/* ── Section header ── */}
				<div className="flex flex-col items-center gap-5 text-center">
					<div className="flex items-center gap-3">
						<div className="h-px w-10 bg-gold/40" />
						<Star aria-hidden className="icon-accent" size={18} />
						<span className="font-sans font-semibold text-[11px] text-gold uppercase tracking-[0.18em]">
							Frequently Asked Questions
						</span>
						<Star aria-hidden className="icon-accent" size={18} />
						<div className="h-px w-10 bg-gold/40" />
					</div>

					<h2 className="font-bold font-serif text-[34px] text-text-dark leading-tight md:text-[50px]">
						Everything you need
						<br />
						to know
					</h2>

					<p className="max-w-[480px] font-sans text-lg text-text-muted leading-relaxed">
						Answers to the most common questions from tourism operators using
						TourismOS.
					</p>
				</div>

				{/* ── FAQ list ── */}
				<div className="mx-auto flex w-full max-w-[820px] flex-col">
					{faqs.map((faq, i) => (
						<div className="border-cream-dark border-b" key={i}>
							<button
								className="flex w-full items-center justify-between gap-6 py-7 text-left"
								onClick={() => setOpen(open === i ? -1 : i)}
							>
								<span className="font-sans font-semibold text-[17px] text-text-dark leading-snug">
									{faq.q}
								</span>
								<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent">
									<span className="relative -top-px text-base text-gold leading-none">
										{open === i ? "−" : "+"}
									</span>
								</div>
							</button>
							{open === i && (
								<p className="max-w-[720px] pb-7 font-sans text-[15px] text-text-muted leading-relaxed">
									{faq.a}
								</p>
							)}
						</div>
					))}

					{/* Still have questions card */}
					<div className="surface-muted mt-8 flex flex-col gap-4 rounded-2xl border-accent px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
						<div>
							<p className="mb-0.5 font-sans font-semibold text-[15px] text-text-dark">
								Still have questions?
							</p>
							<p className="font-sans text-sm text-text-muted">
								Our team typically responds within one business day.
							</p>
						</div>
						<button className="btn btn-primary flex shrink-0 items-center gap-2 rounded-xl px-6 py-3 font-sans text-sm text-white">
							Contact Support
							<ArrowRight aria-hidden size={14} />
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
