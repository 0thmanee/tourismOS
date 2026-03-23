import { Globe, Quote, Star } from "lucide-react";
import React from "react";

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
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:gap-16">
				{/* ── Section header ── */}
				<div className="flex flex-col items-center gap-5 text-center">
					<div className="flex items-center gap-3">
						<div className="h-px w-10 bg-gold/40" />
						<Star aria-hidden className="icon-accent" size={18} />
						<span className="font-sans font-semibold text-[11px] text-gold uppercase tracking-[0.18em]">
							Operator Stories
						</span>
						<Star aria-hidden className="icon-accent" size={18} />
						<div className="h-px w-10 bg-gold/40" />
					</div>

					<h2 className="font-bold font-serif text-[34px] text-text-dark leading-tight md:text-[50px]">
						Trusted by operators
						<br />
						who run bookings daily
					</h2>

					<p className="max-w-[480px] font-sans text-lg text-text-muted leading-relaxed">
						Less chaos, faster confirmations, and message history that you can
						actually find later.
					</p>
				</div>

				{/* ── Cards ── */}
				<div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
					{testimonials.map((t) => (
						<div
							className="surface flex flex-col overflow-hidden rounded-[20px] shadow-soft"
							key={t.name}
						>
							{/* Top gradient bar */}
							<div className="h-1.5 shrink-0 bg-gold" />

							{/* Card content */}
							<div className="flex flex-1 flex-col gap-6 p-9">
								{/* Location row */}
								<div className="flex items-center gap-3">
									<div
										className={`surface-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${t.iconTone}`}
									>
										{t.icon}
									</div>
									<span className="font-bold font-sans text-[11px] uppercase tracking-[0.14em]">
										{t.location}
									</span>
								</div>

								{/* Stars */}
								<div className="flex gap-0.5">
									{[...Array(5)].map((_, i) => (
										<Star aria-hidden className="text-gold" key={i} size={16} />
									))}
								</div>

								{/* Quote */}
								<p className="flex-1 font-serif text-[17px] italic leading-relaxed">
									{t.quote}
								</p>

								{/* Author */}
								<div className="flex items-center gap-3">
									{/* Avatar */}
									<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-mid font-bold font-sans text-sm text-white">
										{t.initials}
									</div>

									{/* Name + role */}
									<div className="flex min-w-0 flex-1 flex-col gap-0.5">
										<p className="font-sans font-semibold text-sm leading-tight">
											{t.name}
										</p>
										<p className="font-sans text-[12px] leading-tight">
											{t.role}
										</p>
									</div>

									{/* Badge */}
									<span className="surface-muted shrink-0 rounded-full border border-accent px-2.5 py-1 font-bold font-sans text-[9px] uppercase tracking-wider">
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
