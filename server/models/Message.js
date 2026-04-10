//model for the messages, which will be saved in the database
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  from: String,
  room: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});


const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;