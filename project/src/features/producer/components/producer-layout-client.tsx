"use client";

import {
	Bell,
	Briefcase,
	CalendarDays,
	CreditCard,
	Inbox,
	LayoutDashboard,
	ListChecks,
	Plus,
	Users,
	Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { Suspense } from "react";
import type {
	LayoutProfile,
	UserDisplay,
} from "~/app/api/profile/schemas/profile.schema";
import { Avatar } from "~/components/avatar";
import { signOut } from "~/lib/auth-client";
import { getPageTitle, PAGE_SUBTITLE, PRODUCER_NAV_ITEMS } from "../config";
import { ProducerTopbarSearch } from "./layout/producer-topbar-search";

const ICONS: Record<
	string,
	React.ComponentType<{ size?: number; className?: string }>
> = {
	"/producer": LayoutDashboard,
	"/producer/inbox": Inbox,
	"/producer/calendar": CalendarDays,
	"/producer/bookings": ListChecks,
	"/producer/staff": Briefcase,
	"/producer/customers": Users,
	"/producer/payments": CreditCard,
	"/producer/settings": Wrench,
};

/** @deprecated Use UserDisplay from profile schema. */
export type ProducerLayoutUser = UserDisplay;
/** @deprecated Use LayoutProfile from profile schema. */
export type ProducerLayoutProfile = LayoutProfile;

type Props = {
	user: UserDisplay;
	profile: LayoutProfile;
	children: React.ReactNode;
};

export function ProducerLayoutClient({ user, profile, children }: Props) {
	const pathname = usePathname();
	const subtitle = PAGE_SUBTITLE[pathname] ?? PAGE_SUBTITLE["/producer"];
	const firstName = profile?.firstName ?? user.name.split(/\s+/)[0] ?? null;
	const title = getPageTitle(pathname, firstName);

	const displayName = profile
		? `${profile.firstName} ${profile.lastName}`.trim() || user.name
		: user.name;
	const shortName =
		profile?.firstName && profile?.lastName
			? `${profile.firstName[0]}${profile.lastName[0]}.`
			: (user.name.split(/\s+/)[0] ?? user.name);
	const entityLabel = profile?.entityName ?? user.email;

	return (
		<div className="producer-shell">
			<aside className="producer-sidebar hidden h-screen w-[210px] shrink-0 flex-col lg:flex">
				<Link
					className="block shrink-0 border-white/8 border-b px-4 pt-5 pb-4 transition-opacity hover:opacity-90"
					href="/"
				>
					<span className="block font-sans font-semibold text-[15px] text-white leading-tight">
						TourismOS
					</span>
					<span className="font-bold font-sans text-[9px] text-white/35 uppercase tracking-[0.2em]">
						Operator Portal
					</span>
				</Link>

				<div className="shrink-0 px-4 pt-4 pb-2">
					<div className="producer-mvp-card flex flex-col gap-1 rounded-xl px-3 py-2">
						<div className="flex items-center gap-2">
							<Plus aria-hidden size={14} />
							<span className="font-bold font-sans text-sm uppercase tracking-wider">
								MVP
							</span>
						</div>
						<span className="font-sans text-xs leading-none opacity-70">
							Inbox + bookings
						</span>
					</div>
				</div>

				<nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pt-3">
					{PRODUCER_NAV_ITEMS.map((item) => {
						const isActive = pathname === item.href;
						const Icon = ICONS[item.href] ?? LayoutDashboard;
						return (
							<Link
								className={`producer-nav-link flex w-full items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
									isActive ? "producer-nav-link-active" : ""
								}`}
								href={item.href}
								key={item.href}
							>
								<span className="shrink-0">
									<Icon
										aria-hidden
										className={
											isActive
												? "producer-nav-text-active"
												: "producer-nav-text"
										}
										size={16}
									/>
								</span>
								<span
									className={`flex-1 font-sans text-sm leading-none ${
										isActive ? "producer-nav-text-active" : "producer-nav-text"
									}`}
								>
									{item.label}
								</span>
								{item.badge !== null && (
									<span
										className={`rounded-full px-2 py-0.5 font-bold font-sans text-[10px] leading-none ${
											isActive
												? "producer-nav-badge-active"
												: "producer-nav-badge"
										}`}
									>
										{item.badge}
									</span>
								)}
							</Link>
						);
					})}
				</nav>

				<div className="shrink-0 border-white/8 border-t px-4 py-4">
					<Link
						className="-mx-1 flex items-center gap-3 rounded-xl px-1 py-1 transition-colors hover:bg-white/5"
						href="/producer/settings"
					>
						<Avatar
							className="text-white"
							displayName={displayName}
							imageUrl={profile?.profileImage}
							size="sm"
						/>
						<div className="flex min-w-0 flex-col gap-0.5">
							<span className="truncate font-sans font-semibold text-sm text-white leading-tight">
								{shortName}
							</span>
							<span className="truncate font-sans text-[11px] text-white/40 leading-tight">
								{entityLabel}
							</span>
						</div>
					</Link>
				</div>
			</aside>

			<div className="flex h-screen min-w-0 flex-1 flex-col">
				<header className="producer-topbar z-10 flex shrink-0 items-center justify-between px-6 py-3.5 lg:px-8">
					<div>
						<h1 className="producer-topbar-title font-bold font-serif text-[18px] leading-tight">
							{title}
						</h1>
						<p className="producer-topbar-subtitle mt-0.5 font-sans text-sm">
							{subtitle}
						</p>
					</div>
					<div className="flex min-w-0 flex-1 items-center justify-end gap-3">
						<Suspense fallback={null}>
							<ProducerTopbarSearch />
						</Suspense>
						<button
							aria-label="Notifications"
							className="producer-topbar-iconbtn flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
							type="button"
						>
							<Bell aria-hidden size={16} />
						</button>
						<Link
							className="producer-new-booking flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 font-sans font-semibold text-sm transition-colors hover:opacity-90"
							href="/producer/inbox?new=1"
						>
							<Plus aria-hidden size={16} />
							New Booking
						</Link>
						<button
							className="producer-topbar-subtitle font-sans text-sm transition-colors hover:text-(--text-1)"
							onClick={() => signOut()}
							type="button"
						>
							Log out
						</button>
					</div>
				</header>

				<main className="flex-1 overflow-y-auto">{children}</main>
			</div>
		</div>
	);
}
