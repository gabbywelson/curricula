import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  creators,
  categories,
  resources,
  tags,
  resourceTags,
} from "./schema";

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log("🌱 Seeding database...");

  // Clear existing data (in reverse order of dependencies)
  console.log("Clearing existing data...");
  await db.delete(resourceTags);
  await db.delete(resources);
  await db.delete(tags);
  await db.delete(categories);
  await db.delete(creators);

  // Seed creators
  console.log("Creating creators...");
  const createdCreators = await db
    .insert(creators)
    .values([
      {
        name: "Ali Abdaal",
        slug: "ali-abdaal",
        bio: "Doctor turned YouTuber and productivity enthusiast. Sharing evidence-based tips on productivity, studying, and building a fulfilling life.",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
        websiteUrl: "https://aliabdaal.com",
        twitterUrl: "https://twitter.com/aliabdaal",
      },
      {
        name: "Cal Newport",
        slug: "cal-newport",
        bio: "Computer science professor at Georgetown and bestselling author. Writes about digital minimalism, deep work, and career success.",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
        websiteUrl: "https://calnewport.com",
        twitterUrl: "https://twitter.com/caboristhenics",
      },
      {
        name: "a16z",
        slug: "a16z",
        bio: "Andreessen Horowitz is a venture capital firm that backs bold entrepreneurs building the future through technology.",
        avatarUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop",
        websiteUrl: "https://a16z.com",
        twitterUrl: "https://twitter.com/a16z",
      },
      {
        name: "Josh Kaufman",
        slug: "josh-kaufman",
        bio: "Author of The Personal MBA and The First 20 Hours. Teaches practical business skills and rapid skill acquisition.",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
        websiteUrl: "https://joshkaufman.net",
        twitterUrl: "https://twitter.com/joshkaufman",
      },
      {
        name: "Wes Bos",
        slug: "wes-bos",
        bio: "Full-stack developer and teacher from Canada. Creates world-class courses on JavaScript, React, and modern web development.",
        avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop",
        websiteUrl: "https://wesbos.com",
        twitterUrl: "https://twitter.com/wesbos",
      },
    ])
    .returning();

  // Seed categories
  console.log("Creating categories...");
  const createdCategories = await db
    .insert(categories)
    .values([
      {
        name: "Productivity",
        slug: "productivity",
        description: "Master your time, energy, and focus. Learn systems and strategies to get more done with less stress.",
      },
      {
        name: "Software Development",
        slug: "software-development",
        description: "Learn to code, build apps, and master modern programming languages and frameworks.",
      },
      {
        name: "Wellness",
        slug: "wellness",
        description: "Physical and mental health resources for a balanced, fulfilling life.",
      },
      {
        name: "Business",
        slug: "business",
        description: "Entrepreneurship, startups, and professional growth. Build and scale your ventures.",
      },
      {
        name: "Finance",
        slug: "finance",
        description: "Personal finance, investing, and building wealth for the long term.",
      },
      {
        name: "Design",
        slug: "design",
        description: "Visual design, UX, and creative skills for the modern digital world.",
      },
    ])
    .returning();

  // Helper to find creator/category by slug
  const findCreator = (slug: string) => {
    const creator = createdCreators.find((c) => c.slug === slug);
    if (!creator) throw new Error(`Creator not found: ${slug}`);
    return creator;
  };
  const findCategory = (slug: string) => {
    const category = createdCategories.find((c) => c.slug === slug);
    if (!category) throw new Error(`Category not found: ${slug}`);
    return category;
  };;

  // Seed resources
  console.log("Creating resources...");
  const createdResources = await db
    .insert(resources)
    .values([
      {
        title: "Part-Time YouTuber Academy",
        slug: "part-time-youtuber-academy",
        description:
          "A comprehensive cohort-based course on building a successful YouTube channel while maintaining your day job. Ali teaches his exact system for scripting, filming, and growing an audience—all while working as a doctor. Perfect for busy professionals who want to start creating content.",
        url: "https://academy.aliabdaal.com",
        type: "COHORT_PROGRAM",
        price: "$4,995",
        imageUrl: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&h=600&fit=crop",
        creatorId: findCreator("ali-abdaal").id,
        categoryId: findCategory("productivity").id,
        isFeatured: true,
        metadata: { cohortDuration: "6 weeks", nextCohort: "March 2024" },
      },
      {
        title: "Deep Work",
        slug: "deep-work",
        description:
          "Cal Newport's seminal book on focused success in a distracted world. Learn why the ability to perform deep work is becoming increasingly rare—and increasingly valuable. This book will transform how you think about productivity and professional success.",
        url: "https://www.amazon.com/Deep-Work-Focused-Success-Distracted/dp/1455586692",
        type: "BOOK",
        price: "$18",
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop",
        creatorId: findCreator("cal-newport").id,
        categoryId: findCategory("productivity").id,
        isFeatured: true,
        metadata: { pages: 296, publishedYear: 2016 },
      },
      {
        title: "a16z Podcast",
        slug: "a16z-podcast",
        description:
          "The flagship podcast from Andreessen Horowitz covers tech, culture, and the future. Features conversations with founders, industry experts, and the a16z team on topics from AI to biotech to crypto. Essential listening for anyone in the startup ecosystem.",
        url: "https://a16z.com/podcasts/",
        type: "PODCAST",
        price: "Free",
        imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=600&fit=crop",
        creatorId: findCreator("a16z").id,
        categoryId: findCategory("business").id,
        isFeatured: false,
        metadata: { episodeCount: "500+", frequency: "Weekly" },
      },
      {
        title: "The Personal MBA",
        slug: "the-personal-mba",
        description:
          "Master the art of business without the massive debt. Josh Kaufman distills the essential concepts you'd learn in a top MBA program into an accessible, practical guide. Covers everything from value creation to systems thinking.",
        url: "https://personalmba.com",
        type: "BOOK",
        price: "$16",
        imageUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=600&fit=crop",
        creatorId: findCreator("josh-kaufman").id,
        categoryId: findCategory("business").id,
        isFeatured: true,
        metadata: { pages: 464, publishedYear: 2010 },
      },
      {
        title: "JavaScript30",
        slug: "javascript30",
        description:
          "Build 30 things in 30 days with vanilla JavaScript. No frameworks, no compilers, no libraries—just pure JavaScript fundamentals. Wes Bos walks you through building real projects like a drum kit, clock, and speech recognition app.",
        url: "https://javascript30.com",
        type: "COURSE",
        price: "Free",
        imageUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=600&fit=crop",
        creatorId: findCreator("wes-bos").id,
        categoryId: findCategory("software-development").id,
        isFeatured: true,
        metadata: { duration: "30 days", lessons: 30 },
      },
      {
        title: "React for Beginners",
        slug: "react-for-beginners",
        description:
          "The best way to learn React.js. A step-by-step premium video course to get you building real-world React applications. Updated for React 18 with hooks, context, and modern patterns.",
        url: "https://reactforbeginners.com",
        type: "COURSE",
        price: "$139",
        imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop",
        creatorId: findCreator("wes-bos").id,
        categoryId: findCategory("software-development").id,
        isFeatured: false,
        metadata: { duration: "8 hours", lessons: 28 },
      },
      {
        title: "Slow Productivity",
        slug: "slow-productivity",
        description:
          "Cal Newport's latest book challenges the cult of busyness. Learn to do fewer things, work at a natural pace, and obsess over quality. A manifesto for sustainable, meaningful work in the modern age.",
        url: "https://www.amazon.com/Slow-Productivity-Accomplishment-Without-Burnout/dp/0593544854",
        type: "BOOK",
        price: "$28",
        imageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop",
        creatorId: findCreator("cal-newport").id,
        categoryId: findCategory("wellness").id,
        isFeatured: false,
        metadata: { pages: 256, publishedYear: 2024 },
      },
      {
        title: "Crypto Startup School",
        slug: "crypto-startup-school",
        description:
          "A free video series from a16z covering everything founders need to know about building in crypto. From technical fundamentals to go-to-market strategies, learn directly from industry experts and successful founders.",
        url: "https://a16z.com/crypto-startup-school/",
        type: "YOUTUBE_SERIES",
        price: "Free",
        imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop",
        creatorId: findCreator("a16z").id,
        categoryId: findCategory("finance").id,
        isFeatured: false,
        metadata: { episodes: 12, totalDuration: "6 hours" },
      },
      {
        title: "The First 20 Hours",
        slug: "the-first-20-hours",
        description:
          "Josh Kaufman debunks the 10,000 hour rule and shows how to acquire new skills rapidly. Learn his systematic approach to breaking down skills, removing barriers, and practicing intelligently. You can learn anything in just 20 hours of focused effort.",
        url: "https://first20hours.com",
        type: "BOOK",
        price: "$15",
        imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop",
        creatorId: findCreator("josh-kaufman").id,
        categoryId: findCategory("productivity").id,
        isFeatured: false,
        metadata: { pages: 288, publishedYear: 2013 },
      },
      {
        title: "Productivity Masterclass",
        slug: "productivity-masterclass",
        description:
          "Ali's comprehensive course on building your personal productivity system. Covers time management, note-taking, goal-setting, and the science of habit formation. Includes templates, worksheets, and a private community.",
        url: "https://aliabdaal.com/courses/productivity/",
        type: "COURSE",
        price: "$249",
        imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop",
        creatorId: findCreator("ali-abdaal").id,
        categoryId: findCategory("productivity").id,
        isFeatured: false,
        metadata: { duration: "12 hours", lessons: 45 },
      },
    ])
    .returning();

  // Seed tags
  console.log("Creating tags...");
  const createdTags = await db
    .insert(tags)
    .values([
      { name: "Beginner Friendly", slug: "beginner-friendly" },
      { name: "Advanced", slug: "advanced" },
      { name: "Video", slug: "video" },
      { name: "Self-Paced", slug: "self-paced" },
      { name: "Community", slug: "community" },
      { name: "Certificate", slug: "certificate" },
    ])
    .returning();

  // Helper to find tag by slug
  const findTag = (slug: string) => {
    const tag = createdTags.find((t) => t.slug === slug);
    if (!tag) throw new Error(`Tag not found: ${slug}`);
    return tag;
  };
  const findResource = (slug: string) => {
    const resource = createdResources.find((r) => r.slug === slug);
    if (!resource) throw new Error(`Resource not found: ${slug}`);
    return resource;
  };

  // Seed resource-tag relationships
  console.log("Creating resource-tag relationships...");
  await db.insert(resourceTags).values([
    {
      resourceId: findResource("javascript30").id,
      tagId: findTag("beginner-friendly").id,
    },
    {
      resourceId: findResource("javascript30").id,
      tagId: findTag("video").id,
    },
    {
      resourceId: findResource("javascript30").id,
      tagId: findTag("self-paced").id,
    },
    {
      resourceId: findResource("react-for-beginners").id,
      tagId: findTag("beginner-friendly").id,
    },
    {
      resourceId: findResource("react-for-beginners").id,
      tagId: findTag("video").id,
    },
    {
      resourceId: findResource("part-time-youtuber-academy").id,
      tagId: findTag("community").id,
    },
    {
      resourceId: findResource("part-time-youtuber-academy").id,
      tagId: findTag("certificate").id,
    },
    {
      resourceId: findResource("productivity-masterclass").id,
      tagId: findTag("video").id,
    },
    {
      resourceId: findResource("productivity-masterclass").id,
      tagId: findTag("self-paced").id,
    },
  ]);

  console.log("✅ Seeding complete!");
  console.log(`   - ${createdCreators.length} creators`);
  console.log(`   - ${createdCategories.length} categories`);
  console.log(`   - ${createdResources.length} resources`);
  console.log(`   - ${createdTags.length} tags`);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});

