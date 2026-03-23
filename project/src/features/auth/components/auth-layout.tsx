"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import type React from "react";

export const inputCls =
	"font-sans text-sm rounded-xl px-4 py-2.5 w-full transition-colors placeholder:text-white/25 auth-input";

export function AuthLayout({
	children,
	title,
	subtitle,
	showRegisterLink = false,
	showLoginLink = false,
	contentClassName = "max-w-md",
	contentCenter = true,
}: {
	children: React.ReactNode;
	title: string;
	subtitle: React.ReactNode;
	showRegisterLink?: boolean;
	showLoginLink?: boolean;
	contentClassName?: string;
	contentCenter?: boolean;
}) {
	return (
		<div className="auth-shell">
			<div aria-hidden className="auth-pattern bg-moroccan-pattern" />

			{/* Left panel */}
			<div className="auth-panel relative z-10 hidden w-[420px] shrink-0 flex-col justify-between border-r px-10 py-12 lg:flex">
				<div>
					<Link className="mb-14 flex flex-col gap-0.5" href="/">
						<span className="font-sans font-semibold text-[18px] text-white leading-tight">
							TourismOS
						</span>
						<span className="font-bold font-sans text-[9px] text-white/35 uppercase tracking-[0.2em]">
							Operator Portal
						</span>
					</Link>
					<div className="mb-10 flex flex-col gap-3">
						<div className="flex items-center gap-2">
							<div className="h-px w-8 bg-gold/40" />
							<span className="font-sans font-semibold text-[10px] text-gold uppercase tracking-[0.18em]">
								{title}
							</span>
						</div>
						<h2 className="font-bold font-serif text-[36px] text-white leading-tight">
							{subtitle}
						</h2>
						<p className="max-w-[300px] font-sans text-sm text-white/55 leading-relaxed">
							A structured operator inbox for Moroccan tourism bookings.
						</p>
					</div>
				</div>
				<div className="auth-card rounded-2xl p-5">
					<div className="mb-3 flex gap-0.5">
						{[...Array(5)].map((_, i) => (
							<Star aria-hidden className="text-gold" key={i} size={14} />
						))}
					</div>
					<p className="font-serif text-[14px] text-white/80 italic leading-relaxed">
						&ldquo;We stopped losing messages and double booking by keeping
						everything in one inbox.&rdquo;
					</p>
				</div>
			</div>

			{/* Right panel */}
			<div className="relative z-10 flex flex-1 flex-col overflow-y-auto">
				<div className="flex shrink-0 items-center justify-between px-6 py-6 lg:px-10">
					<Link
						className="font-sans font-semibold text-[16px] text-white lg:hidden"
						href="/"
					>
						TourismOS
					</Link>
					<div className="hidden lg:block" />
					<span className="font-sans text-sm text-white/40">
						{showRegisterLink && (
							<>
								New here?{" "}
								<Link
									className="font-semibold text-gold transition-colors hover:text-gold/80"
									href="/auth/register"
								>
									Join Platform
								</Link>
							</>
						)}
						{showLoginLink && (
							<>
								Already a partner?{" "}
								<Link
									className="font-semibold text-gold transition-colors hover:text-gold/80"
									href="/auth/login"
								>
									Sign in
								</Link>
							</>
						)}
					</span>
				</div>
				<div
					className={`flex flex-1 flex-col px-6 pb-10 lg:px-10 ${contentCenter ? "items-center justify-center" : "items-center"}`}
				>
					<div className={`w-full ${contentClassName}`}>{children}</div>
				</div>
			</div>
		</div>
	);
}
