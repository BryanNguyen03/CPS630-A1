const bcrypt = require('bcrypt');
const User = require('../models/User');
const Review = require('../models/Review');
const Game = require('../models/Game');
const Message = require('../models/Message');

/* 
Handle all dummy data for initial load and testing
Create dummy users, reviews, games, and messages if they don't already exist in DB
*/

const dummyUsers = [
    { username: '123', password: '123' },
    { username: 'abc', password: 'abc' },
    { username: 'xyz', password: 'xyz' }
];

const dummyReviews = [
    { igdbId: 12345, gameName: "Minecraft", review: "Ruined my life", rating: 5 },
    { igdbId: 12345, gameName: "Minecraft", review: "Enjoyed playing proclubs; however, didn't like the minecoins", rating: 4 },
    { igdbId: 12345, gameName: "Minecraft", review: "Binge the game for a week, hiatus, always come back", rating: 3 },
    { igdbId: 69696, gameName: "FC 24", review: "Too many Sweats", rating: 5 },
    { igdbId: 69696, gameName: "FC 24", review: "Same game as last year", rating: 2 },
    { igdbId: 69696, gameName: "FC 24", review: "Can't go wrong with football", rating: 5 }
];

const dummyGames = [
    { igdbId: 69696, name: "FC 24", summary: "A great football game", coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6qqa.jpg", rating: 85, releaseDate: new Date() },
    { igdbId: 12345, name: "Minecraft", summary: "Sandbox survival game", coverUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co8fu7.jpg", rating: 90, releaseDate: new Date() }
];

const dummyMessages = [
    { from: '123', text: 'Great Reviews, great taste!', timestamp: new Date('2024-01-10T10:00:00') },
    { from: 'xyz', text: 'fellow game enjoyer', timestamp: new Date('2024-01-10T10:01:00') },
    { from: '123', text: 'Get hyped for the next FC!', timestamp: new Date('2024-01-10T10:02:00') },
    { from: 'xyz', text: 'Yup, definitely looking forward to it', timestamp: new Date('2024-01-10T10:03:00') },
    { from: '123', text: 'We should run some proclubs sometimes', timestamp: new Date('2024-01-10T10:04:00') },
    { from: 'xyz', text: 'For sure', timestamp: new Date('2024-01-10T10:05:00') },
];

async function seedUsers() {
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
                userIds.push(newUser._id);
                userNameStrings.push(newUser.username);
                console.log('User added: ' + newUser.username);
            }
        } else {
            console.log('Users already exist.');
            const users = await User.find().limit(2);
            userIds = users.map(u => u._id);
        }

        return { userIds, userNameStrings };
    } catch (err) {
        console.error('Error seeding users: ' + err.message);
        return { userIds: [], userNameStrings: [] };
    }
}

async function seedReviews(userIds, userNameStrings) {
    try {
        const reviewCount = await Review.countDocuments();

        if (reviewCount === 0 && userIds.length > 0 && userNameStrings.length > 0) {
            console.log('Adding test reviews to db ...');
            const reviews = dummyReviews.map((review, index) => ({
                ...review,
                userId: userIds[index % userIds.length],
                userName: userNameStrings[index % userNameStrings.length]
            }));

            for (const review of reviews) {
                const newReview = new Review(review);
                await newReview.save();
                console.log('Review added with id: ' + newReview._id);
            }
        } else {
            console.log('Reviews already exist, not adding test reviews.');
        }
    } catch (err) {
        console.error('Error seeding reviews: ' + err.message);
    }
}

async function seedGames() {
    try {
        const gameCount = await Game.countDocuments();

        if (gameCount === 0) {
            console.log('Adding test games to db ...');
            for (const game of dummyGames) {
                const newGame = new Game(game);
                await newGame.save();
                console.log('Game added: ' + newGame.name);
            }
        } else {
            console.log('Games already exist, not adding test games.');
        }
    } catch (err) {
        console.error('Error seeding games: ' + err.message);
    }
}

async function seedMessages() {
    try {
        const messageCount = await Message.countDocuments();

        if (messageCount === 0) {
            console.log('Adding test messages to db ...');
            const room = 'profile:123'; // messages on 123's profile page
            for (const msg of dummyMessages) {
                const newMessage = new Message({ ...msg, room });
                await newMessage.save();
                console.log(`Message added from ${newMessage.from}: "${newMessage.text}"`);
            }
        } else {
            console.log('Messages already exist, not adding test messages.');
        }
    } catch (err) {
        console.error('Error seeding messages: ' + err.message);
    }
}

// Run all seed functions in order
async function seedAll() {
    const { userIds, userNameStrings } = await seedUsers();
    await seedReviews(userIds, userNameStrings);
    await seedGames();
    await seedMessages();
}

module.exports = { seedAll };