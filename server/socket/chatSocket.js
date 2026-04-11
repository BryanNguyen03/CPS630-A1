//socket.io code to allow for realtime communication in the application on user profile pages
const Message = require('../models/Message');

// Registers all Socket.io event handlers on the given `io` server instance.
function registerChatSocket(io) {
    //initializing the socket.io listener for new events (When client connects)
    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);

        //when some user joins the room, initialize the socket
        socket.on('joinRoom', ({ room }) => {
            if (room) {
                socket.join(room);
                console.log('Socket joined room:', room);
            }
        });

        //listening for chat message
        socket.on('chatMessage', async (message) => {
            //if no message, or message does not have certian parameters, then do nothing
            if (!message || !message.from || !message.room || !message.text) {
                return;
            }

            //creating a message object if properly received to then store it in the mongoDB database
            //also allows for messages to be sent to those who are not online (Displaying these is handled by the Chat.jsx component)
            const room = message.room;
            const savedMessage = new Message({
                from: message.from,
                room,
                text: message.text,
                timestamp: message.timestamp ? new Date(message.timestamp) : new Date()
            });

            try {
                await savedMessage.save();
            } catch (err) {
                console.error('Error saving chat message:', err);
            }


            //sending chat message to associated room (Where other users apart of the room/socket can view it)
            io.to(room).emit('chatMessage', {
                from: message.from,
                room,
                text: message.text,
                timestamp: savedMessage.timestamp
            });
        });

        //disconnecting the socket when client disconnects
        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
        });
    });
}

module.exports = { registerChatSocket };