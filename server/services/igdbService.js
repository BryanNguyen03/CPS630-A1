const Game = require('../models/Game');

// Service functions to interact with IGDB API and cache results in MongoDB

// Fetch Twitch access token
async function getTwitchAccessToken() {
    const clientId = process.env.IGDB_CLIENT_ID;
    const clientSecret = process.env.IGDB_CLIENT_SECRET;

    const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, {
        method: 'POST'
    });

    if (!response.ok) {
        throw new Error('Failed to fetch Twitch access token');
    }

    const data = await response.json();
    return data.access_token;
}

// Fetch games from IGDB and cahce in MongoDB if not already cached
async function fetchAndCacheGames() {
    try {
        const gameCount = await Game.countDocuments();
        if (gameCount > 0) {
            console.log(`Games already cached (${gameCount} games). Skipping IGDB fetch.`);
            return;
        }

        console.log('Database empty: Fetching top games from IGDB and caching...');
        
        const token = await getTwitchAccessToken();
        const clientId = process.env.IGDB_CLIENT_ID;

        // Fetch top rated/popular games from IGDB to seed the database
        // You can adjust the query as needed. Fetching 100 for a healthy base.
        const query = `
            fields id, name, summary, cover.url, rating, first_release_date;
            sort rating desc;
            where rating != null & cover != null;
            limit 100;
        `;

        const response = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'text/plain'
            },
            body: query
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch from IGDB: ${response.statusText}`);
        }

        const igdbGames = await response.json();

        // Map IGDB game data to our game model format and then insert
        const gamesToInsert = igdbGames.map(game => ({
            igdbId: game.id,
            name: game.name,
            summary: game.summary,
            coverUrl: game.cover?.url ? game.cover.url.replace('t_thumb', 't_cover_big') : null,
            rating: game.rating,
            releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000) : null
        }));

        await Game.insertMany(gamesToInsert);
        console.log(`Successfully cached ${gamesToInsert.length} games from IGDB in MongoDB`);

    } catch (error) {
        console.error('Error fetching and caching games from IGDB:', error);
    }
}

// Fetch a single game by igdbId from IGDB and cache in MongoDB (if not already cached)
async function fetchAndCacheGameById(igdbId) {
    try {
        const token = await getTwitchAccessToken();
        const clientId = process.env.IGDB_CLIENT_ID;

        const query = `
            fields id, name, summary, cover.url, rating, first_release_date;
            where id = ${igdbId};
        `;

        const response = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'text/plain'
            },
            body: query
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch from IGDB: ${response.statusText}`);
        }

        const igdbGames = await response.json();
        
        if (igdbGames.length === 0) {
            return null; // Game not found on IGDB
        }

        // Map IGDB game data to our game model format and insert into mongo
        const game = igdbGames[0];
        const newGame = new Game({
            igdbId: game.id,
            name: game.name,
            summary: game.summary,
            coverUrl: game.cover?.url ? game.cover.url.replace('t_thumb', 't_cover_big') : null,
            rating: game.rating,
            releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000) : null
        });

        await newGame.save();
        return newGame;

    } catch (error) {
        console.error(`Error fetching and caching game ${igdbId} from IGDB:`, error);
        return null;
    }
}

module.exports = {
    fetchAndCacheGames,
    fetchAndCacheGameById
};
