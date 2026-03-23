import { Instagram, Linkedin, Twitter } from "lucide-react";
import React from "react";

const navCols = [
	{
		label: "Product",
		links: [
			{ label: "Inbox", href: "#inbox" },
			{ label: "Bookings", href: "#bookings" },
			{ label: "Payments", href: "#payments" },
			{ label: "Calendar", href: "#features" },
		],
	},
	{
		label: "Operators",
		links: [
			{ label: "How it works", href: "#how-it-works" },
			{ label: "Get started", href: "/producer/inbox?new=1" },
			{ label: "FAQ", href: "#faq" },
			{ label: "Operator Inbox MVP", href: "/producer/inbox" },
		],
	},
	{
		label: "Support",
		links: [
			{ label: "FAQ", href: "#faq" },
			{ label: "Contact support", href: "#faq" },
			{ label: "Release notes", href: "#features" },
			{ label: "Changelog", href: "#features" },
		],
	},
	{
		label: "Company",
		links: [
			{ label: "About", href: "#features" },
			{ label: "Pricing", href: "#features" },
			{ label: "Contact", href: "#faq" },
			{ label: "Careers", href: "#features" },
		],
	},
];

export default function Footer() {
	return (
		<footer className="bg-forest-dark">
			<div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 pt-14 pb-8 sm:px-6 lg:gap-12 lg:px-12">
				{/* ── Main row ── */}
				<div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
					{/* Brand column */}
					<div className="flex w-full shrink-0 flex-col gap-6 lg:w-[280px]">
						{/* Logo */}
						<div className="flex items-center gap-3">
							{/* <div className="w-9 h-9 rounded-xl bg-forest-mid border border-gold/30 flex items-center justify-center text-gold text-base">
                ◎
              </div> */}
							<div className="flex flex-col">
								<span className="font-sans font-semibold text-white text-xl leading-tight">
									TourismOS
								</span>
							</div>
						</div>

						{/* Description */}
						<p className="font-sans text-sm text-white/45 leading-relaxed">
							Organize tourism bookings and customer conversations for Moroccan
							operators.
						</p>

						{/* Social icons */}
						<div className="flex items-center gap-2">
							{[
								<Twitter aria-hidden key="tw" size={16} />,
								<Linkedin aria-hidden key="li" size={16} />,
								<Instagram aria-hidden key="ig" size={16} />,
							].map((icon, i) => (
								<a
									className="footer-iconbtn flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:text-white/70"
									href="#"
									key={i}
								>
									{icon}
								</a>
							))}
						</div>
					</div>

					{/* Nav columns */}
					<div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
						{navCols.map((col) => (
							<div className="flex flex-col gap-4" key={col.label}>
								<span className="font-bold font-sans text-[10px] text-gold uppercase tracking-[0.18em]">
									{col.label}
								</span>
								<div className="flex flex-col gap-3">
									{col.links.map((link) => (
										<a
											className="font-sans text-sm text-white/45 leading-none transition-colors hover:text-white/75"
											href={link.href}
											key={link.href}
										>
											{link.label}
										</a>
									))}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* ── Divider ── */}
				<div className="h-px bg-white/8" />

				{/* ── Bottom bar ── */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<span className="font-sans text-sm text-white/25">
						© 2026 TourismOS. All rights reserved. Morocco.
					</span>
					<div className="flex flex-wrap items-center gap-4 sm:gap-8">
						{[
							"Privacy Policy",
							"Terms of Service",
							"Legal Notices",
							"Cookie Settings",
						].map((link) => (
							<a
								className="font-sans text-sm text-white/25 transition-colors hover:text-white/50"
								href="#"
								key={link}
							>
								{link}
							</a>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
}
