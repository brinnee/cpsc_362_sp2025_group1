const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const server = app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Signup
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password, private_profile) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, email, hashedPassword, false]
        );
        res.json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Create Post
app.post('/posts', authenticateToken, async (req, res) => {
    try {
        const { language_id, title, content } = req.body;
        const newPost = await pool.query(
            'INSERT INTO posts (user_id, language_id, title, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.userId, language_id, title, content]
        );
        res.json(newPost.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// Get Posts by Language
app.get('/posts/:languageId', async (req, res) => {
    try {
        const { languageId } = req.params;
        const posts = await pool.query('SELECT * FROM posts WHERE language_id = $1', [languageId]);
        res.json(posts.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

// Create Reply
app.post('/replies', authenticateToken, async (req, res) => {
    try {
        const { post_id, content } = req.body;
        const newReply = await pool.query(
            'INSERT INTO replies (user_id, post_id, content) VALUES ($1, $2, $3) RETURNING *',
            [req.user.userId, post_id, content]
        );
        res.json(newReply.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});
//Get replies by post ID.
app.get('/replies/:postId', async (req, res)=>{
    try{
        const {postId} = req.params;
        const replies = await pool.query('SELECT * FROM replies WHERE post_id = $1', [postId]);
        res.json(replies.rows);
    }catch(err){
        console.error(err.message);
        res.status(500).json({error: err.message})
    }
});

// Create Like/Dislike
app.post('/likes', authenticateToken, async (req, res) => {
    try {
        const { post_id, reply_id, like_type } = req.body;
        const newLike = await pool.query(
            'INSERT INTO likes (user_id, post_id, reply_id, like_type) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.userId, post_id, reply_id, like_type]
        );
        res.json(newLike.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = { app, server };