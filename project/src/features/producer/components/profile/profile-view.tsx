"use client";

import React from "react";
import Link from "next/link";
import type { ProfileViewUser, ProfileViewProfile } from "~/app/api/profile/schemas/profile.schema";
import { ProfileHeaderCard } from "./profile-header-card";
import { ProfilePersonalSection } from "./profile-personal-section";
import { ProfileBusinessSection } from "./profile-business-section";
import { ProfileSideCards } from "./profile-side-cards";

type Props = {
  user: ProfileViewUser;
  profile: ProfileViewProfile | null;
  memberSince: string;
  partnerId: string;
};

function formatMemberSince(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" }).format(date);
}

export function ProfileView({ user, profile, memberSince, partnerId }: Props) {
  if (!profile) {
    return (
      <div className="p-4 lg:p-6">
        <div className="rounded-xl p-8 text-center card">
          <p className="font-sans text-(--text-2)">No profile data yet. Complete onboarding to see your profile here.</p>
          <Link href="/onboarding" className="mt-4 inline-block font-sans text-sm font-medium text-(--text-1) underline">
            Go to onboarding
          </Link>
        </div>
      </div>
    );
  }

  const displayName = `${profile.firstName} ${profile.lastName}`.trim() || user.name;
  const fullName = displayName;
  const categories = Array.isArray(profile.categories) ? profile.categories : [];

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-4">
      <ProfileHeaderCard
        displayName={displayName}
        entityName={profile.entityName}
        entityType={profile.entityType}
        region={profile.region}
        memberSince={memberSince}
        profileImage={profile.profileImage}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
        <div className="flex flex-col gap-4">
          <ProfilePersonalSection
            fullName={fullName}
            email={user.email}
            phone={profile.phone}
          />
          <ProfileBusinessSection
            entityName={profile.entityName}
            registrationNumber={profile.registrationNumber}
            region={profile.region}
            city={profile.city}
            yearEstablished={profile.yearEstablished}
            categories={categories}
            annualCapacity={profile.annualCapacity}
          />
        </div>
        <ProfileSideCards partnerId={partnerId} partnerSince={memberSince} />
      </div>
    </div>
  );
}

export { formatMemberSince };
