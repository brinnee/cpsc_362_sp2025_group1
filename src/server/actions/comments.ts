import { db } from "~/server/db";
import { sql } from "drizzle-orm";
import { eq, and } from "drizzle-orm";
import { likes, users } from "~/server/db/schema";

/**
 * Gets the IDs of comments that have been liked by the currently logged in user
 * @param firebaseUid The Firebase UID of the currently logged in user
 * @returns An array of comment IDs that the user has liked
 */
export async function getLikedCommentIds(firebaseUid: string): Promise<number[]> {
  try {
    if (!firebaseUid) {
      return [];
    }

    // Get the user from the database using the Firebase UID
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid))
      .limit(1);

    if (dbUser.length === 0) {
      return [];
    }

    const userId = dbUser[0]!.id;

    // Get all comment IDs that the user has liked
    const likedComments = await db
      .select({
        replyId: likes.replyId,
      })
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.likeType, true),
          sql`${likes.replyId} IS NOT NULL`
        )
      );
    console.log(likedComments);

    // Extract and return just the comment IDs
    return likedComments
      .map(like => like.replyId)
      .filter((id): id is number => id !== null);
  } catch (error) {
    console.error("Error fetching liked comments:", error);
    return [];
  }
}

