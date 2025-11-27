"use server";

import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { headers } from "next/headers";
import { auth, isAdmin } from "@/lib/auth";
import { env } from "@/env";
import { db } from "@/db";
import { pendingSubmissions } from "@/db/schema";

// Initialize Perplexity client (OpenAI-compatible)
const perplexity = createOpenAI({
  apiKey: env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai/",
});

// Schema for a single resource
const resourceSchema = z.object({
  title: z.string().describe("Name of the resource"),
  url: z.string().url().describe("Direct URL to the resource"),
  type: z.enum([
    "BOOK",
    "COURSE",
    "YOUTUBE_SERIES",
    "PODCAST",
    "ARTICLE",
    "COHORT_PROGRAM",
  ]),
  description: z.string().describe("2-3 sentence description"),
  price: z.string().default("Unknown"),
  creatorName: z.string().describe("Person or organization who created this"),
  creatorUrl: z.string().optional(),
  suggestedCategory: z.enum([
    "Productivity",
    "Software Development",
    "Wellness",
    "Business",
    "Finance",
    "Design",
  ]),
  suggestedTags: z.array(z.string()).default([]),
});

const discoveryResultSchema = z.object({
  resources: z.array(resourceSchema),
});

export type DiscoveredResource = z.infer<typeof resourceSchema>;

export async function discoverResources(topic: string): Promise<{
  success: boolean;
  resources?: DiscoveredResource[];
  error?: string;
}> {
  // Auth check
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !isAdmin(session.user)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Use .chat() to force /chat/completions endpoint instead of /responses
    // which is required for Perplexity (it doesn't support the responses API)
    const { object } = await generateObject({
      model: perplexity.chat("sonar"),
      schema: discoveryResultSchema,
      prompt: `Find 10 high-quality educational resources about: ${topic}

Guidelines:
- Only include resources that actually exist and are currently available
- Prefer primary sources (official course pages, publisher sites) over aggregators
- Include a mix of free and paid resources
- Focus on quality over quantity
- Prefer high-quality, indie creators over mainstream ones when possible
- Prefer resources that are sold directly by the creator over resources that are sold through a third party.
- Avoid resources that are too sales-y or marketing-heavy.
- Examples of high-quality, indie creators: Ali Abdaal, Cal Newport, Naval Ravikant, MacSparky, Tiago Forte, Lenny Rachitsky, Will Larson, Sarah Drasner,etc.
- For books, use publisher or Amazon links
- For courses, use official platform links
- Provide accurate pricing when possible`,
    });

    return { success: true, resources: object.resources };
  } catch (error) {
    console.error("Discovery error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to discover resources",
    };
  }
}

export async function addToQueue(
  resource: DiscoveredResource & { discoveryTopic: string }
): Promise<{
  success: boolean;
  id?: number;
  error?: string;
}> {
  // Auth check
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !isAdmin(session.user)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [inserted] = await db
      .insert(pendingSubmissions)
      .values({
        title: resource.title,
        url: resource.url,
        type: resource.type,
        description: resource.description,
        price: resource.price,
        creatorName: resource.creatorName,
        creatorUrl: resource.creatorUrl || null,
        suggestedCategory: resource.suggestedCategory,
        suggestedTags: resource.suggestedTags,
        metadata: {
          discoveryTopic: resource.discoveryTopic,
          sourceAgent: "admin-discover-ui",
        },
      })
      .returning({ id: pendingSubmissions.id });

    return { success: true, id: inserted.id };
  } catch (error) {
    console.error("Add to queue error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add to queue",
    };
  }
}
