import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';

const socketServerUrl = 'http://localhost:8080';

function Chat({ viewedUsername, authUsername, authToken, isOwnProfile = false }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const socketRef = useRef(null);
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

    const loadReadOnlyMessages = async () => {
      try {
        const usersResponse = await fetch(`${socketServerUrl}/api/users`);
        if (!usersResponse.ok) {
          throw new Error(`Failed to load users for ${viewedUsername}`);
        }

        const users = await usersResponse.json();
        const peerUsernames = users
          .map((user) => user.username)
          .filter((username) => Boolean(username) && username !== viewedUsername);

        if (peerUsernames.length === 0) {
          setMessagesIfActive([]);
          return;
        }

        const responses = await Promise.all(
          peerUsernames.map((peerUsername) =>
            fetch(
              `${socketServerUrl}/api/messages?from=${encodeURIComponent(peerUsername)}&to=${encodeURIComponent(viewedUsername)}`
            )
          )
        );

        const payloads = await Promise.all(
          responses.map(async (response) => {
            if (!response.ok) {
              return [];
            }
            return response.json();
          })
        );

        const dedupedMessages = [];
        const seen = new Set();
        payloads.flat().forEach((message) => {
          const key =
            message._id ||
            `${message.from || ''}|${message.to || ''}|${message.timestamp || ''}|${message.text || ''}`;
          if (!seen.has(key)) {
            seen.add(key);
            dedupedMessages.push(message);
          }
        });

        dedupedMessages.sort((a, b) => {
          const aTime = new Date(a.timestamp || 0).getTime();
          const bTime = new Date(b.timestamp || 0).getTime();
          return aTime - bTime;
        });

        setMessagesIfActive(dedupedMessages);
      } catch (error) {
        console.error('Error loading read-only chat messages:', error);
        setMessagesIfActive([]);
      }
    };

    const loadMessages = async () => {
      if (!viewedUsername) {
        setMessagesIfActive([]);
        return;
      }

      if (canSendMessages) {
        try {
          const response = await fetch(
            `${socketServerUrl}/api/messages?from=${encodeURIComponent(authUsername)}&to=${encodeURIComponent(viewedUsername)}`
          );
          if (response.ok) {
            const data = await response.json();
            setMessagesIfActive(data);
          }
        } catch (error) {
          console.error('Error loading chat messages:', error);
        }
        return;
      }

      await loadReadOnlyMessages();
    };

    loadMessages();

    if (socketRef.current && canSendMessages) {
      const room = [authUsername, viewedUsername].sort().join(':');
      socketRef.current.emit('joinRoom', { room });
    }

    return () => {
      isCancelled = true;
    };
  }, [authUsername, canSendMessages, viewedUsername]);

  const sendMessage = () => {
    if (!canSendMessages || !newMessage.trim()) {
      return;
    }

    const messagePayload = {
      from: authUsername,
      to: viewedUsername,
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
      <h3>{isOwnProfile ? `My Chats with ${viewedUsername}` : `Chat with ${viewedUsername}`}</h3>
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