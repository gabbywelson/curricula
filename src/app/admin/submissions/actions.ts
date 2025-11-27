"use server";

import { eq, desc } from "drizzle-orm";
import {
  db,
  pendingSubmissions,
  resources,
  creators,
  categories,
  tags,
  resourceTags,
} from "@/db";
import { revalidatePath } from "next/cache";

// ============================================
// Helper Functions
// ============================================

// Generate a URL-friendly slug from a title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

// Ensure slug is unique by appending counter if needed
async function getUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.query.resources.findFirst({
      where: eq(resources.slug, slug),
    });

    if (!existing) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// Ensure creator slug is unique
async function getUniqueCreatorSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.query.creators.findFirst({
      where: eq(creators.slug, slug),
    });

    if (!existing) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// ============================================
// Data Fetching Functions
// ============================================

export async function getPendingSubmissions() {
  const submissions = await db
    .select()
    .from(pendingSubmissions)
    .where(eq(pendingSubmissions.status, "pending"))
    .orderBy(desc(pendingSubmissions.createdAt));

  return submissions;
}

// Get all creators for the approval form dropdown
export async function getAllCreators() {
  return db.query.creators.findMany({
    orderBy: (creators, { asc }) => [asc(creators.name)],
  });
}

// Get all categories for the approval form dropdown
export async function getAllCategories() {
  return db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });
}

// Get all tags for the approval form
export async function getAllTags() {
  return db.query.tags.findMany({
    orderBy: (tags, { asc }) => [asc(tags.name)],
  });
}

// ============================================
// Submission Actions
// ============================================

export async function rejectSubmission(id: number, notes?: string) {
  await db
    .update(pendingSubmissions)
    .set({
      status: "rejected",
      reviewNotes: notes,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(pendingSubmissions.id, id));

  revalidatePath("/admin/submissions");
}

// ============================================
// Approval Types and Action
// ============================================

export type ApprovalData = {
  submissionId: number;
  // Allow overrides from the approval form
  title?: string;
  description?: string;
  price?: string;
  imageUrl?: string | null;
  // Creator resolution
  creatorId?: number; // If matching existing creator
  newCreator?: {
    name: string;
    websiteUrl?: string;
    bio?: string;
  };
  // Category
  categorySlug: string;
  // Tags (array of existing tag IDs)
  tagIds?: number[];
  // Feature flag
  isFeatured?: boolean;
};

export async function approveSubmission(data: ApprovalData): Promise<{
  success: boolean;
  resourceId?: number;
  resourceSlug?: string;
  error?: string;
}> {
  try {
    // 1. Validate submission exists and is pending
    const submission = await db.query.pendingSubmissions.findFirst({
      where: eq(pendingSubmissions.id, data.submissionId),
    });

    if (!submission) {
      return { success: false, error: "Submission not found" };
    }

    if (submission.status !== "pending") {
      return { success: false, error: "Submission is not pending" };
    }

    // 2. Resolve creator
    let creatorId: number;

    if (data.creatorId) {
      // Using existing creator
      creatorId = data.creatorId;
    } else if (data.newCreator) {
      // Create new creator
      const creatorSlug = await getUniqueCreatorSlug(
        generateSlug(data.newCreator.name)
      );

      const [newCreator] = await db
        .insert(creators)
        .values({
          name: data.newCreator.name,
          slug: creatorSlug,
          websiteUrl: data.newCreator.websiteUrl || null,
          bio: data.newCreator.bio || null,
        })
        .returning({ id: creators.id });

      creatorId = newCreator.id;
    } else {
      return { success: false, error: "Creator information required" };
    }

    // 3. Resolve category
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, data.categorySlug),
    });

    if (!category) {
      return {
        success: false,
        error: `Category not found: ${data.categorySlug}`,
      };
    }

    // 4. Generate unique slug for resource
    const resourceSlug = await getUniqueSlug(
      generateSlug(data.title || submission.title)
    );

    // 5. Insert resource
    const [newResource] = await db
      .insert(resources)
      .values({
        title: data.title || submission.title,
        slug: resourceSlug,
        description: data.description ?? submission.description,
        url: submission.url,
        type: submission.type,
        price: data.price || submission.price || "Unknown",
        imageUrl:
          data.imageUrl !== undefined ? data.imageUrl : submission.imageUrl,
        creatorId,
        categoryId: category.id,
        isFeatured: data.isFeatured ?? false,
        metadata: submission.metadata,
      })
      .returning({ id: resources.id });

    // 6. Handle tags if provided
    if (data.tagIds && data.tagIds.length > 0) {
      await db.insert(resourceTags).values(
        data.tagIds.map((tagId) => ({
          resourceId: newResource.id,
          tagId,
        }))
      );
    }

    // 7. Mark submission as approved
    await db
      .update(pendingSubmissions)
      .set({
        status: "approved",
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(pendingSubmissions.id, data.submissionId));

    // 8. Revalidate paths
    revalidatePath("/admin/submissions");
    revalidatePath("/");
    revalidatePath("/browse");

    return {
      success: true,
      resourceId: newResource.id,
      resourceSlug,
    };
  } catch (error) {
    console.error("Approval error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to approve submission",
    };
  }
}


