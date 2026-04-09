const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    // using the unique mongo database ID of the user instance for the userID
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    userName:{       //adding a username field for ease of access when displaying reviews
        type: String,
        required: true,
        unique: false,  //not unique for reviews
        trim: true
    },
    igdbId: {
        type: Number,
        required: true,
        unique: false
    },
    gameName: {
        type: String,
        required: true,
        unique: false
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