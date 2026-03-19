"use client";

import React from "react";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}

type Props = {
  displayName: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** For header card style (light gradient, white border). */
  variant?: "default" | "header";
};

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
} as const;

export function Avatar({
  displayName,
  imageUrl,
  size = "sm",
  className = "",
  variant = "default",
}: Props) {
  const sizeClass = sizeClasses[size];
  const initials = getInitials(displayName);
  const isHeader = variant === "header";
  const borderClass = isHeader ? "border-2 border-white" : "";

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={displayName}
        className={`rounded-full object-cover shrink-0 ${sizeClass} ${borderClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-sans font-bold text-white shrink-0 avatar-fallback ${sizeClass} ${borderClass} ${className}`}
    >
      {initials}
    </div>
  );
}
