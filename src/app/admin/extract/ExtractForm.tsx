"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";
import {
  extractFromUrl,
  addExtractedToQueue,
  type ExtractedResource,
} from "./actions";

const RESOURCE_TYPES = [
  "BOOK",
  "COURSE",
  "YOUTUBE_SERIES",
  "PODCAST",
  "ARTICLE",
  "COHORT_PROGRAM",
] as const;

const CATEGORIES = [
  "Productivity",
  "Software Development",
  "Wellness",
  "Business",
  "Finance",
  "Design",
] as const;

type ExtractedResourceWithMeta = ExtractedResource & {
  url: string;
  imageUrl: string | null;
};

export function ExtractForm() {
  const [url, setUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resource, setResource] = useState<ExtractedResourceWithMeta | null>(
    null
  );
  const [isAdded, setIsAdded] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsExtracting(true);
    setError(null);
    setResource(null);
    setIsAdded(false);
    setAddedId(null);

    posthog.capture("url_extraction_started", {
      url: url.trim(),
    });

    const result = await extractFromUrl(url.trim());

    if (result.success && result.resource) {
      setResource(result.resource);
      posthog.capture("url_extracted", {
        url: url.trim(),
        title: result.resource.title,
        type: result.resource.type,
        has_image: !!result.resource.imageUrl,
      });
    } else {
      setError(result.error || "Failed to extract from URL");
      posthog.capture("url_extraction_failed", {
        url: url.trim(),
        error: result.error,
      });
    }

    setIsExtracting(false);
  };

  const updateResource = (
    field: keyof ExtractedResourceWithMeta,
    value: string | string[] | null
  ) => {
    if (!resource) return;
    setResource({ ...resource, [field]: value });
  };

  const handleAddToQueue = async () => {
    if (!resource) return;

    setIsAdding(true);

    const result = await addExtractedToQueue(resource);

    if (result.success) {
      setIsAdded(true);
      setAddedId(result.id || null);
      posthog.capture("extracted_resource_added", {
        url: resource.url,
        title: resource.title,
        type: resource.type,
        category: resource.suggestedCategory,
        submission_id: result.id,
      });
    } else {
      setError(result.error || "Failed to add to queue");
    }

    setIsAdding(false);
  };

  const handleReset = () => {
    setUrl("");
    setResource(null);
    setError(null);
    setIsAdded(false);
    setAddedId(null);
  };

  return (
    <div className="space-y-8">
      {/* URL Input Form */}
      <form onSubmit={handleExtract} className="flex gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a URL (e.g., https://coursera.org/learn/...)..."
          className="flex-1 rounded-lg border border-[#27272a] bg-[#0a0a0a] px-4 py-2.5 text-[#fafafa] placeholder-[#71717a] focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          disabled={isExtracting}
        />
        <button
          type="submit"
          disabled={isExtracting || !url.trim()}
          className="rounded-lg bg-amber-500 px-6 py-2.5 font-medium text-[#0a0a0a] transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExtracting ? "Extracting..." : "Extract"}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isExtracting && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            <p className="text-[#a1a1aa]">Extracting metadata from URL...</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {isAdded && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
              <svg
                className="h-5 w-5 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <title>Success</title>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-emerald-300">
                Added to submission queue
              </p>
              <p className="text-sm text-emerald-400/80">
                {addedId && `Submission ID: ${addedId} • `}
                <Link
                  href="/admin/submissions"
                  className="underline hover:text-emerald-300"
                >
                  View submissions queue
                </Link>
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400 transition-colors hover:bg-emerald-500/20"
            >
              Extract Another
            </button>
          </div>
        </div>
      )}

      {/* Extracted Resource Form */}
      {resource && !isAdded && (
        <div className="overflow-hidden rounded-xl border border-[#27272a] bg-[#18181b]/50">
          {/* Card Header with Image */}
          <div className="border-b border-[#27272a] px-6 py-4">
            <div className="flex gap-6">
              {/* Image Preview */}
              <div className="flex-shrink-0">
                {resource.imageUrl ? (
                  <div className="relative h-24 w-40 overflow-hidden rounded-lg bg-[#27272a]">
                    <Image
                      src={resource.imageUrl}
                      alt={resource.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-40 items-center justify-center rounded-lg bg-[#27272a]">
                    <svg
                      className="h-8 w-8 text-[#52525b]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                      <title>No image</title>
                    </svg>
                  </div>
                )}
              </div>

              {/* Title and URL */}
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={resource.title}
                  onChange={(e) => updateResource("title", e.target.value)}
                  className="w-full border-none bg-transparent font-serif text-xl leading-tight focus:outline-none focus:ring-0"
                  placeholder="Resource title"
                />
                <div className="flex items-center gap-2 text-sm text-amber-500">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                    />
                    <title>Link</title>
                  </svg>
                  <span className="truncate">{resource.url}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-6 py-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Type */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#71717a]">
                  Type
                </label>
                <select
                  value={resource.type}
                  onChange={(e) => updateResource("type", e.target.value)}
                  className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] focus:border-[#3f3f46] focus:outline-none"
                >
                  {RESOURCE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#71717a]">
                  Category
                </label>
                <select
                  value={resource.suggestedCategory}
                  onChange={(e) =>
                    updateResource("suggestedCategory", e.target.value)
                  }
                  className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] focus:border-[#3f3f46] focus:outline-none"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Creator */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#71717a]">
                  Creator
                </label>
                <input
                  type="text"
                  value={resource.creatorName}
                  onChange={(e) => updateResource("creatorName", e.target.value)}
                  className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] focus:border-[#3f3f46] focus:outline-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#71717a]">
                  Price
                </label>
                <input
                  type="text"
                  value={resource.price}
                  onChange={(e) => updateResource("price", e.target.value)}
                  className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] focus:border-[#3f3f46] focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#71717a]">
                Description
              </label>
              <textarea
                value={resource.description}
                onChange={(e) => updateResource("description", e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] focus:border-[#3f3f46] focus:outline-none"
              />
            </div>

            {/* Tags */}
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#71717a]">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={resource.suggestedTags.join(", ")}
                onChange={(e) =>
                  updateResource(
                    "suggestedTags",
                    e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                  )
                }
                className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] focus:border-[#3f3f46] focus:outline-none"
                placeholder="e.g., beginner, video, practical"
              />
            </div>

            {/* Creator URL */}
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#71717a]">
                Creator URL (optional)
              </label>
              <input
                type="url"
                value={resource.creatorUrl || ""}
                onChange={(e) => updateResource("creatorUrl", e.target.value)}
                className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] focus:border-[#3f3f46] focus:outline-none"
                placeholder="https://..."
              />
            </div>

            {/* Image URL */}
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#71717a]">
                Image URL
              </label>
              <input
                type="url"
                value={resource.imageUrl || ""}
                onChange={(e) =>
                  updateResource("imageUrl", e.target.value || null)
                }
                className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] focus:border-[#3f3f46] focus:outline-none"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Card Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-[#27272a] px-6 py-3">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-2 text-sm text-[#a1a1aa] transition-colors hover:border-[#3f3f46] hover:text-[#fafafa]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddToQueue}
              disabled={isAdding}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-[#0a0a0a] transition-colors hover:bg-amber-400 disabled:opacity-50"
            >
              {isAdding ? "Adding..." : "Add to Queue"}
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isExtracting && !resource && !error && (
        <div className="rounded-xl border border-[#27272a] bg-[#18181b]/50 px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#27272a]">
            <svg
              className="h-6 w-6 text-[#71717a]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244"
              />
              <title>Link icon</title>
            </svg>
          </div>
          <h3 className="font-serif text-lg">Paste a URL to get started</h3>
          <p className="mt-1 text-sm text-[#71717a]">
            Enter a course, book, or article URL and we&apos;ll extract the
            metadata automatically.
          </p>
        </div>
      )}
    </div>
  );
}

