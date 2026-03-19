"use client";

import React from "react";
import Link from "next/link";

type CertificationCardProps = {
  partnerId: string;
  partnerSince: string;
};

export function ProfileSideCards({ partnerId, partnerSince }: CertificationCardProps) {
  // MVP: keep profile sidebar lightweight.
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl overflow-hidden" style={{ background: "#0D2818" }}>
        <div className="px-5 py-4 border-b border-white/8">
          <h3 className="font-serif font-bold text-[15px] text-white">Your partner status</h3>
          <p className="font-sans text-[11px] text-white/40 mt-0.5">Bookings inbox is ready (MVP)</p>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-sans text-[11px] text-white/40">Partner ID</span>
            <span className="font-sans text-[11px] font-semibold text-white/80">{partnerId}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-sans text-[11px] text-white/40">Partner since</span>
            <span className="font-sans text-[11px] font-semibold text-white/80">{partnerSince}</span>
          </div>

          <Link
            href="/producer/inbox"
            className="w-full font-sans text-[12px] font-semibold rounded-xl py-2 transition-colors text-center block"
            style={{ background: "rgba(74,222,128,0.12)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.2)" }}
          >
            Go to Inbox
          </Link>
        </div>
      </div>
    </div>
  );
}

