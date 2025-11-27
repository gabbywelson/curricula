import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, isAdmin } from "@/lib/auth";
import { DiscoverForm } from "./DiscoverForm";

export default async function DiscoverPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/admin/login");
  }

  if (!isAdmin(session.user)) {
    redirect("/admin/unauthorized");
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[#27272a]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-3">
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
            </Link>
          </div>

          <Link
            href="/admin"
            className="rounded-lg border border-[#27272a] bg-[#18181b] px-3 py-1.5 text-sm text-[#a1a1aa] transition-colors hover:border-[#3f3f46] hover:text-[#fafafa]"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h1 className="font-serif text-3xl tracking-tight">
            Discover Resources
          </h1>
          <p className="mt-2 text-[#a1a1aa]">
            Use AI to find new educational resources on any topic.
          </p>
        </div>

        <DiscoverForm />
      </main>
    </div>
  );
}

