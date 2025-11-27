"use server";

import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { headers } from "next/headers";
import { auth, isAdmin } from "@/lib/auth";
import { env } from "@/env";
import { db } from "@/db";
import { pendingSubmissions } from "@/db/schema";

// Initialize OpenAI client
const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// Schema for extracted resource
const extractedResourceSchema = z.object({
  title: z.string().describe("The name of the resource"),
  description: z
    .string()
    .describe("A 2-3 sentence description of what this resource offers"),
  type: z
    .enum([
      "BOOK",
      "COURSE",
      "YOUTUBE_SERIES",
      "PODCAST",
      "ARTICLE",
      "COHORT_PROGRAM",
    ])
    .describe("The type of educational resource"),
  price: z
    .string()
    .describe("Price like 'Free', '$49', '$199/year', or 'Unknown'"),
  creatorName: z.string().describe("Person or organization who created this"),
  creatorUrl: z
    .string()
    .optional()
    .describe("URL to creator's main website if mentioned"),
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

export type ExtractedResource = z.infer<typeof extractedResourceSchema>;

async function fetchPageContent(url: string): Promise<{
  markdown: string;
  ogImage: string | null;
}> {
  // Use Jina Reader to get clean markdown content
  const jinaUrl = `https://r.jina.ai/${url}`;
  const response = await fetch(jinaUrl, {
    headers: {
      Accept: "text/markdown",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status}`);
  }

  const markdown = await response.text();

  // Also fetch the raw HTML to extract og:image
  let ogImage: string | null = null;
  try {
    const htmlResponse = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CurriculaBot/1.0)",
      },
    });
    const html = await htmlResponse.text();

    // Extract og:image using regex (simple approach, no cheerio needed)
    const ogMatch =
      html.match(
        /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i
      );

    if (ogMatch) {
      ogImage = ogMatch[1];
      // Handle relative URLs
      if (ogImage.startsWith("/")) {
        const urlObj = new URL(url);
        ogImage = `${urlObj.origin}${ogImage}`;
      }
    }

    // Fallback to twitter:image
    if (!ogImage) {
      const twitterMatch =
        html.match(
          /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i
        ) ||
        html.match(
          /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i
        );
      if (twitterMatch) {
        ogImage = twitterMatch[1];
        if (ogImage.startsWith("/")) {
          const urlObj = new URL(url);
          ogImage = `${urlObj.origin}${ogImage}`;
        }
      }
    }
  } catch (e) {
    console.warn("Failed to extract og:image:", e);
  }

  return { markdown, ogImage };
}

export async function extractFromUrl(url: string): Promise<{
  success: boolean;
  resource?: ExtractedResource & { url: string; imageUrl: string | null };
  error?: string;
}> {
  // Auth check
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !isAdmin(session.user)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Validate URL
    new URL(url);

    // Fetch content
    const { markdown, ogImage } = await fetchPageContent(url);

    // Truncate markdown if too long (keep first ~12k chars for context window)
    const truncatedContent = markdown.slice(0, 12000);

    // Extract with AI
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: extractedResourceSchema,
      prompt: `Extract information about this educational resource from the following page content.

URL: ${url}

Page Content:
${truncatedContent}

Based on this content, extract the resource metadata. Be accurate about pricing - look for actual prices mentioned. For type, determine if this is a book, course, YouTube series, podcast, article, or cohort-based program.`,
    });

    return {
      success: true,
      resource: {
        ...object,
        url,
        imageUrl: ogImage,
      },
    };
  } catch (error) {
    console.error("Extraction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to extract from URL",
    };
  }
}

export async function addExtractedToQueue(
  resource: ExtractedResource & { url: string; imageUrl: string | null }
): Promise<{ success: boolean; id?: number; error?: string }> {
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
        imageUrl: resource.imageUrl,
        creatorName: resource.creatorName,
        creatorUrl: resource.creatorUrl || null,
        suggestedCategory: resource.suggestedCategory,
        suggestedTags: resource.suggestedTags,
        metadata: {
          sourceAgent: "admin-extract-ui",
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
