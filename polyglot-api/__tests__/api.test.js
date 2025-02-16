const request = require('supertest');
const { app, server } = require('../index');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function truncateTables() {
    await pool.query('ALTER TABLE Likes DISABLE TRIGGER ALL;');
    await pool.query('ALTER TABLE Replies DISABLE TRIGGER ALL;');
    await pool.query('ALTER TABLE Posts DISABLE TRIGGER ALL;');
    await pool.query('ALTER TABLE UserLanguages DISABLE TRIGGER ALL;');
    await pool.query('ALTER TABLE Users DISABLE TRIGGER ALL;');

    await pool.query('TRUNCATE TABLE Likes CASCADE;');
    await pool.query('TRUNCATE TABLE Replies CASCADE;');
    await pool.query('TRUNCATE TABLE Posts CASCADE;');
    await pool.query('TRUNCATE TABLE UserLanguages CASCADE;');
    await pool.query('TRUNCATE TABLE Users CASCADE;');

    await pool.query('ALTER TABLE Likes ENABLE TRIGGER ALL;');
    await pool.query('ALTER TABLE Replies ENABLE TRIGGER ALL;');
    await pool.query('ALTER TABLE Posts ENABLE TRIGGER ALL;');
    await pool.query('ALTER TABLE UserLanguages ENABLE TRIGGER ALL;');
    await pool.query('ALTER TABLE Users ENABLE TRIGGER ALL;');
}

// NOTE: English is manually inserted into languages table with id 1!

describe('API Endpoints', () => {
    let token;
    let userId;

    beforeAll(async () => {
        await truncateTables();
    });

    afterAll((done) => {
        server.close(done);
    });

    it('should create a new user', async () => {
        const res = await request(server)
            .post('/signup')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('id');
        userId = res.body.id;
    });

    it('should log in a user and return a token', async () => {
        const res = await request(server)
            .post('/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
    });

    it('should create a new post', async () => {
        const res = await request(server)
            .post('/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                language_id: 1,
                title: 'Test Post',
                content: 'This is a test post.',
                user_id: userId,
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('id');
    });

});