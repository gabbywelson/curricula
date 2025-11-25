/**
 * Script to create an admin user for the Curricula admin panel.
 *
 * Usage:
 *   npx tsx src/db/create-admin.ts
 *
 * Environment variables:
 *   ADMIN_EMAIL - Email for the admin account
 *   ADMIN_PASSWORD - Password for the admin account
 *   ADMIN_NAME - Name for the admin account (optional, defaults to "Admin")
 *
 * Example:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=securepassword npx tsx src/db/create-admin.ts
 */

import "dotenv/config";
import { env } from "../env";
import { auth } from "../lib/auth";

async function createAdminUser() {
  const email = env.ADMIN_EMAIL;
  const password = env.ADMIN_PASSWORD;
  const name = env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error(
      "Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required."
    );
    console.error("");
    console.error("Usage:");
    console.error(
      "  ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpassword npx tsx src/db/create-admin.ts"
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Error: Password must be at least 8 characters long.");
    process.exit(1);
  }

  console.log(`Creating admin user: ${email}...`);

  try {
    // Use Better Auth's internal API to create the user
    const ctx = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!ctx?.user) {
      throw new Error("Failed to create user - no user returned");
    }

    console.log(`User created with ID: ${ctx.user.id}`);

    // Update the user's role to admin directly in the database
    // We need to use the raw database connection for this
    const { db } = await import("../db");
    const { user } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    await db
      .update(user)
      .set({ role: "admin" })
      .where(eq(user.id, ctx.user.id));

    console.log(`Successfully created admin user!`);
    console.log("");
    console.log("Admin account details:");
    console.log(`  Email: ${email}`);
    console.log(`  Name: ${name}`);
    console.log(`  Role: admin`);
    console.log("");
    console.log("You can now log in at /admin/login");
  } catch (error) {
    if (error instanceof Error) {
      // Check for duplicate email error
      if (
        error.message.includes("duplicate") ||
        error.message.includes("already exists") ||
        error.message.includes("UNIQUE")
      ) {
        console.error(`Error: A user with email "${email}" already exists.`);
        console.error("");
        console.error("If you need to reset the admin password, you can:");
        console.error(
          "1. Delete the user from the database and run this script again"
        );
        console.error("2. Or update the password directly in the database");
      } else {
        console.error("Error creating admin user:", error.message);
      }
    } else {
      console.error("Error creating admin user:", error);
    }
    process.exit(1);
  }

  process.exit(0);
}

createAdminUser();
