CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    private_profile BOOLEAN
);

CREATE TABLE Languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE
);

CREATE TABLE UserLanguages (
    user_id INTEGER REFERENCES Users(id),
    language_id INTEGER REFERENCES Languages(id),
    PRIMARY KEY (user_id, language_id)
);

CREATE TABLE Posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id),
    language_id INTEGER REFERENCES Languages(id),
    title VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Replies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id),
    post_id INTEGER REFERENCES Posts(id),
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id),
    post_id INTEGER REFERENCES Posts(id),
    reply_id INTEGER REFERENCES Replies(id),
    like_type BOOLEAN,
    CONSTRAINT likes_post_or_reply CHECK ((post_id IS NOT NULL AND reply_id IS NULL) OR (post_id IS NULL AND reply_id IS NOT NULL))
);
