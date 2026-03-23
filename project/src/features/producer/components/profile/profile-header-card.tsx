"use client";

import { CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useRef, useState } from "react";
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
				setError(
					err instanceof Error
						? err.message
						: "Something went wrong. Please try again.",
				);
			},
		});
	};

	const openFilePicker = () => {
		setError(null);
		fileInputRef.current?.click();
	};

	const uploading = uploadMutation.isPending;
	const displayError =
		error ??
		(uploadMutation.isError && uploadMutation.error instanceof Error
			? uploadMutation.error.message
			: null);

	return (
		<div className="card overflow-hidden rounded-xl">
			<div className="card-header-gradient h-20" />
			<div className="px-6 pb-6">
				<div className="-mt-7 flex items-end justify-between">
					<div className="flex flex-col items-start gap-1">
						<Avatar
							displayName={displayName}
							imageUrl={profileImage}
							size="lg"
							variant="header"
						/>
						<input
							accept="image/jpeg,image/png,image/webp"
							className="hidden"
							disabled={uploading}
							onChange={handlePhotoChange}
							ref={fileInputRef}
							type="file"
						/>
						<button
							className="font-medium font-sans text-(--text-2) text-[11px] transition-colors hover:text-(--text-1) disabled:opacity-50"
							disabled={uploading}
							onClick={openFilePicker}
							type="button"
						>
							{uploading ? "Uploading…" : "Change photo"}
						</button>
						{displayError && (
							<p
								className="max-w-[200px] font-sans text-red-500 text-xs"
								role="alert"
							>
								{displayError}
							</p>
						)}
					</div>
					<Link
						className="btn btn-ghost inline-block rounded-xl border-accent px-4 py-2 font-medium font-sans text-sm transition-colors"
						href="/producer/profile/edit"
					>
						Edit Profile
					</Link>
				</div>
				<div className="mt-3 flex flex-col gap-1">
					<div className="flex items-center gap-2">
						<h2 className="font-bold font-serif text-(--text-1) text-[20px] leading-tight">
							{displayName}
						</h2>
						<span className="badge badge-confirmed">Operator</span>
					</div>
					<p className="font-sans text-(--text-2) text-sm">
						{entityType} · {entityName}
					</p>
					<div className="mt-1 flex flex-wrap items-center gap-4">
						<span className="flex items-center gap-1.5 font-sans text-(--text-2) text-[12px]">
							<MapPin aria-hidden size={14} />
							{region} Region, Morocco
						</span>
						<span className="flex items-center gap-1.5 font-sans text-(--text-2) text-[12px]">
							<CalendarDays aria-hidden size={14} />
							Member since {memberSince}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
