const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const Review = require('./models/Review');
const User = require('./models/User');
const Game = require('./models/Game');
const Message = require('./models/Message');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//server port
const PORT = 8080;


//setting up CORS and Express
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});


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
const { fetchAndCacheGames, fetchAndCacheGameById } = require('./services/igdbService');

let reviews = [
    { igdbId: 12345, review:"Ruined my life",   rating: 5},
    { igdbId: 12345, review:"Enjoyed playing proclubs; however, didn't like the fifa points",   rating: 4},
    { igdbId: 69696, review:"Always rage, always come back", rating: 3},
    { igdbId: 69696, review:"Too many Sweats", rating: 5},
    { igdbId: 69696, review:"Same game as last year", rating:2},
    { igdbId: 69696, review:"Can't go wrong with Minecraft", rating:5}
];

let dummyUsers = [
    { username: '123', password: '123' },
    { username: 'abc', password: 'abc' }
];

// Test function that adds default users and reviews to the database if the database is empty
// This function also creates the database (via the first input) if it isnt already there 
async function addDummyDataToMongoDB() {
    try {
        const userCount = await User.countDocuments();
        let userIds = [];

        if (userCount === 0) {
            console.log('Adding test users to db ...');
            for (const userData of dummyUsers) {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                const newUser = new User({ ...userData, password: hashedPassword });
                await newUser.save();
                userIds.push(newUser._id);
                console.log('User added: ' + newUser.username);
            }
        } else {
            console.log('Users already exist.');
            const users = await User.find().limit(2);
            userIds = users.map(u => u._id);
        }

        const reviewCount = await Review.countDocuments();

        if (reviewCount === 0 && userIds.length > 0) {
            console.log('Adding test reviews to db ...');
            
            // Connect dummy reviews to dummy users alternating
            reviews = reviews.map((review, index) => ({
                ...review,
                userId: userIds[index % userIds.length]
            }));

            for (const review of reviews) {
                const newReview = new Review(review);
                await newReview.save();
                console.log('Review added with id: ' + newReview._id);
            }
        } else {
            console.log('Reviews already exist, Not adding test reviews.');
        }
    } catch (err) {
        console.error('Error adding test data: ' + err.message);
    }
}
addDummyDataToMongoDB();

// Initialize the Game cache from IGDB

let dummyGames = [
    { igdbId: 69696, name: "FC 24", summary: "A great football game", coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co69sm.jpg", rating: 85, releaseDate: new Date() },
    { igdbId: 12345, name: "Minecraft", summary: "Sandbox survival game", coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co69sp.jpg", rating: 90, releaseDate: new Date() }
];

async function addDummyGamesToMongoDB() {
    const gameCount = await Game.countDocuments();

    if (gameCount === 0) {
        console.log('Adding test games to db ...');
        for (const game of dummyGames) {
            const newGame = new Game(game);
            await newGame.save()
                .then(() => console.log('Game added: ' + newGame.name))
                .catch(err => console.error('Error adding test game: ' + err.message));
        }
    } else {
        console.log('Games already exist, Not adding test games.');
    }
}
addDummyGamesToMongoDB();

fetchAndCacheGames();


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


//route to search reviews based on the review ID that the user inputted (READ), READ an item
app.get('/api/items/:reviewId', async (req, res) => {
    //getting the input parameter of reviewId
    const { reviewId } = req.params;     

    //checking if input is present
    if (!reviewId) {
        return res.status(400).json({ error: "Review ID input is required" });
    }

    //if the input is valid, then trying to search the database
    try {

        //checking if the reviewId input matches any instance in the database, then returning if found
        const reviewReturn = await Review.findOne({_id: reviewId});
        if (reviewReturn){
            return res.status(200).json([reviewReturn]);  //list encapsulation due to frontend map function
        }
        //if nothing is found then return empty list
        else{
            console.log("incrorect")
            return res.status(200).json([]);
        }          

    }
    catch (err) {
        console.error('Error trying to search database for review with the following reviewId: ' + reviewId + ' ' + err);
        res.status(500).json({ error: "Failed to search review by ID" });
    }
});


//route to add a new user entered review into the database (POST), CREATE an item
app.post('/api/items', async (req, res) => {
    const newReview = req.body;

    if (newReview && newReview.igdbId !== undefined && newReview.review && newReview.rating) {
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
app.patch('/api/items/:igdbId', async (req, res) => {

    try {
        const { igdbId } = req.params;
        const { review, rating } = req.body;

        if (!review && !rating) {
            return res.status(400).json({ error: "Review text or rating required" });
        }
        const updatedReviewData = await Review.findOneAndUpdate({ igdbId: Number(igdbId) }, { review: review, rating: rating }, { new: true });
        
        
        if (updatedReviewData) {
            res.status(200).json(updatedReviewData);
        }

        if (!updatedReviewData) {
            res.status(404).json({ error: "Review not found" });
        }
    }
    catch (err) {
        console.error('Error updating review with game name ' + igdbId + ' ' + err);
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

//route to get all the games from the database (GET)
app.get('/api/games', async (req, res) => {
    try {
        const games = await Game.find();
        res.status(200).json(games);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.toString() });
    }
});

//route to get all reviews for a specific game (GET)
app.get('/api/games/:id/reviews', async (req, res) => {
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

app.get('/api/games/:id', async (req, res) => {
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








//Real time messaging routes

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, 'username');
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users', err);
        res.status(500).json({ error: 'Failed to load users' });
    }
});

app.get('/api/messages', async (req, res) => {
    const { from, to } = req.query;
    if (!from || !to) {
        return res.status(400).json({ error: 'Both from and to query values are required' });
    }

    try {
        const messages = await Message.find({
            $or: [
                { from: from, to: to },
                { from: to, to: from }
            ]
        }).sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (err) {
        console.error('Error fetching messages', err);
        res.status(500).json({ error: 'Failed to load messages' });
    }
});












// ############ user auth routes ############

//route for user registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);  //using bcrypt
        const hashedPassword = await bcrypt.hash(password, salt);

        //Creating a new user document using their username and hashed password
        const user = new User({ username, password: hashedPassword });      
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });

    //returning an error if a new user cannot be created
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
});

//route for user login
app.post('/api/login', async (req, res) => {
    try {
        //getting the user input
        const { username, password } = req.body;
        //checking if user exists in the database, if not then returning error
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        //if user is found then validating the password, by comparing the hashed input to the stored password hash in the database
        const isMatch = await bcrypt.compare(password, user.password);
        //if the password is wrong then returning an error
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        //if the password is correct then assigning the JSON web token to the user 
        //Signing it with the internal JWT secret, using the username, and unique document ID of the user
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, username: user.username });
    
    //catching any errors
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});



io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('joinRoom', ({ room }) => {
        if (room) {
            socket.join(room);
            console.log('Socket joined room:', room);
        }
    });

    socket.on('chatMessage', async (message) => {
        if (!message || !message.from || !message.to || !message.text) {
            return;
        }

        const room = [message.from, message.to].sort().join(':');
        const savedMessage = new Message({
            from: message.from,
            to: message.to,
            text: message.text,
            timestamp: message.timestamp ? new Date(message.timestamp) : new Date()
        });

        try {
            await savedMessage.save();
        } catch (err) {
            console.error('Error saving chat message:', err);
        }

        io.to(room).emit('chatMessage', {
            from: message.from,
            to: message.to,
            text: message.text,
            timestamp: savedMessage.timestamp
        });
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

console.log('__dirname: ' + __dirname);
//starting the server to listen to any events (Using server listen because it allows both express and socket.io events)
server.listen(PORT, () => { console.log("Server started on port " + PORT); });
