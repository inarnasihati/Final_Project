const express = require('express');
const bcrypt = require('bcrypt');
const { User, Movie, Bookmark } = require('../models');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Register user
router.post('/register', async (req, res) => {
    const { name, username, email, password, phoneNumber, address } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
            role: 'admin', // set default role
            address,
            phoneNumber
        });
        res.status(201).json({
            message: "Success creating new user",
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            address: user.address
        });
    } catch (error) {
        res.status(500).json({ error: 'Error registering user' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'unauthorized', message: 'invalid usr/pass' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'unauthorized', message: 'invalid usr/pass' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, 'your_secret_key', { expiresIn: '1h' });
        res.json({
            accessToken: token,
            name: user.name,
            role: user.role,
            id: user.id
        });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ error: 'unauthorized', message: 'invalid usr/pass' });

    jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) return res.status(403).json({ error: 'unauthorized', message: 'invalid usr/pass' });
        req.user = user;
        next();
    });
};

// Get list of movies
router.get('/movies', authenticateToken, async (req, res) => {
    try {
        const movies = await Movie.findAll();
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching movies' });
    }
});

// Add bookmark
router.post('/bookmark/:movieId', authenticateToken, async (req, res) => {
    try {
        const { movieId } = req.params;
        const userId = req.user.id;

        const existingBookmark = await Bookmark.findOne({ where: { movieId, userId } });

        if (existingBookmark) {
            return res.status(400).json({ error: 'Bookmark already exists' });
        }

        const newBookmark = await Bookmark.create({
            movieId,
            userId
        });

        const movie = await Movie.findByPk(movieId);

        res.status(201).json({
            message: 'Success adding new bookmark',
            id: newBookmark.id,
            userId: userId,
            movieId: movieId,
            movieTitle: movie.title
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

// Get user's bookmarks
router.get('/mybookmark', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const bookmarks = await Bookmark.findAll({
            where: { userId },
            include: [{ model: Movie }]
        });

        res.status(200).json(bookmarks);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

module.exports = router;