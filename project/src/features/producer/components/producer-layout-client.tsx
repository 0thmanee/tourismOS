"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "~/components/avatar";
import { signOut } from "~/lib/auth-client";
import {
  PRODUCER_NAV_ITEMS,
  PAGE_SUBTITLE,
  getPageTitle,
} from "../config";

function IconDashboard({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" fill={active ? "#C9913D" : "none"} stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.5" fill={active ? "#C9913D" : "none"} stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.5" fill={active ? "#C9913D" : "none"} stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1.5" fill={active ? "#C9913D" : "none"} stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" />
    </svg>
  );
}

function IconInbox({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="10" rx="2" stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" />
      <path d="M2.5 5.5l5.2 3.8c.2.1.4.1.6 0l5.2-3.8" stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCalendar({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="4" width="11" height="10" rx="2" stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" />
      <path d="M5 2.5v3" stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M11 2.5v3" stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M2.5 7h11" stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconList({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="3" width="10" height="10" rx="2" stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" />
      <line x1="5" y1="6" x2="11" y2="6" stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="5" y1="9" x2="9" y2="9" stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconCustomers({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="6" r="2.2" stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" />
      <circle cx="11" cy="7.5" r="1.6" stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" />
      <path d="M3.5 13c.6-2.2 2.2-3.2 4.1-3.2S11.1 10.8 11.7 13" stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconPayments({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="3" width="10" height="10" rx="2" stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" />
      <path d="M5.2 7h5.6" stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M7 9h2.3" stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconSettings({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 10.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z"
        stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"}
        strokeWidth="1.3"
      />
      <path
        d="M13 8l1-0.3-1-2-1 0.2c-.3-.3-.5-.5-.8-.7l.2-1-2-1-0.3 1c-.4 0-.7 0-1.1 0L7.9 2.2l-2 1 0.2 1c-.3.2-.5.4-.8.7l-1-0.2-1 2 1 .3c0 .4 0 .7 0 1.1l-1 .3 1 2 1-.2c.3.3.5.5.8.7l-.2 1 2 1 0.3-1c.4 0 .7 0 1.1 0l.3 1 2-1-.2-1c.3-.2.5-.4.8-.7l1 .2 1-2-1-.3c0-.4 0-.7 0-1.1Z"
        stroke={active ? "#C9913D" : "rgba(250,250,247,0.4)"} strokeWidth="1.1" strokeLinejoin="round"
      />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <line x1="3" y1="4" x2="13" y2="4" stroke="rgba(250,250,247,0.4)" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="3" y1="8" x2="13" y2="8" stroke="rgba(250,250,247,0.4)" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="3" y1="12" x2="10" y2="12" stroke="rgba(250,250,247,0.4)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconProducts() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="rgba(250,250,247,0.4)" strokeWidth="1.3" />
      <line x1="5" y1="6" x2="11" y2="6" stroke="rgba(250,250,247,0.4)" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="5" y1="9" x2="9" y2="9" stroke="rgba(250,250,247,0.4)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconCertification() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 10.3l-3.7 2.7 1.4-4.3L2 6h4.5L8 1.5z" stroke="rgba(250,250,247,0.4)" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function IconTraining() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <line x1="3" y1="5" x2="9" y2="5" stroke="rgba(250,250,247,0.4)" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="3" y1="8" x2="9" y2="8" stroke="rgba(250,250,247,0.4)" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="3" y1="11" x2="7" y2="11" stroke="rgba(250,250,247,0.4)" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M11 7l2 2-2 2" stroke="rgba(250,250,247,0.4)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSupport() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="rgba(250,250,247,0.4)" strokeWidth="1.3" />
      <path d="M6 6a2 2 0 0 1 4 0c0 1.5-2 1.5-2 3" stroke="rgba(250,250,247,0.4)" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="12" r="0.6" fill="rgba(250,250,247,0.4)" />
    </svg>
  );
}

function IconContracts() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L3 5v4c0 2.8 2 5.1 5 5.9 3-0.8 5-3.1 5-5.9V5L8 2z" stroke="rgba(250,250,247,0.4)" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS: Record<string, (active: boolean) => React.ReactNode> = {
  "/producer": (active) => <IconDashboard active={active} />,
  "/producer/inbox": (active) => <IconInbox active={active} />,
  "/producer/calendar": (active) => <IconCalendar active={active} />,
  "/producer/bookings": (active) => <IconList active={active} />,
  "/producer/customers": (active) => <IconCustomers active={active} />,
  "/producer/payments": (active) => <IconPayments active={active} />,
  "/producer/settings": (active) => <IconSettings active={active} />,
};

import type { UserDisplay, LayoutProfile } from "~/app/api/profile/schemas/profile.schema";

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
    <div className="h-screen flex overflow-hidden" style={{ background: "#F5F0E8" }}>
      <aside
        className="hidden lg:flex flex-col w-[210px] shrink-0 h-screen"
        style={{
          background: "linear-gradient(in oklab 180deg, oklab(25% -0.041 0.019) 0%, oklab(36% -0.059 0.022) 100%)",
        }}
      >
        <Link href="/" className="px-4 pt-5 pb-4 border-b border-white/8 shrink-0 block hover:opacity-90 transition-opacity">
          <span className="font-sans font-semibold text-white text-[15px] leading-tight block">TourismOS</span>
          <span className="font-sans text-[9px] font-bold tracking-[0.2em] text-white/35 uppercase">Operator Portal</span>
        </Link>

        <div className="px-4 pt-4 pb-2 shrink-0">
          <div className="flex flex-col gap-1 rounded-xl px-3 py-2" style={{ background: "#0D28181A", border: "1px solid rgba(13,40,24,0.2)" }}>
            <div className="flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="2" width="10" height="10" rx="3" stroke="#0D2818" strokeWidth="1.2" />
                <path d="M4.5 7h5" stroke="#0D2818" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span className="font-sans text-sm font-bold tracking-wider text-[#0D2818] uppercase">MVP</span>
            </div>
            <span className="font-sans text-xs text-[#1c3a28]/60 leading-none">Inbox + bookings</span>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 px-2 pt-3 flex-1 overflow-y-auto">
          {PRODUCER_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = ICONS[item.href] ?? (() => <IconDashboard active={false} />);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2 w-full transition-colors"
                style={{
                  background: isActive ? "#C9913D26" : "transparent",
                  border: isActive ? "1px solid #C9913D40" : "1px solid transparent",
                }}
              >
                <span className="shrink-0">{Icon(isActive)}</span>
                <span
                  className="font-sans text-sm flex-1 leading-none"
                  style={{ color: isActive ? "#E8B84B" : "rgba(250,250,247,0.6)", fontWeight: isActive ? 600 : 400 }}
                >
                  {item.label}
                </span>
                {item.badge !== null && (
                  <span
                    className="font-sans text-[10px] font-bold rounded-full px-2 py-0.5 leading-none"
                    style={{
                      background: isActive ? "rgba(201,145,61,0.3)" : "rgba(250,250,247,0.1)",
                      color: isActive ? "#E8B84B" : "rgba(250,250,247,0.5)",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/8 shrink-0">
          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header
          className="shrink-0 flex items-center justify-between px-6 lg:px-8 py-3.5 border-b z-10"
          style={{ background: "white", borderColor: "#E8EDE9" }}
        >
          <div>
            <h1 className="font-serif font-bold text-[18px] text-[#1c3a28] leading-tight">{title}</h1>
            <p className="font-sans text-sm text-[#4a6358] mt-0.5">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: "#F5F0E8", border: "1px solid #E8EDE9" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2a4 4 0 0 0-4 4v3l-1 1v1h10v-1l-1-1V6a4 4 0 0 0-4-4z" stroke="#4a6358" strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M6.5 13a1.5 1.5 0 0 0 3 0" stroke="#4a6358" strokeWidth="1.3" />
                <circle cx="11" cy="4" r="2.5" fill="#f87171" />
              </svg>
            </button>
            <Link
              href="/producer/inbox?new=1"
              className="flex items-center gap-2 font-sans font-semibold text-sm text-white rounded-xl px-5 py-2.5 transition-colors hover:opacity-90"
              style={{ background: "#0D2818" }}
            >
              <span className="text-lg leading-none" style={{ marginTop: -1 }}>+</span>
              New Booking
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="font-sans text-sm text-[#4a6358] hover:text-[#1c3a28] transition-colors"
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
