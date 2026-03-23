"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { signOut, useSession } from "~/lib/auth-client";

export default function Navbar() {
	const { data: session, isPending } = useSession();
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<nav className="fixed top-0 right-0 left-0 z-50 border-cream-dark border-b bg-cream/95 backdrop-blur-sm">
			<div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-4">
				<Link className="flex shrink-0 items-center" href="/">
					<Image
						alt="TourismOS logo"
						className="h-10 w-auto rounded-full object-contain"
						height={40}
						src="/assets/logo.png"
						width={120}
					/>
				</Link>

				<div className="hidden items-center gap-8 md:flex">
					{[
						{ label: "How it works", href: "#how-it-works" },
						{ label: "Inbox", href: "#inbox" },
						{ label: "Bookings", href: "#bookings" },
						{ label: "Payments", href: "#payments" },
						{ label: "FAQ", href: "#faq" },
					].map((item) => (
						<a
							className="font-sans text-sm text-text-muted transition-colors hover:text-text-dark"
							href={item.href}
							key={item.href}
						>
							{item.label}
						</a>
					))}
				</div>

				<div className="flex items-center gap-2 md:gap-3">
					{isPending ? (
						<span className="font-sans text-sm text-text-muted">…</span>
					) : session?.user ? (
						<div className="relative flex items-center gap-2">
							<Link
								className="hidden rounded-full border border-text-dark/30 px-5 py-2 font-medium font-sans text-sm text-text-dark transition-colors hover:bg-text-dark/5 sm:inline-block"
								href="/producer"
							>
								Dashboard
							</Link>
							<button
								className="flex items-center gap-2 rounded-full border border-text-dark/30 px-4 py-2 font-medium font-sans text-sm text-text-dark transition-colors hover:bg-text-dark/5"
								onClick={() => setMenuOpen((o) => !o)}
								type="button"
							>
								<span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-mid font-bold text-white text-xs">
									{(session.user.name ?? session.user.email ?? "?")
										.slice(0, 1)
										.toUpperCase()}
								</span>
								<span className="hidden max-w-[100px] truncate sm:inline">
									{session.user.name ?? session.user.email}
								</span>
								<ChevronDown
									aria-hidden
									className={menuOpen ? "rotate-180" : ""}
									size={14}
								/>
							</button>
							{menuOpen && (
								<>
									<div
										aria-hidden
										className="fixed inset-0 z-40"
										onClick={() => setMenuOpen(false)}
									/>
									<div
										className="absolute top-full right-0 z-50 mt-2 w-48 rounded-xl border border-cream-dark bg-white py-2 shadow-lg"
										role="menu"
									>
										<div className="border-cream-dark border-b px-4 py-2">
											<p className="truncate font-sans font-semibold text-sm text-text-dark">
												{session.user.name ?? "Account"}
											</p>
											<p className="truncate font-sans text-text-muted text-xs">
												{session.user.email}
											</p>
										</div>
										<Link
											className="block px-4 py-2 font-sans text-sm text-text-dark transition-colors hover:bg-cream"
											href="/producer"
											onClick={() => setMenuOpen(false)}
										>
											Dashboard
										</Link>
										<button
											className="w-full px-4 py-2 text-left font-sans text-sm text-text-dark transition-colors hover:bg-cream"
											onClick={() => {
												signOut();
												setMenuOpen(false);
											}}
											type="button"
										>
											Sign out
										</button>
									</div>
								</>
							)}
						</div>
					) : (
						<>
							<Link
								className="rounded-full border border-text-dark/30 px-5 py-2 font-medium font-sans text-sm text-text-dark transition-colors hover:bg-text-dark/5"
								href="/auth/login"
							>
								Sign In
							</Link>
							<Link
								className="rounded-full bg-forest-mid px-5 py-[9px] font-medium font-sans text-sm text-white transition-colors hover:bg-forest-dark"
								href="/auth/register"
							>
								Join Platform
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}
