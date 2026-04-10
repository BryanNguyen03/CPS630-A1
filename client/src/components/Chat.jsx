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
      <div className="panel mt-8 space-y-2">
        <h3 className="text-xl">My Chats</h3>
        <p className="empty-state">
          Open a profile from <Link to="/community">Community</Link> to select a chat conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="panel mt-8 space-y-3">
      <h3 className="text-xl">{isOwnProfile ? 'My Profile Chat' : `${viewedUsername}'s Profile Chat`}</h3>

      <div className="max-h-80 min-h-72 overflow-y-auto rounded-xl border border-edge bg-bg-800/55 p-3">
        {messages.length === 0 ? (
          <p className="empty-state">
            {canSendMessages ? 'No messages yet.' : 'No public chat messages yet.'}
          </p>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.timestamp || index}-${message.from}-${index}`}
              className={`mb-2 flex ${message.from === authUsername ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={[
                  'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                  message.from === authUsername
                    ? 'bg-brand-500 text-white'
                    : 'border border-edge bg-bg-700/75 text-text-primary'
                ].join(' ')}
              >
                <strong>{message.from === authUsername ? 'You' : message.from}:</strong>{' '}
                {message.text}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <input
          type="text"
          className="input-field"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={canSendMessages ? 'Type a message...' : 'Log in to start chatting'}
          disabled={!canSendMessages}
        />
        <button className="btn-primary md:w-auto" onClick={sendMessage} disabled={!canSendMessages || !newMessage.trim()}>
          Send
        </button>
      </div>

      {!canSendMessages && (
        <p className="text-sm text-text-muted">
          Read-only mode. <Link to="/login">Log in</Link> to send messages.
        </p>
      )}
    </div>
  );
}

export default Chat;