# CPS630-A3
# ReviewLog

## Overview
This web application is a full-stack video game review platform. Users can browse a catalog of games sourced from the IGDB API, post and manage reviews, discover other users in the community, and chat in real time on profile pages. It supports full CRUD operations on reviews, JWT-based authentication, and real-time messaging via Socket.io, all backed by a MongoDB database.

## Reflection
This assignment was a great learning experience for us: we connected the MongoDB database to the Express server, created a Mongoose schema for our reviews, and implemented API endpoints to perform CRUD operations. We created a .env file and used the `dotenv` package to store database connection information.

We faced some challenges with version control early on in the process, however we were able to quickly streamline our communication and development practices to work effectively. We were able to apply our differing web development skillsets effectively as well as share best practices with one another.

Beyond the core CRUD functionality, we expanded the app into a full-featured video game review platform called ReviewLog. The frontend is a React 19 single-page app built with Vite and styled with Tailwind CSS v4 using a custom dark theme. On the backend, we extended the Express server with JWT-based authentication using bcrypt for password hashing, and added real-time per-profile chat rooms using Socket.io with message history persisted in MongoDB.

We also integrated the IGDB (Internet Game Database) API through Twitch OAuth to fetch real game data like titles, summaries, cover art, and release dates. The games catalog supports search and uses Intersection Observer for lazy loading. Each game has its own detail page where logged-in users can post a review, and we added sort and filter controls so users can browse reviews by rating. On the user side, we built profile pages with full review management (create, update, delete) and a community page for discovering other users.

One thing we were happy with was how we handled the Review component. Instead of building separate review cards for different pages, we added a `linkMode` prop that controls where the review links to depending on context. On a user profile it links to the game, and on a game page it links to the reviewer's profile. It kept things simple and reusable.

Getting the IGDB integration to play nicely with our seed data was tricky. Both the seed script and the IGDB fetch check whether data already exists before running, so if the seed inserted dummy games first, the IGDB fetch would skip entirely. We had to pay attention to that ordering when testing with fresh databases.

Setting up Socket.io alongside the REST API on the same Express server also took some troubleshooting, especially around CORS configuration to match the Vite dev server. Getting room-based messaging with persistent chat history working reliably required going back and forth between the client and server code a few times.

Tailwind CSS v4 was new to most of us. It uses a CSS-first configuration approach with `@theme` and `@layer` directly in the stylesheet instead of the traditional config file, which was cleaner but meant we could not rely on most of the existing tutorials and examples out there. Once we got the hang of it though, it made managing our design tokens and component styles a lot more straightforward.

Overall we are proud of what we built. The app ties together authentication, an external API, real-time chat, and a clean UI across React Router, Express, MongoDB, and Socket.io, and we all came away from it with a much stronger understanding of full-stack development.


# Documentation

## Prerequisites
- git or use the zip
- Node.js (v22 or later)
- MongoDB instance (configured via `.env`)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/BryanNguyen03/CPS630-A1.git
cd CPS630-A1
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with your MongoDB connection details and API keys:

```
DB_HOST=localhost
DB_PORT=27017
DB_NAME=cps630
JWT_SECRET=your_jwt_secret
IGDB_CLIENT_ID=your_twitch_client_id
IGDB_CLIENT_SECRET=your_twitch_client_secret
```


### 3. Make Sure the MongoDB Database/Service is Running in the Background

This will be dependent per OS and or installation method of MongoDB

### 4. Install Server Dependencies

```bash
cd server
npm install
```

### 5. Install Client Dependencies

```bash
cd ../client
npm install
```

## Running the Application

### Start the Server

In the `server` directory:

```bash
node server.js
```

The server will run on **http://localhost:8080**. On first launch, it seeds the database with sample data (users, reviews, games, messages) if it is empty, and fetches games from IGDB if no games are cached.

### Start the Client

In the `client` directory:

```bash
npm run dev
```

The client will run on **http://localhost:5173**

## API Endpoints

### Reviews (`/api/items`)
- `GET /api/items` — Retrieve all reviews
- `GET /api/items/:reviewId` — Retrieve a single review by ID
- `GET /api/items/user/:userId` — Retrieve reviews for a specific user (JWT required)
- `POST /api/items` — Create a new review (JWT required)
- `PATCH /api/items/review/:id` — Update a review by ID (JWT required, must be owner)
- `DELETE /api/items/:id` — Delete a review by ID (JWT required, must be owner)

### Games (`/api/games`)
- `GET /api/games` — Retrieve all cached games
- `GET /api/games/:id` — Retrieve a single game by IGDB ID (fetches from IGDB if not cached)
- `GET /api/games/:id/reviews` — Retrieve all reviews for a specific game

### Users & Auth
- `GET /api/users` — Retrieve all usernames
- `POST /api/register` — Register a new user
- `POST /api/login` — Log in and receive a JWT

### Messages
- `GET /api/messages?room=` — Retrieve chat history for a room

### Real-Time (Socket.io)
- `joinRoom` — Join a profile chat room
- `chatMessage` — Send a message (persisted and broadcast)

## Schemas

### Review
- `userId` — ObjectId (ref: User, optional)
- `userName` — String
- `igdbId` — Number
- `gameName` — String (required)
- `review` — String (required)
- `rating` — Number (required, 1–5)

### Game
- `igdbId` — Number (unique)
- `name` — String
- `summary` — String
- `coverUrl` — String
- `rating` — Number
- `releaseDate` — Date

### User
- `username` — String (unique)
- `password` — String (hashed)

### Message
- `from` — String
- `room` — String
- `text` — String
- `timestamp` — Date
