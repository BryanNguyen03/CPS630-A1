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