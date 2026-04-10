const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { authenticateToken } = require('../middleware/Auth');

// GET all reviews
router.get('/', async (req, res) => {
    try {
        const data = await Review.find();
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.toString() });
    }
});

// GET reviews for a specific user
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.params.userId }).sort({ _id: -1 });
        res.status(200).json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user reviews' });
    }
});

// PATCH update a review by review ID (ownership enforced)
router.patch('/review/:id', authenticateToken, async (req, res) => {
    try {
        const { review, rating } = req.body;

        if (!review && !rating) {
            return res.status(400).json({ error: "Review text or rating required" });
        }

        let updateFields = {};
        if (review) updateFields.review = review;
        if (rating) updateFields.rating = rating;

        const updatedReview = await Review.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id }, // ownership check
            updateFields,
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ error: "Review not found or unauthorized" });
        }

        res.status(200).json(updatedReview);
    } catch (err) {
        console.error('Error updating review:', err);
        res.status(500).json({ error: "Failed to update review" });
    }
});

// GET a review by review ID
router.get('/:reviewId', async (req, res) => {
    const { reviewId } = req.params;

    if (!reviewId) {
        return res.status(400).json({ error: "Review ID input is required" });
    }

    try {
        const reviewReturn = await Review.findOne({ _id: reviewId });
        if (reviewReturn) {
            return res.status(200).json([reviewReturn]); // list encapsulation for frontend map
        } else {
            return res.status(200).json([]);
        }
    } catch (err) {
        console.error('Error searching for review with id: ' + reviewId + ' ' + err);
        res.status(500).json({ error: "Failed to search review by ID" });
    }
});

// POST create a new review
router.post('/', authenticateToken, async (req, res) => {
    const { igdbId, gameName, review, rating } = req.body;

    if (igdbId === undefined || !gameName || !review || !rating) {
        return res.status(400).json({ error: "Invalid review data" });
    }

    try {
        const newReview = new Review({
            igdbId,
            gameName,
            review,
            rating,
            userId: req.user.id,        // from JWT
            userName: req.user.username  // from JWT, not using client to validate this
        });

        await newReview.save();
        console.log('Review added with id: ' + newReview._id);
        res.status(201).json(newReview);
    } catch (err) {
        console.error('Error adding review:', err);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

// PATCH update a review by igdbId
router.patch('/:igdbId', authenticateToken, async (req, res) => {
    try {
        const { igdbId } = req.params;
        const { review, rating, gameName } = req.body;

        if (!review && !rating && !gameName) {
            return res.status(400).json({ error: "Review text, rating, or game name required" });
        }

        let updateFields = {};
        if (review) updateFields.review = review;
        if (rating) updateFields.rating = rating;
        if (gameName) updateFields.gameName = gameName;

        const updatedReviewData = await Review.findOneAndUpdate(
            { igdbId: Number(igdbId) },
            updateFields,
            { new: true }
        );

        if (updatedReviewData) {
            return res.status(200).json(updatedReviewData);
        }

        res.status(404).json({ error: "Review not found" });
    } catch (err) {
        console.error('Error updating review with igdbId ' + igdbId + ' ' + err);
        res.status(500).json({ error: "Failed to update review" });
    }
});

// DELETE a review by ID (ownership enforced)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const deletedReview = await Review.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id // only delete if it belongs to the user
        });

        if (deletedReview) {
            res.status(200).json({ message: "Review deleted" });
        } else {
            res.status(404).json({ error: "Review not found or unauthorized" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to delete review" });
    }
});

module.exports = router;