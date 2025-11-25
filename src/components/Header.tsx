import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl tracking-tight text-stone-900">
            Curricula
          </span>
        </Link>

        <nav className="flex items-center gap-8">
          <Link
            href="/browse"
            className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
          >
            Browse
          </Link>
          <Link
            href="/browse"
            className="text-sm bg-stone-900 text-white px-4 py-2 rounded-full hover:bg-stone-800 transition-colors"
          >
            Explore All →
          </Link>
        </nav>
      </div>
    </header>
  );
}

