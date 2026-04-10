const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Message = require('../models/Message');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// GET all users (username only)
router.get('/', async (req, res) => {
    try {
        const users = await User.find({}, 'username');
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users', err);
        res.status(500).json({ error: 'Failed to load users' });
    }
});

// POST register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
});

// POST login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        // Sign JWT with user id and username
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ token, username: user.username });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

// GET messages for a room
router.get('/messages', async (req, res) => {
    const { room } = req.query;

    if (!room) {
        return res.status(400).json({ error: 'room query value is required' });
    }

    try {
        const roomMessages = await Message.find({ room }).sort({ timestamp: 1 });
        return res.status(200).json(roomMessages);
    } catch (err) {
        console.error('Error fetching room messages', err);
        return res.status(500).json({ error: 'Failed to load room messages' });
    }
});

module.exports = router;