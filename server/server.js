const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// ── Environment & DB ──────────────────────────────────────────────────────────
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { default: mongoose } = require('mongoose');
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const name = process.env.DB_NAME;

mongoose.connect(`mongodb://${host}:${port}/${name}`);
const db = mongoose.connection;
db.on('error', () => console.log('Error connecting to database'));
db.on('open',  () => console.log('Database connected'));

// ── App & Middleware ──────────────────────────────────────────────────────────
const PORT = 8080;
const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ── Socket.io ─────────────────────────────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});
db.on('open', function() {
    console.log('database connected');
});


//getting the functionality from the game database API
const { fetchAndCacheGames, fetchAndCacheGameById } = require('./services/igdbService');


//creating test users for the site, this is before they are entered into the database
let dummyUsers = [
    { username: '123', password: '123' },
    { username: 'abc', password: 'abc' },
    { username: 'xyz', password: 'xyz' }
];


//simple list of reviews
let reviews = [                                                                                   //remove the object ID here and just use username since we dont have these IDs on a fresh run
    { igdbId: 12345, gameName: "Minecraft", review:"Ruined my life", rating: 5},
    { igdbId: 12345, gameName: "Minecraft", review:"Enjoyed playing proclubs; however, didn't like the minecoins",   rating: 4},
    { igdbId: 12345, gameName: "Minecraft", review:"Binge the game for a week, hiatus, always come back", rating: 3},
    { igdbId: 69696, gameName: "FC 24", review:"Too many Sweats", rating: 5},
    { igdbId: 69696, gameName: "FC 24", review:"Same game as last year", rating:2},
    { igdbId: 69696, gameName: "FC 24", review:"Can't go wrong with football", rating:5}

    //code to test the lazy render of reviews in GameDetailsPage.jsx
    // { igdbId: 12345, gameName: "Minecraft", review:"Ruined my life", rating: 5},
    // { igdbId: 12345, gameName: "Minecraft", review:"Enjoyed playing proclubs; however, didn't like the minecoins",   rating: 4},
    // { igdbId: 12345, gameName: "Minecraft", review:"Binge the game for a week, hiatus, always come back", rating: 3},
    // { igdbId: 12345, gameName: "Minecraft", review:"Ruined my life", rating: 5},
    // { igdbId: 12345, gameName: "Minecraft", review:"Enjoyed playing proclubs; however, didn't like the minecoins",   rating: 4},
    // { igdbId: 12345, gameName: "Minecraft", review:"Binge the game for a week, hiatus, always come back", rating: 3},
    // { igdbId: 12345, gameName: "Minecraft", review:"Ruined my life", rating: 5},
    // { igdbId: 12345, gameName: "Minecraft", review:"Enjoyed playing proclubs; however, didn't like the minecoins",   rating: 4},
    // { igdbId: 12345, gameName: "Minecraft", review:"Binge the game for a week, hiatus, always come back", rating: 3},
    // { igdbId: 12345, gameName: "Minecraft", review:"Ruined my life", rating: 5},
    // { igdbId: 12345, gameName: "Minecraft", review:"Enjoyed playing proclubs; however, didn't like the minecoins",   rating: 4},
    // { igdbId: 12345, gameName: "Minecraft", review:"Binge the game for a week, hiatus, always come back", rating: 3},
    // { igdbId: 12345, gameName: "Minecraft", review:"Ruined my life", rating: 5},
    // { igdbId: 12345, gameName: "Minecraft", review:"Enjoyed playing proclubs; however, didn't like the minecoins",   rating: 4},
    // { igdbId: 12345, gameName: "Minecraft", review:"Binge the game for a week, hiatus, always come back", rating: 3}
];                                  


// Test function that adds default users and reviews to the database if the database is empty
// This function also creates the database (via the first input) if it isnt already there 
async function addDummyDataToMongoDB() {
    try {
        const userCount = await User.countDocuments();
        let userIds = [];
        let userNameStrings = [];

        if (userCount === 0) {
            console.log('Adding test users to db ...');
            for (const userData of dummyUsers) {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                const newUser = new User({ ...userData, password: hashedPassword });
                await newUser.save();
                //saving the mongo document IDs for each user added, this is used for adding the reviews after this
                userIds.push(newUser._id);
                //saving the usernames, also to be added to the review, for ease of access to the username in the review components
                userNameStrings.push(newUser.username); 
                //console message
                console.log('User added: ' + newUser.username);
            }
        } else {
            console.log('Users already exist.');
            const users = await User.find().limit(2);
            userIds = users.map(u => u._id);
        }


        // Testing code to override review model restrictions
        // userIds = ['69d83e88b2d4b27c6972ff4f'];
        // userNameStrings = ['123'];

        //adding dummy reviews only if there is none in the DB
        const reviewCount = await Review.countDocuments();

        if (reviewCount === 0 && userIds.length > 0 && userNameStrings.length > 0) { //making sure that there is users
        // if (true){ //used to override above condition
            console.log('Adding test reviews to db ...');
            

            console.log(userNameStrings[1 % userNameStrings.length])

            //connecting the dummy reviews to alternating dummy users in the dictionary
            reviews = reviews.map((review, index) => ({
                //getting all the fields from the dummy review, then adding a mongo document userID
                ...review,
                userId: userIds[index % userIds.length],  //alternating by amount of users
                userName: userNameStrings[index % userNameStrings.length]  //alternating by amount of users
            }));

const { registerChatSocket } = require('./socket/chatSocket');
registerChatSocket(io);

// ── Routes ────────────────────────────────────────────────────────────────────
const reviewRoutes = require('./routes/reviewRoutes');
const gameRoutes   = require('./routes/gameRoutes');
const userRoutes   = require('./routes/userRoutes');

app.use('/api/items',    reviewRoutes);
app.use('/api/games',    gameRoutes);
app.use('/api/users',    userRoutes);
app.use('/api',          userRoutes); // covers /api/register, /api/login, /api/messages

// ── Seed & Cache ──────────────────────────────────────────────────────────────
const { seedAll } = require('./seed/seedData');
const { fetchAndCacheGames } = require('./services/igdbService');

seedAll();
fetchAndCacheGames();

// ── Start ─────────────────────────────────────────────────────────────────────
console.log('__dirname: ' + __dirname);
server.listen(PORT, () => console.log('Server started on port ' + PORT));