"use client";

import { authClient } from "~/lib/auth-client";
import { DEFAULT_CALLBACK_URL_BY_ROLE } from "../constants";
import type { AppRole } from "../constants";

export function useSession() {
  return authClient.useSession();
}

/**
 * Redirect URL after login based on role (client-side).
 */
export function getCallbackUrlForRole(role: string | undefined): string {
  const r = role as AppRole | undefined;
  if (r && r in DEFAULT_CALLBACK_URL_BY_ROLE) {
    return DEFAULT_CALLBACK_URL_BY_ROLE[r as AppRole];
  }
  return "/producer";
}
