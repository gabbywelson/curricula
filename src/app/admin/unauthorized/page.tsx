import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fafafa 1px, transparent 1px), linear-gradient(90deg, #fafafa 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30">
          <svg
            className="h-8 w-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>

        {/* Message */}
        <h1 className="font-serif text-3xl tracking-tight">Access Denied</h1>
        <p className="mt-3 max-w-sm text-[#a1a1aa]">
          You don&apos;t have permission to access this page. Admin privileges
          are required.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-lg border border-[#27272a] bg-[#18181b] px-5 py-2.5 text-sm text-[#fafafa] transition-colors hover:border-[#3f3f46]"
          >
            Go to homepage
          </Link>
          <Link
            href="/admin/login"
            className="text-sm text-[#71717a] transition-colors hover:text-[#a1a1aa]"
          >
            Sign in with a different account
          </Link>
        </div>
      </div>
    </div>
  );
}




