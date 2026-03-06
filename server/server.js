const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const Review = require('./models/Review');


//server port
const PORT = 8080;


//setting up CORS and Express
app.use(cors());
app.use(express.json());


//Setting up environment variables for the database server init
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const host = process.env.DB_HOST
const port = process.env.DB_PORT
const name = process.env.DB_NAME
//creating the mongoose module object
const { default: mongoose } = require('mongoose');


//creating the database connection
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
    { userId:'5', gameName:'League of Legends', review:"Ruined my life",   rating: 5},
    { userId:'3', gameName:'FIFA 25', review:"Enjoyed playing proclubs; however, didn't like the fifa points",   rating: 4},
    { userId:'2', gameName:'Valorant', review:"Always rage, always come back", rating: 3},
    { userId:'4', gameName:'Fortnite', review:"Too many Sweats", rating: 5},
    { userId:'4', gameName:'Call of Duty', review:"Same game as last year", rating:2},
    { userId:'2', gameName:'Minecraft', review:"Can't go wrong with Minecraft", rating:5}
];


// Test function that adds default reviews to the database if the database is empty
// This function also creates the database (via the first input) if it isnt already there 
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


//route to get all the reviews from the database (GET), READ multiple items
app.get('/api/items', async (req, res) => {

    try {
        const data = await Review.find();
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.toString() });
    }
});


//route to add a new user entered review into the database (POST), CREATE an item
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


//route to update reviews based on the game name, user input also determines the updates (UPDATE), UPDATE an item 
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


//route to delete a review, which is determeined by the id given in the request (DELETE), DELETE an item
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
//starting the express server
app.listen(PORT, () => { console.log("Server started on port " + PORT); });
