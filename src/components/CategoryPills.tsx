"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type CategoryWithCount = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  resourceCount: number;
};

type CategoryPillsProps = {
  categories: CategoryWithCount[];
};

export function CategoryPills({ categories }: CategoryPillsProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  return (
    <section className="px-6 py-8 border-b border-stone-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <Link
            href="/"
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !activeCategory
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            All
          </Link>

          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/?category=${category.slug}`}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.slug
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {category.name}
              <span
                className={`ml-1.5 ${
                  activeCategory === category.slug
                    ? "text-stone-400"
                    : "text-stone-400"
                }`}
              >
                {category.resourceCount}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

