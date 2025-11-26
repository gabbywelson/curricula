CREATE TYPE "public"."submission_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "pending_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"type" "resource_type" NOT NULL,
	"price" text DEFAULT 'Unknown',
	"image_url" text,
	"creator_name" text NOT NULL,
	"creator_url" text,
	"suggested_category" text NOT NULL,
	"suggested_tags" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb,
	"status" "submission_status" DEFAULT 'pending' NOT NULL,
	"review_notes" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
