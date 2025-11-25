'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import posthog from 'posthog-js';

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
            onClick={() => posthog.capture('header_nav_link_clicked', { destination: '/browse', link_text: 'Browse' })}
          >
            Browse
          </Link>
          <Link
            href="/about"
            className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
            onClick={() => posthog.capture('header_nav_link_clicked', { destination: '/about', link_text: 'About' })}
          >
            About
          </Link>
          <Button
            asChild
            className="rounded-full bg-stone-900 hover:bg-stone-800"
            onClick={() => posthog.capture('header_cta_clicked', { destination: '/browse' })}
          >
            <Link href="/browse">Explore All →</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
