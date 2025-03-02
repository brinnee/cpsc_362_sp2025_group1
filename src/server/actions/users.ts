"use server";

import { db } from "~/server/db";
import { users, posts, userLanguages, likes } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import type { Post, Language } from "~/lib/types";
import { getLanguagesByIds } from "./languages";

type CreateUserParams = {
  firebaseUid: string;
  email: string;
  username: string;
};

export async function createUser(params: CreateUserParams) {
  try {
    // Check if user with this firebaseUid already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, params.firebaseUid))
      .limit(1);

    if (existingUser.length > 0) {
      // User already exists, no need to create
      return existingUser[0];
    }

    // Check if username is already taken
    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, params.username))
      .limit(1);

    if (existingUsername.length > 0) {
      throw new Error("Username already taken");
    }

    // Insert the new user
    const result = await db.insert(users).values({
      firebaseUid: params.firebaseUid,
      username: params.username,
    }).returning();

    return result[0];
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function getUserByFirebaseUid(firebaseUid: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error getting user by Firebase UID:", error);
    throw error;
  }
}

export async function getUserByUsername(username: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error getting user by username:", error);
    throw error;
  }
}

/**
 * Get user profile information
 */
export async function getUserProfile(firebaseUid: string) {
  try {
    // Get user from database
    const dbUser = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    
    if (!dbUser || dbUser.length === 0) {
      throw new Error("User not found");
    }
    
    const userId = dbUser[0]?.id;
    
    if (!userId) {
      throw new Error("Invalid user ID");
    }
    
    // Count user's posts
    const userPosts = await db.select().from(posts).where(eq(posts.userId, userId));
    
    return {
      id: userId,
      username: dbUser[0]?.username ?? "Anonymous",
      postCount: userPosts.length,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

/**
 * Get posts liked by the user
 */
export async function getUserLikedPosts(firebaseUid: string): Promise<Post[]> {
  try {
    // Get user from database
    const dbUser = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    
    if (!dbUser || dbUser.length === 0) {
      throw new Error("User not found");
    }
    
    const userId = dbUser[0]?.id;
    
    if (!userId) {
      throw new Error("Invalid user ID");
    }
    
    // Get posts liked by the user
    const likedPostsQuery = await db
      .select({
        postId: likes.postId,
      })
      .from(likes)
      .where(and(
        eq(likes.userId, userId),
        eq(likes.likeType, true) // true for upvote
      ));
    
    if (likedPostsQuery.length === 0) {
      return [];
    }
    
    // Get the actual post data
    const likedPostIds = likedPostsQuery.map(vote => vote.postId).filter(Boolean) as number[];
    
    // For demo purposes, we'll create some mock posts
    // In a real app, you would fetch the actual posts from the database
    const mockPosts: Post[] = likedPostIds.map((id, index) => ({
      id,
      title: `Sample Post ${index + 1}`,
      content: "This is a sample post content...",
      language: "JavaScript",
      author: "John Doe",
      votes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 20),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
    }));
    
    return mockPosts;
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    return [];
  }
}

/**
 * Get languages followed by the user
 */
export async function getUserFollowedLanguages(firebaseUid: string): Promise<Language[]> {
  try {
    // Get user from database
    const dbUser = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    
    if (!dbUser || dbUser.length === 0) {
      throw new Error("User not found");
    }
    
    const userId = dbUser[0]?.id;
    
    if (!userId) {
      throw new Error("Invalid user ID");
    }
    
    // Get languages followed by the user
    const followedLanguagesQuery = await db
      .select({
        languageId: userLanguages.languageId,
      })
      .from(userLanguages)
      .where(eq(userLanguages.userId, userId));
    
    console.log(followedLanguagesQuery);
    if (followedLanguagesQuery.length === 0) {
      return [];
    } else {
      return await getLanguagesByIds(followedLanguagesQuery);
    }
  } catch (error) {
    console.error("Error fetching followed languages:", error);
    return [];
  }
} 