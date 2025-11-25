import { Suspense } from "react";
import { Hero } from "@/components/Hero";
import { CategoryPills } from "@/components/CategoryPills";
import { ResourceGrid } from "@/components/ResourceGrid";
import { getCategoriesWithCounts, getResources } from "@/lib/queries";

type HomePageProps = {
  searchParams: Promise<{ category?: string }>;
};

async function ResourcesSection({ categorySlug }: { categorySlug?: string }) {
  const resources = await getResources(categorySlug);
  return <ResourceGrid resources={resources} />;
}

async function CategoriesSection() {
  const categories = await getCategoriesWithCounts();
  return <CategoryPills categories={categories} />;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { category } = await searchParams;

  return (
    <div>
      <Hero />

      <Suspense
        fallback={
          <div className="px-6 py-8 border-b border-stone-200">
            <div className="max-w-6xl mx-auto">
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-24 bg-stone-100 rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <CategoriesSection />
      </Suspense>

      <Suspense
        fallback={
          <div className="px-6 py-12">
            <div className="max-w-6xl mx-auto">
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
          </div>
        }
      >
        <ResourcesSection categorySlug={category} />
      </Suspense>
    </div>
  );
}
