"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "~/components/avatar";
import { ProfileHeaderCard } from "./profile-header-card";
import { ProfileSideCards } from "./profile-side-cards";
import { useUploadProfileImage } from "~/features/media";
import {
  cardClassName,
  cardHeaderClassName,
  inputClassName,
  labelClassName,
} from "./profile-edit-styles";
import type { ProfileViewUser, ProfileEditProfile } from "~/app/api/profile/schemas/profile.schema";
import {
  MOROCCAN_REGIONS,
  PRODUCT_CATEGORIES,
  ENTITY_TYPES,
  EXPORT_EXPERIENCE_OPTIONS,
  upsertProfile,
  type OnboardingFormData,
} from "~/features/profile";

type Props = {
  user: ProfileViewUser;
  profile: ProfileEditProfile;
  memberSince: string;
  partnerId: string;
};

export function ProfileEditView({ user, profile, memberSince, partnerId }: Props) {
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

  const set = (key: keyof OnboardingFormData) => (value: string | boolean | string[]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleCategory = (cat: string) => {
    setForm((f) =>
      f.categories.includes(cat)
        ? { ...f, categories: f.categories.filter((c) => c !== cat) }
        : { ...f, categories: [...f.categories, cat] }
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
        setPhotoError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
    (uploadProfileImageMutation.isError && uploadProfileImageMutation.error instanceof Error
      ? uploadProfileImageMutation.error.message
      : null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!form.firstName || !form.lastName || !form.phone || !form.entityType || !form.entityName || !form.region || !form.city) {
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
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/producer/profile"
          className="font-sans text-sm text-(--text-2) hover:text-(--text-1) transition-colors"
        >
          ← Back to profile
        </Link>
      </div>

      <ProfileHeaderCard
        displayName={displayName}
        entityName={form.entityName}
        entityType={form.entityType}
        region={form.region}
        memberSince={memberSince}
        profileImage={profile.profileImage}
      />

      <form onSubmit={handleSubmit} className="contents">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
          <div className="flex flex-col gap-4">
            {/* Personal Information */}
            <div className={cardClassName}>
              <div className={cardHeaderClassName}>
                <h3 className="font-serif font-bold text-[15px] text-(--text-1)">Personal Information</h3>
                <p className="font-sans text-[11px] text-(--text-2) mt-0.5">Your account and contact details</p>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 flex flex-wrap items-end gap-4">
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
                          ref={photoInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handlePhotoChange}
                          disabled={photoUploading}
                        />
                        <button
                          type="button"
                          onClick={openPhotoPicker}
                          disabled={photoUploading}
                          className="font-sans text-sm font-medium rounded-xl px-4 py-2 transition-colors disabled:opacity-50 w-fit btn btn-ghost border-accent"
                        >
                          {photoUploading ? "Uploading…" : "Change photo"}
                        </button>
                        {photoDisplayError && (
                          <p className="font-sans text-xs text-red-600 max-w-xs" role="alert">
                            {photoDisplayError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="firstName" className={labelClassName}>
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={(e) => set("firstName")(e.target.value)}
                    className={inputClassName}
                    placeholder="Rida"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClassName}>
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={(e) => set("lastName")(e.target.value)}
                    className={inputClassName}
                    placeholder="Elmazary"
                  />
                </div>
                <div>
                  <label className={labelClassName}>Email Address</label>
                  <div className="font-sans text-sm rounded-xl px-3.5 py-2.5 field">
                    {user.email}
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className={labelClassName}>
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone")(e.target.value)}
                    className={inputClassName}
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className={cardClassName}>
              <div className={cardHeaderClassName}>
                <h3 className="font-serif font-bold text-[15px] text-(--text-1)">Business Information</h3>
                <p className="font-sans text-[11px] text-(--text-2) mt-0.5">Your cooperative and legal details</p>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="entityType" className={labelClassName}>
                    Entity Type
                  </label>
                  <select
                    id="entityType"
                    value={form.entityType}
                    onChange={(e) => set("entityType")(e.target.value)}
                    className={inputClassName}
                  >
                    <option value="">Select entity type</option>
                    {ENTITY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="entityName" className={labelClassName}>
                    Entity Name
                  </label>
                  <input
                    id="entityName"
                    type="text"
                    value={form.entityName}
                    onChange={(e) => set("entityName")(e.target.value)}
                    className={inputClassName}
                    placeholder="Coopérative Tissint"
                  />
                </div>
                <div>
                  <label htmlFor="registrationNumber" className={labelClassName}>
                    Registration No. (RC / ICE)
                  </label>
                  <input
                    id="registrationNumber"
                    type="text"
                    value={form.registrationNumber}
                    onChange={(e) => set("registrationNumber")(e.target.value)}
                    className={inputClassName}
                    placeholder="RC-XXXX-MA-XXXXX"
                  />
                </div>
                <div>
                  <label htmlFor="region" className={labelClassName}>
                    Region
                  </label>
                  <select
                    id="region"
                    value={form.region}
                    onChange={(e) => set("region")(e.target.value)}
                    className={inputClassName}
                  >
                    <option value="">Select region</option>
                    {MOROCCAN_REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="city" className={labelClassName}>
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={form.city}
                    onChange={(e) => set("city")(e.target.value)}
                    className={inputClassName}
                    placeholder="Taliouine"
                  />
                </div>
                <div>
                  <label htmlFor="yearEstablished" className={labelClassName}>
                    Year Established
                  </label>
                  <input
                    id="yearEstablished"
                    type="text"
                    value={form.yearEstablished}
                    onChange={(e) => set("yearEstablished")(e.target.value)}
                    className={inputClassName}
                    placeholder="2018"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="website" className={labelClassName}>
                    Website (optional)
                  </label>
                  <input
                    id="website"
                    type="url"
                    value={form.website}
                    onChange={(e) => set("website")(e.target.value)}
                    className={inputClassName}
                    placeholder="www.example.ma"
                  />
                </div>
                <div className="sm:col-span-2">
                  <p className={labelClassName}>Primary Products</p>
                  <p className="font-sans text-[11px] text-(--text-2) mb-2">Select all categories you produce</p>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCT_CATEGORIES.map((cat) => {
                      const selected = form.categories.includes(cat.label);
                      return (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => toggleCategory(cat.label)}
                          className={`font-sans text-[12px] font-semibold rounded-xl px-4 py-2 transition-all btn ${
                            selected ? "btn-accent" : "btn-ghost border-accent"
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label htmlFor="annualCapacity" className={labelClassName}>
                    Annual Capacity
                  </label>
                  <input
                    id="annualCapacity"
                    type="text"
                    value={form.annualCapacity}
                    onChange={(e) => set("annualCapacity")(e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label htmlFor="exportExperience" className={labelClassName}>
                    Export Experience
                  </label>
                  <select
                    id="exportExperience"
                    value={form.exportExperience}
                    onChange={(e) => set("exportExperience")(e.target.value)}
                    className={inputClassName}
                  >
                    <option value="">Select</option>
                    {EXPORT_EXPERIENCE_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 font-sans text-sm auth-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="font-sans font-semibold text-sm rounded-xl px-8 py-3 transition-colors disabled:opacity-60 w-fit btn btn-accent"
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
