import { Suspense } from "react";
import { FilterPills } from "@/components/FilterPills";
import { ResourceGrid } from "@/components/ResourceGrid";
import {
  getCategoriesWithCounts,
  getTagsWithCounts,
  getResources,
} from "@/lib/queries";

export const metadata = {
  title: "Browse Resources",
  description: "Explore our curated collection of resources by category and tag.",
};

type BrowsePageProps = {
  searchParams: Promise<{
    category?: string;
    tag?: string;
  }>;
};

function BrowseSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8 space-y-6">
        <div className="border-b border-stone-200 pb-6">
          <div className="h-10 w-64 bg-stone-100 rounded animate-pulse mb-4" />
          <div className="h-5 w-full max-w-xl bg-stone-100 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 w-24 bg-stone-100 rounded-full animate-pulse"
              />
            ))}
          </div>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 w-20 bg-stone-100 rounded-full animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[4/3] bg-stone-100 rounded-lg animate-pulse" />
            <div className="h-4 bg-stone-100 rounded animate-pulse w-1/2" />
            <div className="h-6 bg-stone-100 rounded animate-pulse" />
            <div className="h-4 bg-stone-100 rounded animate-pulse w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function BrowseContent({
  searchParams,
}: {
  searchParams: { category?: string; tag?: string };
}) {
  const { category, tag } = searchParams;

  const [categories, tags, resources] = await Promise.all([
    getCategoriesWithCounts(),
    getTagsWithCounts(),
    getResources(category, tag),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8 space-y-8">
        <div className="border-b border-stone-200 pb-8">
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-4">
            Browse Resources
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl leading-relaxed">
            Explore our curated collection of resources. Filter by category or tag
            to find exactly what you need to level up your skills.
          </p>
        </div>

        <div className="space-y-6">
          <FilterPills
            items={categories}
            paramName="category"
            label="Categories"
          />
          <FilterPills items={tags} paramName="tag" label="Tags" />
        </div>
      </div>

      <ResourceGrid resources={resources} />
    </div>
  );
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<BrowseSkeleton />}>
      <BrowseContent searchParams={params} />
    </Suspense>
  );
}

