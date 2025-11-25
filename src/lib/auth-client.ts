import posthog from 'posthog-js';
import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

export const authClient = createAuthClient({
  // Use the current window origin if available to avoid CORS/redirect issues
  // between www and non-www domains. Fallback to env var for SSR.
  baseURL: typeof window !== "undefined" ? window.location.origin : env.NEXT_PUBLIC_APP_URL,
});

const {
  signIn: originalSignIn,
  signOut: originalSignOut,
  useSession,
  getSession,
} = authClient;

const signIn = (...args: Parameters<typeof originalSignIn>) => {
  const [options] = args;
  if (options && typeof options === 'object' && 'provider' in options && typeof options.provider === 'string') {
    posthog.capture('user-signed-in', { provider: options.provider });
  } else {
    posthog.capture('user-signed-in');
  }
  return originalSignIn(...args);
};

const signOut = (...args: Parameters<typeof originalSignOut>) => {
  posthog.capture('user-signed-out');
  return originalSignOut(...args);
};

export {
  signIn,
  signOut,
  useSession,
  getSession,
};