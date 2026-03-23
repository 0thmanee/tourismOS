"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useRef, useState } from "react";
import type {
	ProfileEditProfile,
	ProfileViewUser,
} from "~/app/api/profile/schemas/profile.schema";
import { Avatar } from "~/components/avatar";
import { useUploadProfileImage } from "~/features/media";
import {
	ENTITY_TYPES,
	EXPORT_EXPERIENCE_OPTIONS,
	MOROCCAN_REGIONS,
	type OnboardingFormData,
	PRODUCT_CATEGORIES,
	upsertProfile,
} from "~/features/profile";
import {
	cardClassName,
	cardHeaderClassName,
	inputClassName,
	labelClassName,
} from "./profile-edit-styles";
import { ProfileHeaderCard } from "./profile-header-card";
import { ProfileSideCards } from "./profile-side-cards";

type Props = {
	user: ProfileViewUser;
	profile: ProfileEditProfile;
	memberSince: string;
	partnerId: string;
};

export function ProfileEditView({
	user,
	profile,
	memberSince,
	partnerId,
}: Props) {
	const router = useRouter();
	const [form, setForm] = useState<OnboardingFormData>({
		firstName: profile.firstName,
		lastName: profile.lastName,
		phone: profile.phone,
		entityType: profile.entityType,
		entityName: profile.entityName,
		registrationNumber: profile.registrationNumber ?? "",
		region: profile.region,
		city: profile.city,
		yearEstablished: profile.yearEstablished ?? "",
		website: profile.website ?? "",
		categories: profile.categories.length > 0 ? profile.categories : [],
		annualCapacity: profile.annualCapacity ?? "",
		exportExperience: profile.exportExperience ?? "",
		agreeTerms: profile.agreeTerms,
		agreeMarketing: profile.agreeMarketing,
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const photoInputRef = useRef<HTMLInputElement>(null);
	const [photoError, setPhotoError] = useState<string | null>(null);
	const uploadProfileImageMutation = useUploadProfileImage();

	const set =
		(key: keyof OnboardingFormData) => (value: string | boolean | string[]) =>
			setForm((prev) => ({ ...prev, [key]: value }));

	const toggleCategory = (cat: string) => {
		setForm((f) =>
			f.categories.includes(cat)
				? { ...f, categories: f.categories.filter((c) => c !== cat) }
				: { ...f, categories: [...f.categories, cat] },
		);
	};

	const displayName = `${form.firstName} ${form.lastName}`.trim() || user.name;

	function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setPhotoError(null);
		uploadProfileImageMutation.mutate(file, {
			onSuccess: () => {
				if (photoInputRef.current) photoInputRef.current.value = "";
			},
			onError: (err) => {
				setPhotoError(
					err instanceof Error
						? err.message
						: "Something went wrong. Please try again.",
				);
			},
		});
	}

	const openPhotoPicker = () => {
		setPhotoError(null);
		photoInputRef.current?.click();
	};

	const photoUploading = uploadProfileImageMutation.isPending;
	const photoDisplayError =
		photoError ??
		(uploadProfileImageMutation.isError &&
		uploadProfileImageMutation.error instanceof Error
			? uploadProfileImageMutation.error.message
			: null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (submitting) return;
		if (
			!form.firstName ||
			!form.lastName ||
			!form.phone ||
			!form.entityType ||
			!form.entityName ||
			!form.region ||
			!form.city
		) {
			setError("Please fill required fields.");
			return;
		}
		if (form.categories.length === 0) {
			setError("Select at least one product category.");
			return;
		}
		if (!form.agreeTerms) {
			setError("You must agree to the terms.");
			return;
		}
		setError(null);
		setSubmitting(true);
		try {
			await upsertProfile(form);
			router.push("/producer/profile");
			router.refresh();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Something went wrong. Try again.",
			);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="flex flex-col gap-4 p-4 lg:p-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<Link
					className="font-sans text-(--text-2) text-sm transition-colors hover:text-(--text-1)"
					href="/producer/profile"
				>
					← Back to profile
				</Link>
			</div>

			<ProfileHeaderCard
				displayName={displayName}
				entityName={form.entityName}
				entityType={form.entityType}
				memberSince={memberSince}
				profileImage={profile.profileImage}
				region={form.region}
			/>

			<form className="contents" onSubmit={handleSubmit}>
				<div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_300px]">
					<div className="flex flex-col gap-4">
						{/* Personal Information */}
						<div className={cardClassName}>
							<div className={cardHeaderClassName}>
								<h3 className="font-bold font-serif text-(--text-1) text-[15px]">
									Personal Information
								</h3>
								<p className="mt-0.5 font-sans text-(--text-2) text-[11px]">
									Your account and contact details
								</p>
							</div>
							<div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
								<div className="flex flex-wrap items-end gap-4 sm:col-span-2">
									<div className="flex flex-col gap-1.5">
										<span className={labelClassName}>Profile picture</span>
										<div className="flex items-center gap-4">
											<Avatar
												displayName={displayName}
												imageUrl={profile.profileImage}
												size="lg"
												variant="header"
											/>
											<div className="flex flex-col gap-1">
												<input
													accept="image/jpeg,image/png,image/webp"
													className="hidden"
													disabled={photoUploading}
													onChange={handlePhotoChange}
													ref={photoInputRef}
													type="file"
												/>
												<button
													className="btn btn-ghost w-fit rounded-xl border-accent px-4 py-2 font-medium font-sans text-sm transition-colors disabled:opacity-50"
													disabled={photoUploading}
													onClick={openPhotoPicker}
													type="button"
												>
													{photoUploading ? "Uploading…" : "Change photo"}
												</button>
												{photoDisplayError && (
													<p
														className="max-w-xs font-sans text-red-600 text-xs"
														role="alert"
													>
														{photoDisplayError}
													</p>
												)}
											</div>
										</div>
									</div>
								</div>
								<div>
									<label className={labelClassName} htmlFor="firstName">
										First Name
									</label>
									<input
										className={inputClassName}
										id="firstName"
										onChange={(e) => set("firstName")(e.target.value)}
										placeholder="Rida"
										type="text"
										value={form.firstName}
									/>
								</div>
								<div>
									<label className={labelClassName} htmlFor="lastName">
										Last Name
									</label>
									<input
										className={inputClassName}
										id="lastName"
										onChange={(e) => set("lastName")(e.target.value)}
										placeholder="Elmazary"
										type="text"
										value={form.lastName}
									/>
								</div>
								<div>
									<label className={labelClassName}>Email Address</label>
									<div className="field rounded-xl px-3.5 py-2.5 font-sans text-sm">
										{user.email}
									</div>
								</div>
								<div>
									<label className={labelClassName} htmlFor="phone">
										Phone Number
									</label>
									<input
										className={inputClassName}
										id="phone"
										onChange={(e) => set("phone")(e.target.value)}
										placeholder="+212 6XX XXX XXX"
										type="tel"
										value={form.phone}
									/>
								</div>
							</div>
						</div>

						{/* Business Information */}
						<div className={cardClassName}>
							<div className={cardHeaderClassName}>
								<h3 className="font-bold font-serif text-(--text-1) text-[15px]">
									Business Information
								</h3>
								<p className="mt-0.5 font-sans text-(--text-2) text-[11px]">
									Your cooperative and legal details
								</p>
							</div>
							<div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
								<div>
									<label className={labelClassName} htmlFor="entityType">
										Entity Type
									</label>
									<select
										className={inputClassName}
										id="entityType"
										onChange={(e) => set("entityType")(e.target.value)}
										value={form.entityType}
									>
										<option value="">Select entity type</option>
										{ENTITY_TYPES.map((t) => (
											<option key={t} value={t}>
												{t}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className={labelClassName} htmlFor="entityName">
										Entity Name
									</label>
									<input
										className={inputClassName}
										id="entityName"
										onChange={(e) => set("entityName")(e.target.value)}
										placeholder="Coopérative Tissint"
										type="text"
										value={form.entityName}
									/>
								</div>
								<div>
									<label
										className={labelClassName}
										htmlFor="registrationNumber"
									>
										Registration No. (RC / ICE)
									</label>
									<input
										className={inputClassName}
										id="registrationNumber"
										onChange={(e) => set("registrationNumber")(e.target.value)}
										placeholder="RC-XXXX-MA-XXXXX"
										type="text"
										value={form.registrationNumber}
									/>
								</div>
								<div>
									<label className={labelClassName} htmlFor="region">
										Region
									</label>
									<select
										className={inputClassName}
										id="region"
										onChange={(e) => set("region")(e.target.value)}
										value={form.region}
									>
										<option value="">Select region</option>
										{MOROCCAN_REGIONS.map((r) => (
											<option key={r} value={r}>
												{r}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className={labelClassName} htmlFor="city">
										City
									</label>
									<input
										className={inputClassName}
										id="city"
										onChange={(e) => set("city")(e.target.value)}
										placeholder="Taliouine"
										type="text"
										value={form.city}
									/>
								</div>
								<div>
									<label className={labelClassName} htmlFor="yearEstablished">
										Year Established
									</label>
									<input
										className={inputClassName}
										id="yearEstablished"
										onChange={(e) => set("yearEstablished")(e.target.value)}
										placeholder="2018"
										type="text"
										value={form.yearEstablished}
									/>
								</div>
								<div className="sm:col-span-2">
									<label className={labelClassName} htmlFor="website">
										Website (optional)
									</label>
									<input
										className={inputClassName}
										id="website"
										onChange={(e) => set("website")(e.target.value)}
										placeholder="www.example.ma"
										type="url"
										value={form.website}
									/>
								</div>
								<div className="sm:col-span-2">
									<p className={labelClassName}>Primary Products</p>
									<p className="mb-2 font-sans text-(--text-2) text-[11px]">
										Select all categories you produce
									</p>
									<div className="flex flex-wrap gap-2">
										{PRODUCT_CATEGORIES.map((cat) => {
											const selected = form.categories.includes(cat.label);
											return (
												<button
													className={`btn rounded-xl px-4 py-2 font-sans font-semibold text-[12px] transition-all ${
														selected ? "btn-accent" : "btn-ghost border-accent"
													}`}
													key={cat.label}
													onClick={() => toggleCategory(cat.label)}
													type="button"
												>
													{cat.label}
												</button>
											);
										})}
									</div>
								</div>
								<div>
									<label className={labelClassName} htmlFor="annualCapacity">
										Annual Capacity
									</label>
									<input
										className={inputClassName}
										id="annualCapacity"
										onChange={(e) => set("annualCapacity")(e.target.value)}
										type="text"
										value={form.annualCapacity}
									/>
								</div>
								<div>
									<label className={labelClassName} htmlFor="exportExperience">
										Export Experience
									</label>
									<select
										className={inputClassName}
										id="exportExperience"
										onChange={(e) => set("exportExperience")(e.target.value)}
										value={form.exportExperience}
									>
										<option value="">Select</option>
										{EXPORT_EXPERIENCE_OPTIONS.map((o) => (
											<option key={o} value={o}>
												{o}
											</option>
										))}
									</select>
								</div>
							</div>
						</div>

						{error && (
							<div className="auth-error rounded-xl px-4 py-3 font-sans text-sm">
								{error}
							</div>
						)}

						<button
							className="btn btn-accent w-fit rounded-xl px-8 py-3 font-sans font-semibold text-sm transition-colors disabled:opacity-60"
							disabled={submitting}
							type="submit"
						>
							{submitting ? "Saving…" : "Save changes"}
						</button>
					</div>

					<ProfileSideCards partnerId={partnerId} partnerSince={memberSince} />
				</div>
			</form>
		</div>
	);
}
