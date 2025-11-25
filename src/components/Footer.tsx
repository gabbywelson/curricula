import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <Link href="/" className="font-serif text-xl text-stone-900">
              Curricula
            </Link>
            <p className="text-sm text-stone-500 mt-2 max-w-sm">
              A curated directory of the best educational resources on the
              internet.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
                Explore
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/browse"
                    className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    Browse All
                  </Link>
                </li>
                <li>
                  <Link
                    href="/?category=productivity"
                    className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    Productivity
                  </Link>
                </li>
                <li>
                  <Link
                    href="/?category=software-development"
                    className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    Development
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
                About
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    About Curricula
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about#roadmap"
                    className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200 mt-8 pt-8 text-center">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} Curricula. Curated with care.
          </p>
        </div>
      </div>
    </footer>
  );
}
