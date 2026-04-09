import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Review from './Review';

const socketServerUrl = 'http://localhost:8080';

const UserPage = ({ currentUser, selectedUser, users, onSelectedUserChange, token, itemList = [] }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef(null);

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

  const handleUserChange = (event) => {
    const nextUsername = event.target.value;
    const nextUser = users.find((user) => user.username === nextUsername);
    if (nextUser) {
      console.log(nextUser)
      onSelectedUserChange(nextUser);                      //print value of nextUser, to see if its the userobject or id or something else
    }                                                           //this uses the props function/set usestate for the selectedUser from app.jsx
  };

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

    setNewMessage('');
  };

  return (
    <div className="page">
      <h2>User Details</h2>
      <h3>Welcome, {currentUser?.username}</h3>

      <div className="user-info">
        <label htmlFor="selected-user">
          Choose user:
          <select id="selected-user" value={selectedUser?.username || ''} onChange={handleUserChange}>
            <option value="" disabled>
              Select a user
            </option>
            {users.map((user) => (
              <option key={user.username} value={user.username}>
                {user.username}
              </option>
            ))}
          </select>
        </label>

        {selectedUser ? (
          <div>
            <p>
              <strong>Username:</strong> {selectedUser.username}
            </p>
            <div className="user-reviews" style={{ border: '1px solid #ddd', padding: '15px', marginTop: '15px' }}>
              <h4>{selectedUser.username}'s Reviews</h4>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {/* WILL NEED TO PRINT OUT BELOW AND SEE OUTPUT FOR ITEM AND SELECTED USER------------------FIRST RUN IT--------------------------- */}
                {itemList.filter(item => item.userId === selectedUser._id).map((review) => (             
                  
                  // maybe can remove the rest of this, and just keep review._id since that will be unique always
                  <Review key={review._id || review.igdbId + Math.random()} review={review} />           
                ))}

                {/* If there is no reviews by the user, then showing placeholder text indicating this*/}
                {itemList.filter(item => item.userId === selectedUser._id).length === 0 && (
                  <p>This user has no reviews.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p>No user selected yet.</p>
        )}
      </div>

      <div className="chat-box">
        <h3>Chat with {selectedUser?.username || '...'}</h3>
        {!token && <p>Please log in to send and receive chat messages.</p>}

        <div className="message-list" style={{ border: '1px solid #ccc', padding: '12px', minHeight: '180px', marginBottom: '12px' }}>
          {messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            messages.map((message, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <strong>{message.from}:</strong> {message.text}
              </div>
            ))
          )}
        </div>

        <div className="input-section">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={selectedUser ? 'Type a message...' : 'Select a user first'}
            disabled={!selectedUser || !token}
            style={{ width: '70%', marginRight: '8px' }}
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
