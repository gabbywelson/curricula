import posthog from "posthog-js";
import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

export const authClient = createAuthClient({
  // Use the current window origin if available to avoid CORS/redirect issues
  // between www and non-www domains. Fallback to env var for SSR.
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : env.NEXT_PUBLIC_APP_URL,
});

const {
  signIn: originalSignIn,
  signOut: originalSignOut,
  useSession,
  getSession,
} = authClient;

const signIn = {
  ...originalSignIn,
  email: async (...args: Parameters<typeof originalSignIn.email>) => {
    posthog.capture("user-signed-in", { provider: "email" });
    return originalSignIn.email(...args);
  },
};

const signOut = async (...args: Parameters<typeof originalSignOut>) => {
  posthog.capture("user-signed-out");
  return originalSignOut(...args);
};

export { signIn, signOut, useSession, getSession };
