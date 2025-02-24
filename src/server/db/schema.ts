import { pgTableCreator, serial, varchar, text, timestamp, boolean, integer, primaryKey, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const createTable = pgTableCreator((name) => `${name}`);

export const users = createTable('Users', {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 255 }).unique(),
    email: varchar('email', { length: 255 }).unique(),
    password: varchar('password', { length: 255 }),
    privateProfile: boolean('private_profile'),
});

export const languages = createTable('Languages', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).unique(),
});

export const userLanguages = createTable('UserLanguages', {
    userId: integer('user_id').references(() => users.id),
    languageId: integer('language_id').references(() => languages.id),
},
(table) => {
    return {
        pk: primaryKey({ columns: [table.userId, table.languageId] }),
    }
}
);

export const posts = createTable('Posts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    languageId: integer('language_id').references(() => languages.id),
    title: varchar('title', { length: 255 }),
    content: text('content'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const replies = createTable('Replies', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    postId: integer('post_id').references(() => posts.id),
    content: text('content'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const likes = createTable('Likes', {
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
