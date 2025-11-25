import Link from "next/link";
import Image from "next/image";
import type { Resource, Creator, Category } from "@/db/schema";

type ResourceWithRelations = Resource & {
  creator: Creator;
  category: Category;
};

type ResourceCardProps = {
  resource: ResourceWithRelations;
};

const typeLabels: Record<string, string> = {
  BOOK: "Book",
  COURSE: "Course",
  YOUTUBE_SERIES: "YouTube",
  PODCAST: "Podcast",
  ARTICLE: "Article",
  COHORT_PROGRAM: "Cohort",
};

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <article className="group relative">
      <Link href={`/resources/${resource.slug}`} className="block">
        {/* Image container */}
        <div className="aspect-[4/3] relative overflow-hidden rounded-lg bg-stone-100 mb-4">
          {resource.imageUrl ? (
            <Image
              src={resource.imageUrl}
              alt={resource.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-stone-300 text-4xl font-serif">
                {resource.title[0]}
              </span>
            </div>
          )}

          {/* Featured badge */}
          {resource.isFeatured && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-amber-400 text-amber-950 text-xs font-medium rounded-full">
              Staff Pick
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-stone-700 text-xs font-medium rounded-full">
            {typeLabels[resource.type] || resource.type}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          {/* Creator and Category */}
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="hover:text-stone-900 transition-colors">
              {resource.creator.name}
            </span>
            <span>·</span>
            <span className="text-stone-400">{resource.category.name}</span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg text-stone-900 leading-snug group-hover:text-stone-600 transition-colors line-clamp-2">
            {resource.title}
          </h3>

          {/* Price and arrow */}
          <div className="flex items-center justify-between pt-1">
            <span
              className={`text-sm font-medium ${
                resource.price === "Free" ? "text-emerald-600" : "text-stone-600"
              }`}
            >
              {resource.price}
            </span>
            <span className="text-stone-400 group-hover:text-stone-600 group-hover:translate-x-0.5 transition-all">
              →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

