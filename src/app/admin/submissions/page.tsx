import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, isAdmin } from "@/lib/auth";
import { getPendingSubmissions } from "./actions";
import { SubmissionCard } from "./SubmissionCard";

export default async function SubmissionsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/admin/login");
  }

  if (!isAdmin(session.user)) {
    redirect("/admin/unauthorized");
  }

  const submissions = await getPendingSubmissions();

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
            Pending Submissions
          </h1>
          <p className="mt-2 text-[#a1a1aa]">
            Review and approve resources submitted by AI agents.
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="rounded-xl border border-[#27272a] bg-[#18181b]/50 px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#27272a]">
              <svg
                className="h-6 w-6 text-[#71717a]"
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
                <title>No submissions</title>
              </svg>
            </div>
            <h3 className="font-serif text-lg">No pending submissions</h3>
            <p className="mt-1 text-sm text-[#71717a]">
              When AI agents submit resources, they&apos;ll appear here for
              review.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

