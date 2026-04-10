import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';

const socketServerUrl = 'http://localhost:8080';

function Chat({ viewedUsername, authUsername, authToken, isOwnProfile = false }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const socketRef = useRef(null);
  const profileRoom = viewedUsername ? `profile:${viewedUsername}` : '';
  const canSendMessages = Boolean(viewedUsername && authToken && authUsername);

  useEffect(() => {
    if (!canSendMessages) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(socketServerUrl, {
      transports: ['websocket'],
      auth: { token: authToken }
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
  }, [canSendMessages, authToken]);

  useEffect(() => {
    let isCancelled = false;

    const setMessagesIfActive = (nextMessages) => {
      if (!isCancelled) {
        setMessages(nextMessages);
      }
    };

    const loadMessages = async () => {
      if (!profileRoom) {
        setMessagesIfActive([]);
        return;
      }

      try {
        const response = await fetch(
          `${socketServerUrl}/api/messages?room=${encodeURIComponent(profileRoom)}`
        );
        if (response.ok) {
          const data = await response.json();
          setMessagesIfActive(data);
          return;
        }
      } catch (error) {
        console.error('Error loading profile room chat messages:', error);
      }

      setMessagesIfActive([]);
    };

    loadMessages();

    if (socketRef.current && canSendMessages && profileRoom) {
      socketRef.current.emit('joinRoom', { room: profileRoom });
    }

    return () => {
      isCancelled = true;
    };
  }, [canSendMessages, profileRoom]);

  const sendMessage = () => {
    if (!canSendMessages || !newMessage.trim()) {
      return;
    }

    const messagePayload = {
      from: authUsername,
      room: profileRoom,
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    if (socketRef.current) {
      socketRef.current.emit('chatMessage', messagePayload);
    }

    setNewMessage('');
  };

  if (!viewedUsername) {
    if (!isOwnProfile) {
      return null;
    }

    return (
      <div className="chat-box" style={{ marginTop: '2rem' }}>
        <h3>My Chats</h3>
        <p className="no-items">
          Open a profile from <Link to="/community">Community</Link> to select a chat conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="chat-box" style={{ marginTop: '2rem' }}>
      <h3>{isOwnProfile ? 'My Profile Chat' : `${viewedUsername}'s Profile Chat`}</h3>
      <div
        className="message-list"
        style={{
          border: '1px solid #ccc',
          padding: '12px',
          minHeight: '300px',
          marginBottom: '12px',
          borderRadius: '8px',
          overflowY: 'auto'
        }}
      >
        {messages.length === 0 ? (
          <p className="no-items">
            {canSendMessages ? 'No messages yet.' : 'No public chat messages yet.'}
          </p>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.timestamp || index}-${message.from}-${index}`}
              style={{
                marginBottom: '8px',
                textAlign: message.from === authUsername ? 'right' : 'left'
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  backgroundColor:
                    message.from === authUsername ? '#646cff' : 'rgba(255,255,255,0.1)',
                  color: message.from === authUsername ? 'white' : 'inherit'
                }}
              >
                <strong>{message.from === authUsername ? 'You' : message.from}:</strong>{' '}
                {message.text}
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
          placeholder={canSendMessages ? 'Type a message...' : 'Log in to start chatting'}
          disabled={!canSendMessages}
        />
        <button onClick={sendMessage} disabled={!canSendMessages || !newMessage.trim()}>
          Send
        </button>
      </div>

      {!canSendMessages && (
        <p className="no-items" style={{ marginTop: '8px' }}>
          Read-only mode. <Link to="/login">Log in</Link> to send messages.
        </p>
      )}
    </div>
  );
}

export default Chat;