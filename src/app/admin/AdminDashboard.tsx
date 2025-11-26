"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth-client";
import posthog from "posthog-js";

interface AdminDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string | null;
  };
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    posthog.capture("admin_signed_out", {
      user_id: user.id,
    });
    await signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[#27272a]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 ring-1 ring-amber-500/30">
              <svg
                className="h-5 w-5 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
                <title>Curricula Logo</title>
              </svg>
            </div>
            <span className="font-serif text-xl tracking-tight">
              Curricula Admin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-[#71717a]">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-[#27272a] bg-[#18181b] px-3 py-1.5 text-sm text-[#a1a1aa] transition-colors hover:border-[#3f3f46] hover:text-[#fafafa]"
              type="button"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Welcome section */}
        <div className="mb-12">
          <h1 className="font-serif text-3xl tracking-tight">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-[#a1a1aa]">
            Manage your content, resources, and settings from here.
          </p>
        </div>

        {/* Hello World verification card */}
        <div className="mb-8 overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-600/10">
          <div className="border-b border-emerald-500/20 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                Auth Status
              </span>
            </div>
          </div>
          <div className="px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/40">
                <svg
                  className="h-7 w-7 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <title>Authentication Working</title>
                </svg>
              </div>
              <div>
                <h2 className="font-serif text-2xl text-emerald-300">
                  Hello, World!
                </h2>
                <p className="mt-1 text-emerald-400/80">
                  Authentication is working. You&apos;re signed in as an admin.
                </p>
              </div>
            </div>
            <div className="mt-6 rounded-lg bg-[#0a0a0a]/50 p-4 font-mono text-sm">
              <div className="flex items-center gap-2 text-[#71717a]">
                <span className="text-emerald-400">user.id</span>
                <span>=</span>
                <span className="text-[#fafafa]">{user.id}</span>
              </div>
              <div className="flex items-center gap-2 text-[#71717a]">
                <span className="text-emerald-400">user.role</span>
                <span>=</span>
                <span className="text-amber-400">
                  &quot;{user.role || "user"}&quot;
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/submissions">
            <QuickActionCard
              title="Submissions"
              description="Review pending submissions"
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                  />
                  <title>Submissions</title>
                </svg>
              }
            />
          </Link>
          <Link href="/admin/discover">
            <QuickActionCard
              title="Discover Resources"
              description="Find new resources with AI"
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  />
                  <title>Discover Resources</title>
                </svg>
              }
            />
          </Link>
          <QuickActionCard
            title="Tags"
            description="Organize content with tags"
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6h.008v.008H6V6z"
                />
                <title>Tags</title>
              </svg>
            }
            comingSoon
          />
          <QuickActionCard
            title="Categories"
            description="Manage content categories"
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
                <title>Categories</title>
              </svg>
            }
            comingSoon
          />
        </div>

        {/* Future CMS note */}
        <div className="mt-12 rounded-lg border border-[#27272a] bg-[#18181b]/50 px-6 py-4">
          <p className="text-sm text-[#71717a]">
            <span className="font-medium text-[#a1a1aa]">Coming soon:</span>{" "}
            Full content management capabilities. This admin panel will be
            enhanced with a CMS for managing resources, creators, and more.
          </p>
        </div>
      </main>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  icon,
  comingSoon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#27272a] bg-[#18181b]/50 p-6 transition-colors hover:border-[#3f3f46]">
      {comingSoon && (
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-[#27272a] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#71717a]">
            Soon
          </span>
        </div>
      )}
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#27272a] text-[#a1a1aa] transition-colors group-hover:bg-amber-500/20 group-hover:text-amber-400">
        {icon}
      </div>
      <h3 className="font-serif text-lg">{title}</h3>
      <p className="mt-1 text-sm text-[#71717a]">{description}</p>
    </div>
  );
}
