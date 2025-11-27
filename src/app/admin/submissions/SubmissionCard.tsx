"use client";

import { useState } from "react";
import Link from "next/link";
import type { PendingSubmission, Creator, Category, Tag } from "@/db/schema";
import { rejectSubmission } from "./actions";
import { ApprovalModal } from "./ApprovalModal";
import posthog from "posthog-js";

interface SubmissionCardProps {
  submission: PendingSubmission;
  creators: Creator[];
  categories: Category[];
  tags: Tag[];
}

export function SubmissionCard({
  submission,
  creators,
  categories,
  tags,
}: SubmissionCardProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvedSlug, setApprovedSlug] = useState<string | null>(null);

  const metadata = submission.metadata as {
    discoveryTopic?: string;
    sourceAgent?: string;
    confidenceScore?: number;
    urlVerified?: boolean;
    notes?: string;
  } | null;

  const suggestedTags = (submission.suggestedTags as string[]) ?? [];

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await rejectSubmission(submission.id, rejectNotes || undefined);
      posthog.capture("submission_rejected", {
        submission_id: submission.id,
        submission_title: submission.title,
        has_notes: !!rejectNotes,
      });
    } catch (error) {
      console.error("Failed to reject submission:", error);
      setIsRejecting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const handleApproved = (resourceSlug: string) => {
    setApprovedSlug(resourceSlug);
    setShowApprovalModal(false);
    posthog.capture("submission_card_approved", {
      submission_id: submission.id,
      resource_slug: resourceSlug,
    });
  };

  // Show success state after approval
  if (approvedSlug) {
    return (
      <div className="overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/5">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-serif text-lg text-emerald-400">
                Resource Approved!
              </h3>
              <p className="text-sm text-[#a1a1aa]">{submission.title}</p>
            </div>
          </div>
          <Link
            href={`/resources/${approvedSlug}`}
            className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
            onClick={() =>
              posthog.capture("approved_resource_link_clicked", {
                resource_slug: approvedSlug,
              })
            }
          >
            View Resource
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#27272a] bg-[#18181b]/50">
      {/* Header */}
      <div className="border-b border-[#27272a] px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-lg leading-tight">
              {submission.title}
            </h3>
            <a
              href={submission.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block truncate text-sm text-amber-500 hover:text-amber-400"
            >
              {submission.url}
            </a>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-[#27272a] px-2.5 py-0.5 text-xs font-medium text-[#a1a1aa]">
              {submission.type.replace("_", " ")}
            </span>
            {submission.price && (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                {submission.price}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-4">
        {submission.description && (
          <p className="mb-4 text-sm text-[#a1a1aa] line-clamp-2">
            {submission.description}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Creator info */}
          <div>
            <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-[#71717a]">
              Creator
            </h4>
            <p className="text-sm">{submission.creatorName}</p>
            {submission.creatorUrl && (
              <a
                href={submission.creatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#71717a] hover:text-[#a1a1aa]"
              >
                {submission.creatorUrl}
              </a>
            )}
          </div>

          {/* Category */}
          <div>
            <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-[#71717a]">
              Suggested Category
            </h4>
            <p className="text-sm">{submission.suggestedCategory}</p>
          </div>
        </div>

        {/* Suggested Tags */}
        {suggestedTags.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-[#71717a]">
              Suggested Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {suggestedTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-[#27272a] px-2 py-0.5 text-xs text-[#a1a1aa]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="mt-4 rounded-lg bg-[#0a0a0a]/50 p-3">
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-[#71717a]">
              Agent Metadata
            </h4>
            <div className="space-y-1 font-mono text-xs">
              {metadata.sourceAgent && (
                <div className="flex items-center gap-2">
                  <span className="text-[#71717a]">source:</span>
                  <span className="text-[#fafafa]">{metadata.sourceAgent}</span>
                </div>
              )}
              {metadata.discoveryTopic && (
                <div className="flex items-center gap-2">
                  <span className="text-[#71717a]">topic:</span>
                  <span className="text-[#fafafa]">
                    {metadata.discoveryTopic}
                  </span>
                </div>
              )}
              {metadata.confidenceScore !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-[#71717a]">confidence:</span>
                  <span
                    className={
                      metadata.confidenceScore >= 0.8
                        ? "text-emerald-400"
                        : metadata.confidenceScore >= 0.5
                          ? "text-amber-400"
                          : "text-red-400"
                    }
                  >
                    {(metadata.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
              )}
              {metadata.urlVerified !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-[#71717a]">url verified:</span>
                  <span
                    className={
                      metadata.urlVerified ? "text-emerald-400" : "text-red-400"
                    }
                  >
                    {metadata.urlVerified ? "yes" : "no"}
                  </span>
                </div>
              )}
              {metadata.notes && (
                <div className="mt-2 border-t border-[#27272a] pt-2">
                  <span className="text-[#71717a]">notes:</span>
                  <p className="mt-1 text-[#a1a1aa]">{metadata.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#27272a] px-6 py-3">
        <span className="text-xs text-[#71717a]">
          Submitted {formatDate(submission.createdAt)}
        </span>

        <div className="flex items-center gap-2">
          {showRejectForm ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Rejection notes (optional)"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                className="rounded-lg border border-[#27272a] bg-[#0a0a0a] px-3 py-1.5 text-sm text-[#fafafa] placeholder-[#71717a] focus:border-[#3f3f46] focus:outline-none"
              />
              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                type="button"
              >
                {isRejecting ? "Rejecting..." : "Confirm"}
              </button>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectNotes("");
                }}
                className="rounded-lg border border-[#27272a] bg-[#18181b] px-3 py-1.5 text-sm text-[#a1a1aa] transition-colors hover:border-[#3f3f46]"
                type="button"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                className="rounded-lg border border-[#27272a] bg-[#18181b] px-3 py-1.5 text-sm text-[#71717a] cursor-not-allowed"
                disabled
                title="Coming soon"
                type="button"
              >
                Edit
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                className="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                type="button"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(true);
                  posthog.capture("approval_modal_opened", {
                    submission_id: submission.id,
                    submission_title: submission.title,
                  });
                }}
                className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                type="button"
              >
                Approve
              </button>
            </>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <ApprovalModal
          submission={submission}
          creators={creators}
          categories={categories}
          tags={tags}
          onClose={() => setShowApprovalModal(false)}
          onApproved={handleApproved}
        />
      )}
    </div>
  );
}


