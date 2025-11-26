import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, pendingSubmissions, resourceTypeEnum } from "@/db";
import { env } from "@/env";

const submissionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  url: z.string().url("Invalid URL"),
  type: z.enum(resourceTypeEnum.enumValues, {
    message: `Type must be one of: ${resourceTypeEnum.enumValues.join(", ")}`,
  }),
  price: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  creatorName: z.string().min(1, "Creator name is required"),
  creatorUrl: z.string().url("Invalid creator URL").optional().or(z.literal("")),
  suggestedCategory: z.string().min(1, "Suggested category is required"),
  suggestedTags: z.array(z.string()).optional(),
  metadata: z
    .object({
      discoveryTopic: z.string().optional(),
      sourceAgent: z.string().optional(),
      confidenceScore: z.number().min(0).max(1).optional(),
      urlVerified: z.boolean().optional(),
      notes: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

export async function POST(request: NextRequest) {
  // Validate bearer token
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid authorization header" },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7);
  if (token !== env.SUBMISSION_API_TOKEN) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const result = submissionSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = result.data;

  // Insert into pending_submissions
  try {
    const [submission] = await db
      .insert(pendingSubmissions)
      .values({
        title: data.title,
        description: data.description,
        url: data.url,
        type: data.type,
        price: data.price,
        imageUrl: data.imageUrl || null,
        creatorName: data.creatorName,
        creatorUrl: data.creatorUrl || null,
        suggestedCategory: data.suggestedCategory,
        suggestedTags: data.suggestedTags ?? [],
        metadata: data.metadata,
      })
      .returning({ id: pendingSubmissions.id });

    return NextResponse.json(
      { id: submission.id, message: "Submission received" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to insert submission:", error);
    return NextResponse.json(
      { error: "Failed to save submission" },
      { status: 500 }
    );
  }
}

