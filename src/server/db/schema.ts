import { pgTableCreator, serial, varchar, text, timestamp, boolean, integer, primaryKey, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const createTable = pgTableCreator((name) => `${name}`);

export const users = createTable('users', {
    id: serial('id').primaryKey(),
    firebaseUid: varchar('firebase_uid', { length: 255 }).unique(),
    username: varchar('username', { length: 255 }).unique(),
});

export const languages = createTable('languages', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).unique(),
});

export const userLanguages = createTable('user_languages', {
    userId: integer('user_id').references(() => users.id),
    languageId: integer('language_id').references(() => languages.id),
},
(table) => {
    return {
        pk: primaryKey({ columns: [table.userId, table.languageId] }),
    }
}
);

export const posts = createTable('posts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    languageId: integer('language_id').references(() => languages.id),
    title: varchar('title', { length: 255 }),
    content: text('content'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const replies = createTable('replies', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    postId: integer('post_id').references(() => posts.id),
    content: text('content'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const likes = createTable('likes', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    postId: integer('post_id').references(() => posts.id),
    replyId: integer('reply_id').references(() => replies.id),
    likeType: boolean('like_type'),
}, () => {
    return {
        likes_post_or_reply: check('likes_post_or_reply', sql`("post_id" IS NOT NULL AND "reply_id" IS NULL) OR ("post_id" IS NULL AND "reply_id" IS NOT NULL)`)
    };
});
