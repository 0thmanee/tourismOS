"use client";

import React from "react";

export function AuthField({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-sans text-[10px] font-bold tracking-[0.14em] text-white/50 uppercase">
        {label}
      </label>
      {children}
      {error && (
        <p className="font-sans text-[11px] text-red-300 mt-0.5">{error}</p>
      )}
    </div>
  );
}
