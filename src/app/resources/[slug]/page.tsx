import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getResourceBySlug, getRelatedResources } from "@/lib/queries";
import { ResourceGrid } from "@/components/ResourceGrid";
import type { Metadata } from "next";

type ResourcePageProps = {
  params: Promise<{ slug: string }>;
};

const typeLabels: Record<string, string> = {
  BOOK: "Book",
  COURSE: "Course",
  YOUTUBE_SERIES: "YouTube Series",
  PODCAST: "Podcast",
  ARTICLE: "Article",
  COHORT_PROGRAM: "Cohort Program",
};

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);

  if (!resource) {
    return {
      title: "Resource Not Found - Curricula",
    };
  }

  return {
    title: `${resource.title} - Curricula`,
    description: resource.description || `Learn with ${resource.title}`,
  };
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);

  if (!resource) {
    notFound();
  }

  const relatedResources = await getRelatedResources(
    resource.categoryId,
    resource.id
  );

  return (
    <div>
      {/* Hero section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Image */}
          <div className="aspect-[4/3] relative overflow-hidden rounded-xl bg-stone-100">
            {resource.imageUrl ? (
              <Image
                src={resource.imageUrl}
                alt={resource.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-stone-300 text-6xl font-serif">
                  {resource.title[0]}
                </span>
              </div>
            )}

            {/* Featured badge */}
            {resource.isFeatured && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-amber-400 text-amber-950 text-sm font-medium rounded-full">
                Staff Pick
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm">
              <Link
                href={`/creators/${resource.creator.slug}`}
                className="text-stone-600 hover:text-stone-900 transition-colors"
              >
                {resource.creator.name}
              </Link>
              <span className="text-stone-300">·</span>
              <Link
                href={`/?category=${resource.category.slug}`}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                {resource.category.name}
              </Link>
            </nav>

            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl text-stone-900 leading-tight">
              {resource.title}
            </h1>

            {/* Type and Price */}
            <div className="flex items-center gap-4">
              <span className="px-3 py-1.5 bg-stone-100 text-stone-600 text-sm font-medium rounded-full">
                {typeLabels[resource.type] || resource.type}
              </span>
              <span
                className={`text-lg font-medium ${
                  resource.price === "Free"
                    ? "text-emerald-600"
                    : "text-stone-900"
                }`}
              >
                {resource.price}
              </span>
            </div>

            {/* Description */}
            {resource.description && (
              <div className="prose prose-stone max-w-none">
                <p className="text-stone-600 leading-relaxed text-lg">
                  {resource.description}
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="pt-4">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors text-lg"
              >
                Start Learning
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>

            {/* Metadata */}
            {resource.metadata && (
              <div className="pt-6 border-t border-stone-200">
                <h3 className="text-sm font-medium text-stone-400 uppercase tracking-wider mb-3">
                  Details
                </h3>
                <dl className="grid grid-cols-2 gap-4">
                  {Object.entries(
                    resource.metadata as Record<string, string | number>
                  ).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm text-stone-500 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </dt>
                      <dd className="text-stone-900 font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related resources */}
      {relatedResources.length > 0 && (
        <section className="border-t border-stone-200 mt-12">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl text-stone-900">
                More in {resource.category.name}
              </h2>
              <Link
                href={`/?category=${resource.category.slug}`}
                className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {relatedResources.map((related) => (
                <article key={related.id} className="group">
                  <Link href={`/resources/${related.slug}`} className="block">
                    <div className="aspect-[4/3] relative overflow-hidden rounded-lg bg-stone-100 mb-3">
                      {related.imageUrl ? (
                        <Image
                          src={related.imageUrl}
                          alt={related.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-stone-300 text-2xl font-serif">
                            {related.title[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-serif text-base text-stone-900 leading-snug group-hover:text-stone-600 transition-colors line-clamp-2">
                      {related.title}
                    </h3>
                    <p className="text-sm text-stone-500 mt-1">
                      {related.creator.name}
                    </p>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

