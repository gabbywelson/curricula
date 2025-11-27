"use server";

import { eq, desc } from "drizzle-orm";
import { db, pendingSubmissions } from "@/db";
import { revalidatePath } from "next/cache";

export async function getPendingSubmissions() {
  const submissions = await db
    .select()
    .from(pendingSubmissions)
    .where(eq(pendingSubmissions.status, "pending"))
    .orderBy(desc(pendingSubmissions.createdAt));

  return submissions;
}

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


