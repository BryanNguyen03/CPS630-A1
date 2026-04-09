import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socketServerUrl = 'http://localhost:8080';

const UserPage = ({ currentUser, selectedUser, users, onSelectedUserChange, token }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const socketRef = useRef(null);

  // Filter users based on search term (excluding the current user)
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
    user.username !== currentUser?.username
  );

  useEffect(() => {
    if (!token) {
      setMessages([]);
      return;
    }

    const socket = io(socketServerUrl, {
      transports: ['websocket'],
      auth: { token }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to chat socket', socket.id);
    });

    socket.on('chatMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!currentUser?.username || !selectedUser?.username) {
        setMessages([]);
        return;
      }

      try {
        const response = await fetch(
          `${socketServerUrl}/api/messages?from=${encodeURIComponent(currentUser.username)}&to=${encodeURIComponent(selectedUser.username)}`
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Error loading chat messages:', error);
      }
    };

    loadMessages();

    if (socketRef.current && currentUser?.username && selectedUser?.username) {
      const room = [currentUser.username, selectedUser.username].sort().join(':');
      socketRef.current.emit('joinRoom', { room });
    }
  }, [currentUser?.username, selectedUser]);

  const sendMessage = () => {
    if (!newMessage.trim() || !currentUser?.username || !selectedUser?.username) {
      return;
    }

    const messagePayload = {
      from: currentUser.username,
      to: selectedUser.username,
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    if (socketRef.current) {
      socketRef.current.emit('chatMessage', messagePayload);
    }

    //setMessages((prev) => [...prev, messagePayload]); // Optimistic update
    setNewMessage('');
  };

  return (
    <div className="page">
      <h2>User Details</h2>
      <h3>Welcome, {currentUser?.username}</h3>

      <div className="user-selection-section">
        <h3>Find a User</h3>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="search-results">
          {searchTerm && filteredUsers.length > 0 ? (
            <ul className="user-list">
              {filteredUsers.map((user) => (
                <li 
                  key={user.username} 
                  className={`user-item ${selectedUser?.username === user.username ? 'active-user' : ''}`}
                  onClick={() => {
                    onSelectedUserChange(user);
                    setSearchTerm(''); // Clear search after selection
                  }}
                >
                  {user.username}
                </li>
              ))}
            </ul>
          ) : searchTerm && (
            <p className="no-items">No users found matching "{searchTerm}"</p>
          )}
        </div>

        {selectedUser && (
          <div className="active-chat-indicator">
            <p>Chatting with: <strong>{selectedUser.username}</strong></p>
          </div>
        )}
      </div>

      <div className="chat-box" style={{ marginTop: '2rem' }}>
        <div className="message-list" style={{ border: '1px solid #ccc', padding: '12px', minHeight: '300px', marginBottom: '12px', borderRadius: '8px', overflowY: 'auto' }}>
          {messages.length === 0 ? (
            <p className="no-items">No messages yet.</p>
          ) : (
            messages.map((message, index) => (
              <div key={index} style={{ 
                marginBottom: '8px', 
                textAlign: message.from === currentUser?.username ? 'right' : 'left' 
              }}>
                <div style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  backgroundColor: message.from === currentUser?.username ? '#646cff' : 'rgba(255,255,255,0.1)',
                  color: message.from === currentUser?.username ? 'white' : 'inherit'
                }}>
                  <strong>{message.from === currentUser?.username ? 'You' : message.from}:</strong> {message.text}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="input-section">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={selectedUser ? 'Type a message...' : 'Select a user to start chatting'}
            disabled={!selectedUser || !token}
          />
          <button onClick={sendMessage} disabled={!newMessage.trim() || !selectedUser || !token}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPage;