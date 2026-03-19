"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
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
    <div className="rounded-xl overflow-hidden card">
      <div className="h-20 card-header-gradient" />
      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-7">
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
              className="font-sans text-[11px] font-medium text-(--text-2) hover:text-(--text-1) transition-colors disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Change photo"}
            </button>
            {displayError && (
              <p className="font-sans text-xs text-red-500 max-w-[200px]" role="alert">
                {displayError}
              </p>
            )}
          </div>
          <Link
            href="/producer/profile/edit"
            className="font-sans text-sm font-medium rounded-xl px-4 py-2 transition-colors inline-block btn btn-ghost border-accent"
          >
            Edit Profile
          </Link>
        </div>
        <div className="mt-3 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-[20px] text-(--text-1) leading-tight">{displayName}</h2>
            <span className="badge badge-confirmed">
              Operator
            </span>
          </div>
          <p className="font-sans text-sm text-(--text-2)">{entityType} · {entityName}</p>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            <span className="font-sans text-[12px] text-(--text-2) flex items-center gap-1.5">
              <MapPin size={14} aria-hidden />
              {region} Region, Morocco
            </span>
            <span className="font-sans text-[12px] text-(--text-2) flex items-center gap-1.5">
              <CalendarDays size={14} aria-hidden />
              Member since {memberSince}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
