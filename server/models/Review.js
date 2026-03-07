const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    // using the unique mongo database ID of the user instance for the userID
    userId: {
        type: Number,
        unique: false,
        required: false,
        min: 0
    },
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