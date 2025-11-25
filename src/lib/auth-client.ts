import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

export const authClient = createAuthClient({
  // Use the current window origin if available to avoid CORS/redirect issues
  // between www and non-www domains. Fallback to env var for SSR.
  baseURL: typeof window !== "undefined" ? window.location.origin : env.NEXT_PUBLIC_APP_URL,
});

export const {
  signIn,
  signOut,
  useSession,
  getSession,
} = authClient;
