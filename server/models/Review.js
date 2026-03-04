const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    gameName: {
        type: String,
        unique: true,
        required: true
    },
    review: {
        type: String,
        unique: false,
        required: true
    },
    rating: {
        type: Number,
        unique: false,
        required: true,
        min: 1,
        max: 5
    }
});

const Review = mongoose.model('review', ReviewSchema)
module.exports = Review;