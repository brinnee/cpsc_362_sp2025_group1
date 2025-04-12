"use server";

import { db } from "~/server/db";
import { desc, sql, eq, and } from "drizzle-orm";
import { languages, posts, users, likes, replies } from "~/server/db/schema";

export async function getLanguages() {
  return await db
    .select({
      value: languages.name,
      label: sql<string>`initcap(${languages.name})`,
    })
    .from(languages)
    .orderBy(languages.name);
}

export async function getPostById(postId: string | undefined) {
  if (!postId) return null;
  
  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      language: languages.name,
      votes: sql<number>`(
        SELECT COUNT(*) 
        FROM ${likes} 
        WHERE post_id = ${posts.id} AND like_type = true
      ) - (
        SELECT COUNT(*) 
        FROM ${likes} 
        WHERE post_id = ${posts.id} AND like_type = false
      )`,
      comments: sql<number>`(
        SELECT COUNT(*) 
        FROM ${replies} 
        WHERE post_id = ${posts.id}
      )`,
      author: users.username,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .innerJoin(languages, sql`${languages.id} = ${posts.languageId}`)
    .innerJoin(users, sql`${users.id} = ${posts.userId}`)
    .where(sql`${posts.id} = ${postId}`)
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getPostComments(postId: string) {
  if (!postId) return [];
  
  const result = await db
    .select({
      id: replies.id,
      postId: replies.postId,
      content: replies.content,
      author: users.username,
      votes: sql<number>`(
        SELECT COUNT(*) 
        FROM ${likes} 
        WHERE reply_id = ${replies.id} AND like_type = true
      ) - (
        SELECT COUNT(*) 
        FROM ${likes} 
        WHERE reply_id = ${replies.id} AND like_type = false
      )`,
      createdAt: replies.createdAt,
    })
    .from(replies)
    .innerJoin(users, sql`${users.id} = ${replies.userId}`)
    .where(sql`${replies.postId} = ${postId}`)
    .orderBy(desc(replies.createdAt));
  
  return result;
}

export async function getPosts(languageFilter?: string) {
  const query = db
    .select({
      id: posts.id,
      title: posts.title,
      language: languages.name,
      votes: sql<number>`(
        SELECT COUNT(*) 
        FROM ${likes} 
        WHERE post_id = ${posts.id} AND like_type = true
      ) - (
        SELECT COUNT(*) 
        FROM ${likes} 
        WHERE post_id = ${posts.id} AND like_type = false
      )`,
      comments: sql<number>`(
        SELECT COUNT(*) 
        FROM ${replies} 
        WHERE post_id = ${posts.id}
      )`,
      author: users.username,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .innerJoin(languages, sql`${languages.id} = ${posts.languageId}`)
    .innerJoin(users, sql`${users.id} = ${posts.userId}`)
    .orderBy(desc(posts.createdAt));

  if (languageFilter) {
    query.where(sql`LOWER(${languages.name}) = LOWER(${languageFilter})`);
  }

  return await query;
}

export async function createPost(params: {
  title: string;
  content: string;
  languageName: string;
  firebaseUid?: string; // Optional, will be used from the client
}) {
  try {
    if (!params.title || !params.content || !params.languageName) {
      throw new Error("Missing required fields");
    }

    if (!params.firebaseUid) {
      throw new Error("You must be logged in to create a post");
    }

    // Get the user from the database using the Firebase UID
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, params.firebaseUid))
      .limit(1);

    if (dbUser.length === 0) {
      throw new Error("User not found");
    }

    // Get the language ID
    const language = await db
      .select()
      .from(languages)
      .where(eq(languages.name, params.languageName))
      .limit(1);

    if (language.length === 0) {
      throw new Error("Invalid language");
    }

    // Create the post
    const result = await db.insert(posts).values({
      userId: dbUser[0]!.id,
      languageId: language[0]!.id,
      title: params.title,
      content: params.content,
    }).returning();

    return result[0];
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

export async function createReply(params: {
  postId: string;
  content: string;
  firebaseUid?: string; // Optional, will be used from the client
}) {
  try {
    if (!params.postId || !params.content) {
      throw new Error("Missing required fields");
    }

    if (!params.firebaseUid) {
      throw new Error("You must be logged in to reply to a post");
    }

    // Get the user from the database using the Firebase UID
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, params.firebaseUid))
      .limit(1);

    if (dbUser.length === 0) {
      throw new Error("User not found");
    }

    // Check if the post exists
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, parseInt(params.postId)))
      .limit(1);

    if (post.length === 0) {
      throw new Error("Post not found");
    }

    // Create the reply
    const result = await db.insert(replies).values({
      userId: dbUser[0]!.id,
      postId: parseInt(params.postId),
      content: params.content,
    }).returning();

    return result[0];
  } catch (error) {
    console.error("Error creating reply:", error);
    throw error;
  }
}

