const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const Review = require('../models/Review');
const { fetchAndCacheGameById } = require('../services/igdbService');

// GET all games
router.get('/', async (req, res) => {
    try {
        const games = await Game.find();
        res.status(200).json(games);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.toString() });
    }
});

// GET all reviews for a specific game
router.get('/:id/reviews', async (req, res) => {
    try {
        const igdbId = parseInt(req.params.id, 10);
        if (Number.isNaN(igdbId)) {
            return res.status(400).json({ error: 'Invalid game id' });
        }

        const reviewsForGame = await Review.find({ igdbId }).sort({ _id: -1 });
        res.status(200).json(reviewsForGame);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.toString() });
    }
});

// GET a single game by igdbId (falls back to IGDB API if not cached)
router.get('/:id', async (req, res) => {
    try {
        let game = await Game.findOne({ igdbId: parseInt(req.params.id) });
        if (!game) {
            game = await fetchAndCacheGameById(parseInt(req.params.id));
            if (!game) {
                return res.status(404).json({ error: "Game not found" });
            }
        }
        res.status(200).json(game);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.toString() });
    }
});

module.exports = router;