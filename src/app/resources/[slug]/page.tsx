import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { getResourceBySlug, getRelatedResources } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import type { Resource, Creator, Category } from "@/db/schema";

type ResourcePageProps = {
  params: Promise<{ slug: string }>;
};

type ResourceWithRelations = Resource & {
  creator: Creator;
  category: Category;
};

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    BOOK: "Book",
    COURSE: "Course",
    YOUTUBE_SERIES: "YouTube Series",
    PODCAST: "Podcast",
    ARTICLE: "Article",
    COHORT_PROGRAM: "Cohort Program",
  };
  return labels[type] ?? type;
}

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
  const result = await getResourceBySlug(slug);

  if (!result) {
    notFound();
  }

  // Type assertion to help TypeScript understand the shape
  const resource = result as ResourceWithRelations;

  const relatedResources = await getRelatedResources(
    resource.categoryId,
    resource.id
  );

  const typeLabel = getTypeLabel(resource.type);
  const priceText = String(resource.price);
  const isFree = priceText === "Free";

  return (
    <div>
      {/* Hero section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Image */}
          <div className="aspect-4/3 relative overflow-hidden rounded-xl bg-stone-100">
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
              <Badge className="absolute top-4 left-4 bg-amber-400 text-amber-950 border-transparent hover:bg-amber-400 text-sm px-3 py-1.5">
                Staff Pick
              </Badge>
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
              <Badge
                variant="secondary"
                className="bg-stone-100 text-stone-600 border-transparent"
              >
                {typeLabel}
              </Badge>
              <span
                className={`text-lg font-medium ${
                  isFree ? "text-emerald-600" : "text-stone-900"
                }`}
              >
                {priceText}
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
              <Button
                asChild
                size="lg"
                className="h-14 px-8 rounded-full bg-stone-900 hover:bg-stone-800 text-lg"
              >
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Start Learning
                  <ExternalLink className="ml-2 size-5" />
                </a>
              </Button>
            </div>

            {/* Metadata */}
            {resource.metadata != null ? (
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
                      <dd className="text-stone-900 font-medium">
                        {String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
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
                    <div className="aspect-4/3 relative overflow-hidden rounded-lg bg-stone-100 mb-3">
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