export async function likePost(params: {
  postId: string;
  likeType: boolean; // true for like, false for dislike
  firebaseUid?: string;
}) {
  try {
    if (!params.postId) {
      throw new Error("Missing post ID");
    }

    if (!params.firebaseUid) {
      throw new Error("You must be logged in to like/dislike a post");
    }

    // Get the user from the database using the Firebase UID
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, params.firebaseUid))
      .limit(1);

    if (dbUser.length === 0) {
      throw new Error("User not found");
    }

    const userId = dbUser[0]!.id;
    const postId = parseInt(params.postId);

    // Check if the user has already liked/disliked this post
    const existingLike = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.postId, postId),
          sql`${likes.replyId} IS NULL`
        )
      )
      .limit(1);

    if (existingLike.length > 0) {
      // User has already liked/disliked this post
      if (existingLike[0]!.likeType === params.likeType) {
        // User is clicking the same button again, remove the like/dislike
        await db
          .delete(likes)
          .where(eq(likes.id, existingLike[0]!.id));
      } else {
        // User is changing from like to dislike or vice versa
        await db
          .update(likes)
          .set({ likeType: params.likeType })
          .where(eq(likes.id, existingLike[0]!.id));
      }
    } else {
      // User has not liked/disliked this post yet
      await db.insert(likes).values({
        userId,
        postId,
        replyId: null,
        likeType: params.likeType,
      });
    }

    // Return the updated vote count
    const updatedPost = await getPostById(params.postId);
    return updatedPost?.votes ?? 0;
  } catch (error) {
    console.error("Error liking/disliking post:", error);
    throw error;
  }
}

export async function getUserPostLikeStatus(params: {
  postId: string;
  firebaseUid?: string;
}) {
  try {
    if (!params.postId || !params.firebaseUid) {
      return null;
    }

    // Get the user from the database using the Firebase UID
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, params.firebaseUid))
      .limit(1);

    if (dbUser.length === 0) {
      return null;
    }

    const userId = dbUser[0]!.id;
    const postId = parseInt(params.postId);

    // Check if the user has already liked/disliked this post
    const existingLike = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.postId, postId),
          sql`${likes.replyId} IS NULL`
        )
      )
      .limit(1);

    if (existingLike.length > 0) {
      return existingLike[0]!.likeType;
    }

    return null;
  } catch (error) {
    console.error("Error getting user post like status:", error);
    return null;
  }
}

export async function searchPostsByTitle(query: string) {
  if (!query) return [];
  
  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      language: languages.name,
      votes: sql<number>`(
        SELECT COUNT(*) 
        FROM ${likes} 
        WHERE post_id = ${posts.id} AND like_type = true
      ) - (
        SELECT COUNT(*) 
        FROM ${likes} 
        WHERE post_id = ${posts.id} AND like_type = false
      )`,
      comments: sql<number>`(
        SELECT COUNT(*) 
        FROM ${replies} 
        WHERE post_id = ${posts.id}
      )`,
      author: users.username,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .innerJoin(languages, sql`${languages.id} = ${posts.languageId}`)
    .innerJoin(users, sql`${users.id} = ${posts.userId}`)
    .where(sql`LOWER(${posts.title}) LIKE LOWER(${'%' + query + '%'})`)
    .orderBy(desc(posts.createdAt))
    .limit(5);
  
  return result;
}
