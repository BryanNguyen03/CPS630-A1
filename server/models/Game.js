const mongoose = require('mongoose');

// model for games
const gameSchema = new mongoose.Schema({
  igdbId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  summary: {
    type: String
  },
  coverUrl: {
    type: String
  },
  rating: {
    type: Number
  },
  releaseDate: {
    type: Date
  }
});

module.exports = mongoose.model('Game', gameSchema);
