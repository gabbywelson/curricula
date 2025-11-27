"use client";

import { useState } from "react";
import posthog from "posthog-js";
import {
  discoverResources,
  addToQueue,
  type DiscoveredResource,
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

export function DiscoverForm() {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resources, setResources] = useState<DiscoveredResource[]>([]);
  const [addedIndices, setAddedIndices] = useState<Set<number>>(new Set());
  const [addingIndex, setAddingIndex] = useState<number | null>(null);
  const [editedResources, setEditedResources] = useState<
    Map<number, DiscoveredResource>
  >(new Map());

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);
    setResources([]);
    setAddedIndices(new Set());
    setEditedResources(new Map());

    posthog.capture("resource_discovery_started", {
      topic: topic.trim(),
    });

    const result = await discoverResources(topic.trim());

    if (result.success && result.resources) {
      setResources(result.resources);
      posthog.capture("resources_discovered", {
        topic: topic.trim(),
        count: result.resources.length,
      });
    } else {
      setError(result.error || "Failed to discover resources");
      posthog.capture("resource_discovery_failed", {
        topic: topic.trim(),
        error: result.error,
      });
    }

    setIsLoading(false);
  };

  const getResource = (index: number): DiscoveredResource => {
    return editedResources.get(index) || resources[index];
  };

  const updateResource = (
    index: number,
    field: keyof DiscoveredResource,
    value: string | string[]
  ) => {
    const current = getResource(index);
    setEditedResources(
      new Map(editedResources).set(index, { ...current, [field]: value })
    );
  };

  const handleAddToQueue = async (index: number) => {
    const resource = getResource(index);
    setAddingIndex(index);

    const result = await addToQueue({
      ...resource,
      discoveryTopic: topic.trim(),
    });

    if (result.success) {
      setAddedIndices(new Set(addedIndices).add(index));
      posthog.capture("resource_added_to_queue", {
        topic: topic.trim(),
        resource_title: resource.title,
        resource_type: resource.type,
        resource_category: resource.suggestedCategory,
        submission_id: result.id,
      });
    } else {
      setError(result.error || "Failed to add resource");
    }

    setAddingIndex(null);
  };

  const handleSkip = (index: number) => {
    const resource = getResource(index);
    posthog.capture("resource_skipped", {
      topic: topic.trim(),
      resource_title: resource.title,
      resource_type: resource.type,
    });
    setResources(resources.filter((_, i) => i !== index));
    // Adjust editedResources keys
    const newEdited = new Map<number, DiscoveredResource>();
    editedResources.forEach((value, key) => {
      if (key < index) {
        newEdited.set(key, value);
      } else if (key > index) {
        newEdited.set(key - 1, value);
      }
    });
    setEditedResources(newEdited);
    // Adjust addedIndices
    const newAdded = new Set<number>();
    addedIndices.forEach((i) => {
      if (i < index) {
        newAdded.add(i);
      } else if (i > index) {
        newAdded.add(i - 1);
      }
    });
    setAddedIndices(newAdded);
  };

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <form onSubmit={handleDiscover} className="flex gap-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic (e.g., systems thinking, machine learning)..."
          className="flex-1 rounded-lg border border-[#27272a] bg-[#0a0a0a] px-4 py-2.5 text-[#fafafa] placeholder-[#71717a] focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="rounded-lg bg-amber-500 px-6 py-2.5 font-medium text-[#0a0a0a] transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Searching..." : "Discover"}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            <p className="text-[#a1a1aa]">Searching for resources...</p>
          </div>
        </div>
      )}

      {/* Results */}
      {!isLoading && resources.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-[#71717a]">
            Found {resources.length} resource{resources.length !== 1 && "s"}
          </p>
          {resources.map((_, index) => {
            const resource = getResource(index);
            const isAdded = addedIndices.has(index);
            const isAdding = addingIndex === index;

            return (
              <div
                key={`${resource.url}-${index}`}
                className={`overflow-hidden rounded-xl border ${
                  isAdded
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-[#27272a] bg-[#18181b]/50"
                }`}
              >
                {/* Card Header */}
                <div className="border-b border-[#27272a] px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={resource.title}
                        onChange={(e) =>
                          updateResource(index, "title", e.target.value)
                        }
                        className="w-full border-none bg-transparent font-serif text-lg leading-tight focus:outline-none focus:ring-0"
                        disabled={isAdded}
                      />
                      <input
                        type="url"
                        value={resource.url}
                        onChange={(e) =>
                          updateResource(index, "url", e.target.value)
                        }
                        className="w-full truncate border-none bg-transparent text-sm text-amber-500 focus:outline-none focus:ring-0"
                        disabled={isAdded}
                      />
                    </div>
                    {isAdded && (
                      <div className="flex items-center gap-2 text-emerald-400">
                        <svg
                          className="h-5 w-5"
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
                          <title>Added</title>
                        </svg>
                        <span className="text-sm font-medium">Added</span>
                      </div>
                    )}
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
                        onChange={(e) =>
                          updateResource(index, "type", e.target.value)
                        }
                        className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] focus:border-[#3f3f46] focus:outline-none"
                        disabled={isAdded}
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
                          updateResource(
                            index,
                            "suggestedCategory",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] focus:border-[#3f3f46] focus:outline-none"
                        disabled={isAdded}
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
                        onChange={(e) =>
                          updateResource(index, "creatorName", e.target.value)
                        }
                        className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] focus:border-[#3f3f46] focus:outline-none"
                        disabled={isAdded}
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
                        onChange={(e) =>
                          updateResource(index, "price", e.target.value)
                        }
                        className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] focus:border-[#3f3f46] focus:outline-none"
                        disabled={isAdded}
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
                      onChange={(e) =>
                        updateResource(index, "description", e.target.value)
                      }
                      rows={2}
                      className="w-full resize-none rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] focus:border-[#3f3f46] focus:outline-none"
                      disabled={isAdded}
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
                          index,
                          "suggestedTags",
                          e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean)
                        )
                      }
                      className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] focus:border-[#3f3f46] focus:outline-none"
                      placeholder="e.g., beginner, video, practical"
                      disabled={isAdded}
                    />
                  </div>

                  {/* Creator URL (optional) */}
                  <div className="mt-4">
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#71717a]">
                      Creator URL (optional)
                    </label>
                    <input
                      type="url"
                      value={resource.creatorUrl || ""}
                      onChange={(e) =>
                        updateResource(index, "creatorUrl", e.target.value)
                      }
                      className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] focus:border-[#3f3f46] focus:outline-none"
                      placeholder="https://..."
                      disabled={isAdded}
                    />
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-[#27272a] px-6 py-3">
                  {!isAdded && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSkip(index)}
                        className="rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-2 text-sm text-[#a1a1aa] transition-colors hover:border-[#3f3f46] hover:text-[#fafafa]"
                      >
                        Skip
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddToQueue(index)}
                        disabled={isAdding}
                        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-[#0a0a0a] transition-colors hover:bg-amber-400 disabled:opacity-50"
                      >
                        {isAdding ? "Adding..." : "Add to Queue"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State (after search with no results) */}
      {!isLoading && resources.length === 0 && topic && !error && (
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
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
              <title>No results</title>
            </svg>
          </div>
          <h3 className="font-serif text-lg">No resources found</h3>
          <p className="mt-1 text-sm text-[#71717a]">
            Try a different search term or topic.
          </p>
        </div>
      )}
    </div>
  );
}


