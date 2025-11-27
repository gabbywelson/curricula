"use client";

import { useState, useEffect, useCallback } from "react";
import type { PendingSubmission, Creator, Category, Tag } from "@/db/schema";
import { approveSubmission } from "./actions";
import posthog from "posthog-js";

interface ApprovalModalProps {
  submission: PendingSubmission;
  creators: Creator[];
  categories: Category[];
  tags: Tag[];
  onClose: () => void;
  onApproved: (resourceSlug: string) => void;
}

// Map category name to slug
const categoryNameToSlug: Record<string, string> = {
  Productivity: "productivity",
  "Software Development": "software-development",
  Wellness: "wellness",
  Business: "business",
  Finance: "finance",
  Design: "design",
};

export function ApprovalModal({
  submission,
  creators,
  categories,
  tags,
  onClose,
  onApproved,
}: ApprovalModalProps) {
  // Find potential creator match
  const suggestedCreator = creators.find(
    (c) => c.name.toLowerCase() === submission.creatorName.toLowerCase()
  );

  // Resource details state
  const [title, setTitle] = useState(submission.title);
  const [description, setDescription] = useState(submission.description || "");
  const [price, setPrice] = useState(submission.price || "Unknown");
  const [imageUrl, setImageUrl] = useState(submission.imageUrl || "");

  // Creator state
  const [creatorMode, setCreatorMode] = useState<"existing" | "new">(
    suggestedCreator ? "existing" : "new"
  );
  const [selectedCreatorId, setSelectedCreatorId] = useState<number | undefined>(
    suggestedCreator?.id
  );
  const [newCreatorName, setNewCreatorName] = useState(submission.creatorName);
  const [newCreatorUrl, setNewCreatorUrl] = useState(
    submission.creatorUrl || ""
  );
  const [newCreatorBio, setNewCreatorBio] = useState("");

  // Category state - map suggestedCategory to slug
  const matchedCategorySlug =
    categoryNameToSlug[submission.suggestedCategory] || "productivity";
  const [selectedCategorySlug, setSelectedCategorySlug] =
    useState(matchedCategorySlug);

  // Tags state
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // Featured state
  const [isFeatured, setIsFeatured] = useState(false);

  // UI state
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = useCallback(async () => {
    setIsApproving(true);
    setError(null);

    const result = await approveSubmission({
      submissionId: submission.id,
      title,
      description: description || undefined,
      price,
      imageUrl: imageUrl || null,
      creatorId: creatorMode === "existing" ? selectedCreatorId : undefined,
      newCreator:
        creatorMode === "new"
          ? {
              name: newCreatorName,
              websiteUrl: newCreatorUrl || undefined,
              bio: newCreatorBio || undefined,
            }
          : undefined,
      categorySlug: selectedCategorySlug,
      tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      isFeatured,
    });

    if (result.success && result.resourceSlug) {
      posthog.capture("submission_approved", {
        submission_id: submission.id,
        submission_title: submission.title,
        resource_slug: result.resourceSlug,
        creator_mode: creatorMode,
        is_featured: isFeatured,
        tags_count: selectedTagIds.length,
      });
      onApproved(result.resourceSlug);
    } else {
      setError(result.error || "Failed to approve submission");
      setIsApproving(false);
    }
  }, [
    submission.id,
    submission.title,
    title,
    description,
    price,
    imageUrl,
    creatorMode,
    selectedCreatorId,
    newCreatorName,
    newCreatorUrl,
    newCreatorBio,
    selectedCategorySlug,
    selectedTagIds,
    isFeatured,
    onApproved,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !isApproving) {
        handleApprove();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, handleApprove, isApproving]);

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const canSubmit =
    title.trim() &&
    selectedCategorySlug &&
    (creatorMode === "existing" ? selectedCreatorId : newCreatorName.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Enter" && onClose()}
      />

      {/* Modal */}
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#27272a] bg-[#0a0a0a] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#27272a] bg-[#0a0a0a] px-6 py-4">
          <h2 className="font-serif text-xl">Approve Submission</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#71717a] transition-colors hover:bg-[#27272a] hover:text-[#fafafa]"
            type="button"
            aria-label="Close modal"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* Error display */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Resource Details Section */}
          <section>
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-[#71717a]">
              Resource Details
            </h3>
            <div className="space-y-4 rounded-lg border border-[#27272a] bg-[#18181b]/50 p-4">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-1.5 block text-sm text-[#a1a1aa]"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] placeholder-[#71717a] focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
              </div>

              {/* URL (read-only) */}
              <div>
                <label className="mb-1.5 block text-sm text-[#a1a1aa]">
                  URL
                </label>
                <div className="truncate rounded-lg border border-[#27272a] bg-[#0a0a0a]/50 px-3 py-2 text-sm text-[#71717a]">
                  {submission.url}
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm text-[#a1a1aa]"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] placeholder-[#71717a] focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="mb-1.5 block text-sm text-[#a1a1aa]"
                >
                  Price
                </label>
                <input
                  id="price"
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] placeholder-[#71717a] focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
              </div>

              {/* Image URL */}
              <div>
                <label
                  htmlFor="imageUrl"
                  className="mb-1.5 block text-sm text-[#a1a1aa]"
                >
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] placeholder-[#71717a] focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
              </div>
            </div>
          </section>

          {/* Creator Section */}
          <section>
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-[#71717a]">
              Creator
            </h3>
            <div className="space-y-4 rounded-lg border border-[#27272a] bg-[#18181b]/50 p-4">
              {/* Radio options */}
              <div className="space-y-3">
                {/* Existing creator option */}
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="creatorMode"
                    checked={creatorMode === "existing"}
                    onChange={() => setCreatorMode("existing")}
                    className="mt-1 h-4 w-4 border-[#27272a] bg-[#0a0a0a] text-amber-500 focus:ring-amber-500/50"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-[#fafafa]">
                      Use existing creator
                    </span>
                    {creatorMode === "existing" && (
                      <select
                        value={selectedCreatorId || ""}
                        onChange={(e) =>
                          setSelectedCreatorId(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        className="mt-2 w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      >
                        <option value="">Select a creator...</option>
                        {creators.map((creator) => (
                          <option key={creator.id} value={creator.id}>
                            {creator.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>

                {/* New creator option */}
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="radio"
                    name="creatorMode"
                    checked={creatorMode === "new"}
                    onChange={() => setCreatorMode("new")}
                    className="mt-1 h-4 w-4 border-[#27272a] bg-[#0a0a0a] text-amber-500 focus:ring-amber-500/50"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-[#fafafa]">
                      Create new creator
                    </span>
                    {creatorMode === "new" && (
                      <div className="mt-2 space-y-3">
                        <input
                          type="text"
                          value={newCreatorName}
                          onChange={(e) => setNewCreatorName(e.target.value)}
                          placeholder="Creator name"
                          className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] placeholder-[#71717a] focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                        />
                        <input
                          type="text"
                          value={newCreatorUrl}
                          onChange={(e) => setNewCreatorUrl(e.target.value)}
                          placeholder="Website URL (optional)"
                          className="w-full rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] placeholder-[#71717a] focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                        />
                        <textarea
                          value={newCreatorBio}
                          onChange={(e) => setNewCreatorBio(e.target.value)}
                          placeholder="Bio (optional)"
                          rows={2}
                          className="w-full resize-none rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-2 text-sm text-[#fafafa] placeholder-[#71717a] focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* Category Section */}
          <section>
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-[#71717a]">
              Category
            </h3>
            <select
              value={selectedCategorySlug}
              onChange={(e) => setSelectedCategorySlug(e.target.value)}
              className="w-full rounded-lg border border-[#27272a] bg-[#18181b]/50 px-3 py-2 text-sm text-[#fafafa] focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </section>

          {/* Tags Section */}
          {tags.length > 0 && (
            <section>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-[#71717a]">
                Tags (optional)
              </h3>
              <div className="flex flex-wrap gap-2 rounded-lg border border-[#27272a] bg-[#18181b]/50 p-4">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      selectedTagIds.includes(tag.id)
                        ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
                        : "bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Featured Section */}
          <section>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#27272a] bg-[#18181b]/50 p-4">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-[#27272a] bg-[#0a0a0a] text-amber-500 focus:ring-amber-500/50"
              />
              <div>
                <span className="text-sm text-[#fafafa]">
                  Mark as Staff Pick (Featured)
                </span>
                <p className="mt-0.5 text-xs text-[#71717a]">
                  Featured resources appear prominently on the homepage
                </p>
              </div>
            </label>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between border-t border-[#27272a] bg-[#0a0a0a] px-6 py-4">
          <span className="text-xs text-[#71717a]">
            <kbd className="rounded bg-[#27272a] px-1.5 py-0.5 font-mono text-[10px]">
              ⌘
            </kbd>{" "}
            +{" "}
            <kbd className="rounded bg-[#27272a] px-1.5 py-0.5 font-mono text-[10px]">
              Enter
            </kbd>{" "}
            to approve
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isApproving}
              className="rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-2 text-sm text-[#a1a1aa] transition-colors hover:border-[#3f3f46] hover:text-[#fafafa] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isApproving || !canSubmit}
              className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isApproving ? "Approving..." : "Approve & Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

