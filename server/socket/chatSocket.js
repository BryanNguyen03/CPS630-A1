const Message = require('../models/Message');

// Registers all Socket.io event handlers on the given `io` server instance.
function registerChatSocket(io) {
    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);

        socket.on('joinRoom', ({ room }) => {
            if (room) {
                socket.join(room);
                console.log('Socket joined room:', room);
            }
        });

        socket.on('chatMessage', async (message) => {
            if (!message || !message.from || !message.room || !message.text) {
                return;
            }

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

            io.to(room).emit('chatMessage', {
                from: message.from,
                room,
                text: message.text,
                timestamp: savedMessage.timestamp
            });
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
        });
    });
}

module.exports = { registerChatSocket };