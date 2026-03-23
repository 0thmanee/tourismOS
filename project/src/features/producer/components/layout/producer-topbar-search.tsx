"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

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
    <form onSubmit={onSubmit} className="hidden md:flex items-center gap-2">
      <label className="relative flex items-center">
        <Search size={14} className="absolute left-3 text-white/50 pointer-events-none" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search bookings…"
          className="h-9 w-[200px] lg:w-[260px] rounded-xl pl-9 pr-3 text-sm bg-white/10 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
      </label>
    </form>
  );
}
