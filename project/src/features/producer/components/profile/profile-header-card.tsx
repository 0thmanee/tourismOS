"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "~/components/avatar";
import { useUploadProfileImage } from "~/features/media";

type Props = {
  displayName: string;
  entityName: string;
  entityType: string;
  region: string;
  memberSince: string;
  profileImage?: string | null;
};

export function ProfileHeaderCard({
  displayName,
  entityName,
  entityType,
  region,
  memberSince,
  profileImage,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const uploadMutation = useUploadProfileImage();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    uploadMutation.mutate(file, {
      onSuccess: () => {
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      },
    });
  };

  const openFilePicker = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const uploading = uploadMutation.isPending;
  const displayError = error ?? (uploadMutation.isError && uploadMutation.error instanceof Error ? uploadMutation.error.message : null);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid #E8EDE9" }}>
      <div
        className="h-20"
        style={{
          background: "linear-gradient(in oklab 90deg, oklab(25% -0.041 0.019) 0%, oklab(36% -0.059 0.022) 50%, oklab(47.6% -0.074 0.024) 100%)",
        }}
      />
      <div className="px-6 pb-6">
        <div className="flex items-end justify-between" style={{ marginTop: -28 }}>
          <div className="flex flex-col items-start gap-1">
            <Avatar
              displayName={displayName}
              imageUrl={profileImage}
              size="lg"
              variant="header"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
              disabled={uploading}
            />
            <button
              type="button"
              onClick={openFilePicker}
              disabled={uploading}
              className="font-sans text-[11px] font-medium text-[#4a6358] hover:text-[#1c3a28] transition-colors disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Change photo"}
            </button>
            {displayError && (
              <p className="font-sans text-xs text-red-600 max-w-[200px]" role="alert">
                {displayError}
              </p>
            )}
          </div>
          <Link
            href="/producer/profile/edit"
            className="font-sans text-sm font-medium rounded-xl px-4 py-2 transition-colors inline-block"
            style={{ background: "#F5F0E8", color: "#1c3a28", border: "1px solid #E8EDE9" }}
          >
            Edit Profile
          </Link>
        </div>
        <div className="mt-3 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-[20px] text-[#1c3a28] leading-tight">{displayName}</h2>
            <span
              className="font-sans text-[9px] font-bold tracking-wider rounded-full px-2.5 py-1 uppercase"
              style={{ background: "rgba(26,71,49,0.8)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.25)" }}
            >
              Operator
            </span>
          </div>
          <p className="font-sans text-sm text-[#4a6358]">{entityType} · {entityName}</p>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            <span className="font-sans text-[12px] text-[#4a6358] flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1C4.1 1 2.5 2.6 2.5 4.5c0 2.8 3.5 6.5 3.5 6.5s3.5-3.7 3.5-6.5C9.5 2.6 7.9 1 6 1z" stroke="#4a6358" strokeWidth="1.1" />
                <circle cx="6" cy="4.5" r="1.2" stroke="#4a6358" strokeWidth="1.1" />
              </svg>
              {region} Region, Morocco
            </span>
            <span className="font-sans text-[12px] text-[#4a6358] flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="#4a6358" strokeWidth="1.1" />
                <path d="M1 4.5h10" stroke="#4a6358" strokeWidth="1.1" />
                <path d="M4 1v2M8 1v2" stroke="#4a6358" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
              Member since {memberSince}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
