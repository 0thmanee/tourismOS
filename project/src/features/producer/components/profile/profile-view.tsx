"use client";

import Link from "next/link";
import React from "react";
import type {
	ProfileViewProfile,
	ProfileViewUser,
} from "~/app/api/profile/schemas/profile.schema";
import { ProfileBusinessSection } from "./profile-business-section";
import { ProfileHeaderCard } from "./profile-header-card";
import { ProfilePersonalSection } from "./profile-personal-section";
import { ProfileSideCards } from "./profile-side-cards";

type Props = {
	user: ProfileViewUser;
	profile: ProfileViewProfile | null;
	memberSince: string;
	partnerId: string;
};

function formatMemberSince(date: Date): string {
	return new Intl.DateTimeFormat("en-GB", {
		month: "short",
		year: "numeric",
	}).format(date);
}

export function ProfileView({ user, profile, memberSince, partnerId }: Props) {
	if (!profile) {
		return (
			<div className="p-4 lg:p-6">
				<div className="card rounded-xl p-8 text-center">
					<p className="font-sans text-(--text-2)">
						No profile data yet. Complete onboarding to see your profile here.
					</p>
					<Link
						className="mt-4 inline-block font-medium font-sans text-(--text-1) text-sm underline"
						href="/onboarding"
					>
						Go to onboarding
					</Link>
				</div>
			</div>
		);
	}

	const displayName =
		`${profile.firstName} ${profile.lastName}`.trim() || user.name;
	const fullName = displayName;
	const categories = Array.isArray(profile.categories)
		? profile.categories
		: [];

	return (
		<div className="flex flex-col gap-4 p-4 lg:p-6">
			<ProfileHeaderCard
				displayName={displayName}
				entityName={profile.entityName}
				entityType={profile.entityType}
				memberSince={memberSince}
				profileImage={profile.profileImage}
				region={profile.region}
			/>

			<div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_300px]">
				<div className="flex flex-col gap-4">
					<ProfilePersonalSection
						email={user.email}
						fullName={fullName}
						phone={profile.phone}
					/>
					<ProfileBusinessSection
						annualCapacity={profile.annualCapacity}
						categories={categories}
						city={profile.city}
						entityName={profile.entityName}
						region={profile.region}
						registrationNumber={profile.registrationNumber}
						yearEstablished={profile.yearEstablished}
					/>
				</div>
				<ProfileSideCards partnerId={partnerId} partnerSince={memberSince} />
			</div>
		</div>
	);
}

export { formatMemberSince };
