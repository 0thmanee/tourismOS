"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

export function ProducerTopbarSearch() {
	const router = useRouter();
	const [q, setQ] = useState("");

	function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = q.trim();
		if (!trimmed) {
			router.push("/producer/bookings");
			return;
		}
		router.push(`/producer/bookings?search=${encodeURIComponent(trimmed)}`);
	}

	return (
		<form className="hidden items-center gap-2 md:flex" onSubmit={onSubmit}>
			<label className="relative flex items-center">
				<Search
					aria-hidden
					className="pointer-events-none absolute left-3 text-white/50"
					size={14}
				/>
				<input
					className="h-9 w-[200px] rounded-xl border border-white/15 bg-white/10 pr-3 pl-9 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 lg:w-[260px]"
					onChange={(e) => setQ(e.target.value)}
					placeholder="Search bookings…"
					value={q}
				/>
			</label>
		</form>
	);
}
