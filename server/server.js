const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const Review = require('./models/Review');

const PORT = 8080;

app.use(cors());
app.use(express.json());

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const host = process.env.DB_HOST
const port = process.env.DB_PORT
const name = process.env.DB_NAME
const { default: mongoose } = require('mongoose');

const dbURL = `mongodb://${host}:${port}/${name}`;
mongoose.connect(dbURL);

const db = mongoose.connection;
db.on('error', function(e) {
    console.log('error connecting');
});
db.on('open', function() {
    console.log('database connected');
});

// Create reviews if they don't already exist in the database
//simple list of reviews to demo the idea
let reviews = [
    { reviewId:'1', userId:'5', gameName:'League of Legends', review:"Ruined my life",   rating: 5},
    { reviewId:'2', userId:'3', gameName:'FIFA 25', review:"Enjoyed playing proclubs; however, didn't like the fifa points",   rating: 4},
    { reviewId:'3', userId:'2', gameName:'Valorant', review:"Always rage, always come back", rating: 3},
    { reviewId:'4', userId:'4', gameName:'Fortnite', review:"Too many Sweats", rating: 5},
    { reviewId:'5', userId:'4', gameName:'Call of Duty', review:"Same game as last year", rating:2},
    { reviewId:'6', userId:'2', gameName:'Minecraft', review:"Can't go wrong with Minecraft", rating:5}
];

async function addReviewsToMongoDB() {
    const reviewCount = await Review.countDocuments();

    if (reviewCount === 0) {
        console.log('Adding test reviews to db ...');

        reviews.forEach(review => {
            const newReview = new Review(review);
            newReview.save()
                .then(() => console.log('Review added with id: ' + newReview._id))
                .catch(err => console.error('Error adding review with id' + newReview._id + ' ' + err));
        })
    }
    else {
        console.log('Reviews already exist, Not adding test reviews.');
        return
    }

}
addReviewsToMongoDB();


app.get('/api/items', async (req, res) => {

    try {
        const data = await Review.find();
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.toString() });
    }
});

app.post('/api/items', async (req, res) => {
    const newReview = req.body;

    if (newReview && newReview.gameName && newReview.review && newReview.rating) {
        const review = new Review(newReview);

        review.save()
            .then(() => {
                console.log('Review added with id: ' + review._id);
                res.status(201).json(review);
            })
            .catch(err => {
                console.error('Error adding review with id' + review._id + ' ' + err);
                res.status(500).json({ error: 'Failed to add review' });
            });
    }
    else {
        return res.status(400).json({ error: "Invalid review data" });
    }
});


app.patch('/api/items/:gameName', async (req, res) => {

    try {
        const { gameName } = req.params;
        const { review, rating } = req.body;

        if (!review && !rating) {
            return res.status(400).json({ error: "Review text or rating required" });
        }
        const updatedReviewData = await Review.findOneAndUpdate({ gameName: gameName }, { review: review, rating: rating }, { new: true });
        
        
        if (updatedReviewData) {
            res.status(200).json(updatedReviewData);
        }

        if (!updatedReviewData) {
            res.status(404).json({ error: "Review not found" });
        }
    }
    catch (err) {
        console.error('Error updating review with game name ' + gameName + ' ' + err);
        res.status(500).json({ error: "Failed to update review" });
    }
});

app.delete('/api/items/:id', async (req, res) => {
    try {
        const reviewId = req.params.id;
        const deletedReview = await Review.findOneAndDelete({ _id: reviewId });
        if (deletedReview) {
            res.status(200).json({ message: "Review deleted successfully" });
        } else {
            res.status(404).json({ error: "Review not found" });
        }
    } catch (err) {
        console.error('Error deleting review with id ' + reviewId + ' ' + err);
        res.status(500).json({ error: "Failed to delete review" });
    }
});

console.log('__dirname: ' + __dirname);
app.listen(PORT, () => { console.log("Server started on port " + PORT); });
