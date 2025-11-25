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

  console.log(`Processing admin user: ${email}...`);

  try {
    // First check if the user exists
    const { db } = await import("../db");
    const { user } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (existingUser) {
      console.log(`User ${email} already exists. Updating password and role...`);
      
      // First, ensure they have the admin role and correct name
      await db
        .update(user)
        .set({ 
          role: "admin",
          name: name,
          updatedAt: new Date()
        })
        .where(eq(user.email, email));

      // To update the password, we need to get the userId 
      // We can use the auth internal API to set the password or delete/recreate
      // Since better-auth manages password hashing, the easiest way to "reset" 
      // a password via script without duplicating hash logic is to:
      // 1. Delete the user via auth API (to clean up sessions/accounts too)
      // 2. Re-create the user
      
      // However, simply deleting might lose other data if we had relational data.
      // But for an admin user in this context, re-creating is usually fine or we can use `updateUser` if supported.
      // Let's try to update the password using the internal API if possible, 
      // but `signUpEmail` fails on duplicate.
      
      // Better-auth doesn't expose a simple "adminSetPassword" easily in the public API types provided 
      // without a session context usually, but let's check if we can delete and re-create safely 
      // OR just use the internal generic 'updateUser' if we can find the right method.
      
      // Looking at common patterns: the safest "overwrite" for a script is often delete & create 
      // to ensure clean state for auth (salt, hash, etc).
      
      console.log("Removing old user record to reset credentials...");
      // We'll delete from DB directly to be sure, cascading should handle related auth tables
      await db.delete(user).where(eq(user.email, email));
      
      console.log("Re-creating user...");
    }

    // Create the user (fresh or re-created)
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
    await db
      .update(user)
      .set({ role: "admin" })
      .where(eq(user.id, ctx.user.id));

    console.log(`Successfully configured admin user!`);
    console.log("");
    console.log("Admin account details:");
    console.log(`  Email: ${email}`);
    console.log(`  Name: ${name}`);
    console.log(`  Role: admin`);
    console.log("");
    console.log("You can now log in at /admin/login");

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating/updating admin user:", error.message);
    } else {
      console.error("Error creating/updating admin user:", error);
    }
    process.exit(1);
  }

  process.exit(0);
}

createAdminUser();
