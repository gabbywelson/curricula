import { eq, sql, desc } from "drizzle-orm";
import { db, resources, categories, creators } from "@/db";

// Get all categories with resource counts
export async function getCategoriesWithCounts() {
  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      resourceCount: sql<number>`count(${resources.id})::int`,
    })
    .from(categories)
    .leftJoin(resources, eq(resources.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.name);

  return result;
}

// Get all resources with creator and category info
export async function getResources(categorySlug?: string) {
  const query = db.query.resources.findMany({
    with: {
      creator: true,
      category: true,
    },
    orderBy: [desc(resources.isFeatured), desc(resources.createdAt)],
    where: categorySlug
      ? eq(
          resources.categoryId,
          db
            .select({ id: categories.id })
            .from(categories)
            .where(eq(categories.slug, categorySlug))
            .limit(1)
        )
      : undefined,
  });

  return query;
}

// Get a single resource by slug
export async function getResourceBySlug(slug: string) {
  const result = await db.query.resources.findFirst({
    where: eq(resources.slug, slug),
    with: {
      creator: true,
      category: true,
    },
  });

  return result;
}

// Get resources by category (excluding a specific resource)
export async function getRelatedResources(
  categoryId: number,
  excludeResourceId: number,
  limit = 4
) {
  const result = await db.query.resources.findMany({
    where: eq(resources.categoryId, categoryId),
    with: {
      creator: true,
      category: true,
    },
    orderBy: [desc(resources.isFeatured), desc(resources.createdAt)],
    limit: limit + 1, // Fetch one extra in case we need to exclude
  });

  return result.filter((r) => r.id !== excludeResourceId).slice(0, limit);
}

// Get a single creator by slug
export async function getCreatorBySlug(slug: string) {
  const result = await db.query.creators.findFirst({
    where: eq(creators.slug, slug),
  });

  return result;
}

// Get all resources by creator
export async function getResourcesByCreator(creatorId: number) {
  const result = await db.query.resources.findMany({
    where: eq(resources.creatorId, creatorId),
    with: {
      creator: true,
      category: true,
    },
    orderBy: [desc(resources.isFeatured), desc(resources.createdAt)],
  });

  return result;
}

// Get a single category by slug
export async function getCategoryBySlug(slug: string) {
  const result = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });

  return result;
}

// Get all resources by category slug
export async function getResourcesByCategorySlug(categorySlug: string) {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return [];

  const result = await db.query.resources.findMany({
    where: eq(resources.categoryId, category.id),
    with: {
      creator: true,
      category: true,
    },
    orderBy: [desc(resources.isFeatured), desc(resources.createdAt)],
  });

  return result;
}
