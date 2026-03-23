"use client";

import Link from "next/link";
import React from "react";

type CertificationCardProps = {
	partnerId: string;
	partnerSince: string;
};

export function ProfileSideCards({
	partnerId,
	partnerSince,
}: CertificationCardProps) {
	// MVP: keep profile sidebar lightweight.
	return (
		<div className="flex flex-col gap-4">
			<div className="overflow-hidden rounded-xl bg-forest-dark">
				<div className="border-white/8 border-b px-5 py-4">
					<h3 className="font-bold font-serif text-[15px] text-white">
						Your partner status
					</h3>
					<p className="mt-0.5 font-sans text-[11px] text-white/40">
						Bookings inbox is ready (MVP)
					</p>
				</div>
				<div className="flex flex-col gap-3 p-5">
					<div className="flex items-center justify-between gap-3">
						<span className="font-sans text-[11px] text-white/40">
							Partner ID
						</span>
						<span className="font-sans font-semibold text-[11px] text-white/80">
							{partnerId}
						</span>
					</div>
					<div className="flex items-center justify-between gap-3">
						<span className="font-sans text-[11px] text-white/40">
							Partner since
						</span>
						<span className="font-sans font-semibold text-[11px] text-white/80">
							{partnerSince}
						</span>
					</div>

					<Link
						className="block w-full rounded-xl border border-zellige-teal/20 bg-zellige-teal/15 py-2 text-center font-sans font-semibold text-[12px] text-zellige-teal transition-colors hover:bg-zellige-teal/20"
						href="/producer/inbox"
					>
						Go to Inbox
					</Link>
				</div>
			</div>
		</div>
	);
}
