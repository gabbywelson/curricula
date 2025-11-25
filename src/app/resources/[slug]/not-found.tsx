import Link from "next/link";

export default function ResourceNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-serif text-4xl text-stone-900 mb-4">
          Resource Not Found
        </h1>
        <p className="text-stone-600 mb-8">
          The resource you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

