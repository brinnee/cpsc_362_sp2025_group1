"use server";

import { db } from "~/server/db"
import { desc, sql } from "drizzle-orm"
import { languages, posts, users, likes, replies } from "~/server/db/schema"

export async function getLanguages() {
  return await db
    .select({
      value: languages.name,
      label: sql<string>`initcap(${languages.name})`,
    })
    .from(languages)
    .orderBy(languages.name)
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
    .orderBy(desc(posts.createdAt))

  if (languageFilter) {
    query.where(sql`LOWER(${languages.name}) = LOWER(${languageFilter})`)
  }

  return await query
}