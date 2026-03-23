"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateProfileImageUrl } from "~/app/api/profile/actions";
import { uploadMedia } from "~/lib/media";

export const mediaQueryKey = ["media"] as const;

export const profileImageQueryKey = [
	...mediaQueryKey,
	"profile-image",
] as const;

/**
 * Upload a file via global media (type profilePictures) then save the URL to the current user's profile.
 * Profile-specific: composes global upload + profile action. Other features can use uploadMedia + their own save step.
 */
export function useUploadProfileImage() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: async (file: File) => {
			const { url } = await uploadMedia(file, "profilePictures");
			const result = await updateProfileImageUrl(url);
			if (result.error) throw new Error(result.error);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: profileImageQueryKey });
			router.refresh();
		},
	});
}
