"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  CreditCard,
  Briefcase,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Plus,
  Users,
  Wrench,
} from "lucide-react";
import type { UserDisplay, LayoutProfile } from "~/app/api/profile/schemas/profile.schema";
import { Avatar } from "~/components/avatar";
import { signOut } from "~/lib/auth-client";
import {
  PRODUCER_NAV_ITEMS,
  PAGE_SUBTITLE,
  getPageTitle,
} from "../config";
import { ProducerTopbarSearch } from "./layout/producer-topbar-search";
const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
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
      : user.name.split(/\s+/)[0] ?? user.name;
  const entityLabel = profile?.entityName ?? user.email;

  return (
    <div className="producer-shell">
      <aside
        className="hidden lg:flex flex-col w-[210px] shrink-0 h-screen producer-sidebar"
      >
        <Link href="/" className="px-4 pt-5 pb-4 border-b border-white/8 shrink-0 block hover:opacity-90 transition-opacity">
          <span className="font-sans font-semibold text-white text-[15px] leading-tight block">TourismOS</span>
          <span className="font-sans text-[9px] font-bold tracking-[0.2em] text-white/35 uppercase">Operator Portal</span>
        </Link>

        <div className="px-4 pt-4 pb-2 shrink-0">
          <div className="flex flex-col gap-1 rounded-xl px-3 py-2 producer-mvp-card">
            <div className="flex items-center gap-2">
              <Plus size={14} aria-hidden />
              <span className="font-sans text-sm font-bold tracking-wider uppercase">MVP</span>
            </div>
            <span className="font-sans text-xs opacity-70 leading-none">Inbox + bookings</span>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 px-2 pt-3 flex-1 overflow-y-auto">
          {PRODUCER_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = ICONS[item.href] ?? LayoutDashboard;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 w-full transition-colors producer-nav-link ${
                  isActive ? "producer-nav-link-active" : ""
                }`}
              >
                <span className="shrink-0">
                  <Icon
                    size={16}
                    className={isActive ? "producer-nav-text-active" : "producer-nav-text"}
                    aria-hidden
                  />
                </span>
                <span
                  className={`font-sans text-sm flex-1 leading-none ${
                    isActive ? "producer-nav-text-active" : "producer-nav-text"
                  }`}
                >
                  {item.label}
                </span>
                {item.badge !== null && (
                  <span
                    className={`font-sans text-[10px] font-bold rounded-full px-2 py-0.5 leading-none ${
                      isActive ? "producer-nav-badge-active" : "producer-nav-badge"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/8 shrink-0">
          <Link href="/producer/settings" className="flex items-center gap-3 rounded-xl px-1 py-1 -mx-1 hover:bg-white/5 transition-colors">
            <Avatar
              displayName={displayName}
              imageUrl={profile?.profileImage}
              size="sm"
              className="text-white"
            />
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-sans text-sm font-semibold text-white leading-tight truncate">{shortName}</span>
              <span className="font-sans text-[11px] text-white/40 leading-tight truncate">{entityLabel}</span>
            </div>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header
          className="shrink-0 flex items-center justify-between px-6 lg:px-8 py-3.5 z-10 producer-topbar"
        >
          <div>
            <h1 className="font-serif font-bold text-[18px] leading-tight producer-topbar-title">{title}</h1>
            <p className="font-sans text-sm mt-0.5 producer-topbar-subtitle">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
            <Suspense fallback={null}>
              <ProducerTopbarSearch />
            </Suspense>
            <button
              type="button"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors producer-topbar-iconbtn"
              aria-label="Notifications"
            >
              <Bell size={16} aria-hidden />
            </button>
            <Link
              href="/producer/inbox?new=1"
              className="flex items-center gap-2 font-sans font-semibold text-sm rounded-xl px-5 py-2.5 transition-colors hover:opacity-90 producer-new-booking shrink-0"
            >
              <Plus size={16} aria-hidden />
              New Booking
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="font-sans text-sm producer-topbar-subtitle hover:text-(--text-1) transition-colors"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
