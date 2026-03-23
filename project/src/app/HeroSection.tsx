import { Star } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
	return (
		<section className="relative flex min-h-screen items-center overflow-hidden bg-forest-dark pt-[72px]">
			<div className="pointer-events-none absolute inset-0 h-full w-full bg-moroccan-pattern opacity-40" />

			{/* Warm gold glow */}
			<div aria-hidden className="hero-glow-gold" />

			{/* Zellige glow */}
			<div aria-hidden className="hero-glow-teal" />

			<div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 py-14 lg:grid-cols-2 lg:gap-20 lg:py-20">
				{/* Left: Headline & CTA */}
				<div className="flex flex-col gap-8">
					<div className="flex items-center gap-2">
						<span className="text-gold text-sm">★</span>
						<span className="font-sans font-semibold text-[11px] text-white/60 uppercase tracking-[0.18em]">
							Tourism Operator OS
						</span>
						<span className="text-gold text-sm">★</span>
					</div>

					<div>
						<h1 className="font-bold font-serif text-[42px] text-white leading-[1.05] sm:text-[54px] lg:text-[64px]">
							Replace <span className="text-gold italic">WhatsApp chaos</span>
							<br />
							with a <span className="text-gold italic">structured</span>{" "}
							Operator Inbox
						</h1>
					</div>

					<p className="max-w-[480px] font-sans text-lg text-white/70 leading-relaxed">
						Create bookings, confirm/cancel in one click, collect deposits, and
						keep every customer message organized (tenant-scoped by
						organization).
					</p>

					<div className="flex flex-wrap items-center gap-4">
						<Link
							className="rounded-xl bg-gold px-8 py-4 font-sans font-semibold text-forest-dark transition-colors hover:bg-gold-light"
							href="/producer/inbox?new=1"
						>
							Open Inbox
						</Link>
						<Link
							className="rounded-xl border border-white/30 px-8 py-4 font-sans font-semibold text-white transition-colors hover:bg-white/5"
							href="/producer/inbox"
						>
							View MVP workflow
						</Link>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<span className="font-sans text-sm text-white/60">
							Built for Moroccan operators:
						</span>
						<span className="font-sans font-semibold text-sm text-white">
							fast replies
						</span>
						<span className="font-sans font-semibold text-sm text-white">
							clear status
						</span>
						<span className="font-sans font-semibold text-sm text-white">
							no double bookings
						</span>
					</div>
				</div>

				{/* Right: Inbox preview */}
				<div className="hidden justify-end lg:flex">
					<div className="relative">
						<div className="pointer-events-none absolute -top-[52px] left-0 z-0 h-[488px] w-[488px] rounded-full border border-gold/20" />

						<div className="absolute -top-[52px] left-1/2 z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/50 bg-forest-mid text-gold text-sm">
							<Star aria-hidden size={16} />
						</div>

						<div className="pointer-events-none absolute -top-[10px] -left-[40px] z-10 text-gold text-xl opacity-70">
							<Star aria-hidden size={18} />
						</div>

						<div className="pointer-events-none absolute top-[14px] -right-[24px] z-10 text-base text-gold opacity-50">
							<Star aria-hidden size={14} />
						</div>

						<div className="hero-preview-bg relative z-10 w-[488px] overflow-hidden rounded-2xl border border-gold/25">
							<div className="flex items-center justify-between px-5 py-4">
								<span className="font-sans text-[10px] text-white/35 uppercase tracking-[0.2em]">
									Operator Inbox MVP
								</span>
								<span className="pill-inverse rounded-full border px-3 py-1 font-bold font-sans text-[10px] text-white tracking-wider">
									NEW • PENDING • CONFIRMED
								</span>
							</div>

							<div className="px-5 pb-5">
								<div className="grid grid-cols-[170px_1fr] gap-4">
									{/* Inbox list */}
									<div className="rounded-xl border border-white/10 bg-white/5 p-3">
										<p className="font-bold font-sans text-[11px] text-white/60 uppercase tracking-wide">
											Bookings
										</p>
										<div className="mt-3 flex flex-col gap-2">
											<div className="flex items-center justify-between gap-3">
												<div className="min-w-0">
													<p className="truncate font-sans font-semibold text-sm text-white">
														Ahmed - Desert Tour
													</p>
													<p className="mt-0.5 font-sans text-[11px] text-white/50">
														Tomorrow • 10:00
													</p>
												</div>
												<span className="badge badge-pending rounded-full px-2 py-0.5 font-bold font-sans text-[9px] uppercase">
													PENDING
												</span>
											</div>

											<div className="flex items-center justify-between gap-3">
												<div className="min-w-0">
													<p className="truncate font-sans font-semibold text-sm text-white">
														John - Quad Bike
													</p>
													<p className="mt-0.5 font-sans text-[11px] text-white/50">
														In 2 days • 14:00
													</p>
												</div>
												<span className="badge badge-confirmed rounded-full px-2 py-0.5 font-bold font-sans text-[9px] uppercase">
													CONFIRMED
												</span>
											</div>
										</div>
									</div>

									{/* Booking details */}
									<div className="rounded-xl border border-white/10 bg-white/5 p-3">
										<p className="font-bold font-sans text-[11px] text-white/60 uppercase tracking-wide">
											Details
										</p>

										<div className="mt-3 flex flex-col gap-2">
											<div>
												<p className="font-sans text-[11px] text-white/60 uppercase">
													Customer
												</p>
												<p className="mt-0.5 font-bold font-serif text-[14px] text-white">
													Ahmed
												</p>
												<p className="mt-0.5 font-sans text-[11px] text-white/55">
													+2126xxxxxxx
												</p>
											</div>

											<div>
												<p className="font-sans text-[11px] text-white/60 uppercase">
													Activity
												</p>
												<p className="mt-0.5 font-bold font-serif text-[14px] text-white">
													Desert Tour
												</p>
												<p className="mt-0.5 font-sans text-[11px] text-white/55">
													Tomorrow • 10:00 • 2 people
												</p>
											</div>

											<div className="flex flex-wrap gap-2 pt-1">
												<span className="badge badge-confirmed rounded-full px-2 py-0.5 font-bold font-sans text-[9px] uppercase">
													DEPOSIT
												</span>
												<span className="badge badge-new rounded-full px-2 py-0.5 font-bold font-sans text-[9px] uppercase">
													INBOX
												</span>
											</div>
										</div>

										<div className="mt-4 flex flex-wrap gap-2">
											<span className="btn btn-ghost rounded-xl border-accent px-3 py-1 font-sans font-semibold text-[11px]">
												Confirm
											</span>
											<span className="rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-1 font-sans font-semibold text-[11px] text-red-300">
												Cancel
											</span>
											<span className="btn btn-ghost rounded-xl border-accent px-3 py-1 font-sans font-semibold text-[11px]">
												Mark Deposit
											</span>
										</div>
									</div>
								</div>
							</div>

							<div className="mt-1 flex items-center justify-between border-white/10 border-t px-5 py-3">
								<span className="font-sans text-[11px] text-white/35">
									Replace WhatsApp chaos
								</span>
								<Link
									className="btn btn-accent font-bold font-sans text-[11px]"
									href="/producer/inbox?new=1"
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
