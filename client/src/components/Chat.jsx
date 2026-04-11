//Component for the chat functionality, which uses socket.io
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';

//setting up the socket server port
const socketServerUrl = 'http://localhost:8080';

function Chat({ viewedUsername, authUsername, authToken, isOwnProfile = false }) {

  //useState variables for the messages
  const [messages, setMessages] = useState([]); //holds messages from database
  const [newMessage, setNewMessage] = useState('');

  const socketRef = useRef(null);
  const profileRoom = viewedUsername ? `profile:${viewedUsername}` : '';  //setting the current page's user to determine who to send the message to (becomes SocketID)
  const canSendMessages = Boolean(viewedUsername && authToken && authUsername); //only allowing logged in users to message via this boolean condition

  //Only if the user is logged in and has valid authorization, running this useEffect
  //It re-runs if the user selected is changed 
  //initializes the main socket listener
  useEffect(() => {
    //disconnecting the current socket if user cannot send messages or changes user to send messages to
    if (!canSendMessages) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    //variable for stopping state updates if the component is unmounted
    let isCancelled = false;

    //socket initialization
    const socketInitTimer = setTimeout(() => {
      if (isCancelled) {
        return;
      }

      //creating socket, also passing authtoken
      const socket = io(socketServerUrl, {
        transports: ['websocket'],
        auth: { token: authToken }
      });

      socketRef.current = socket;


      //when connected to a socket, joining appropirate room
      socket.on('connect', () => {
        console.log('Connected to chat socket', socket.id);
        if (profileRoom) {
          socket.emit('joinRoom', { room: profileRoom });
        }
      });

      //when there is a new chat message then adding it to the list of messages to render
      socket.on('chatMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }, 0); //runs at the end of the callstack, after all parameters are initailized

    //on cancellation/disconnect, disconnect the connection listener, disconnect the chat message lister, and disconnect the socket 
    return () => {
      isCancelled = true;
      clearTimeout(socketInitTimer);
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('chatMessage');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [canSendMessages, authToken, profileRoom]);


  //use effect to load messages whenever room is changed or when the ability to send messages changes
  useEffect(() => {
    //for stopping state updates if the component is unmounted
    let isCancelled = false;

    //setting current messages to display - handler function
    const setMessagesIfActive = (nextMessages) => {
      if (!isCancelled) {
        setMessages(nextMessages);
      }
    };

    //loading message handler function
    const loadMessages = async () => {
      if (!profileRoom) {
        setMessagesIfActive([]);
        return;
      }

      //fetching the saved messages for the room (Messages are pulled by room name)
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

    //loading the messages if fetched
    loadMessages();

    //joining the room if all conditions are met
    if (socketRef.current && canSendMessages && profileRoom) {
      //telling the backend socket handler to join room
      socketRef.current.emit('joinRoom', { room: profileRoom });
    }

    return () => {
      isCancelled = true;
    };
  }, [canSendMessages, profileRoom]);


  //handler function for sending a message, creates a message object which is then sent to the backend socket handler
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


  //displaying appropirately if no user selected 
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

  //message box display, with user input field for the message text and send button
  return (
    <div className="panel mt-8 space-y-3">
      <h3 className="text-xl">{isOwnProfile ? 'My Profile Chat' : `${viewedUsername}'s Profile Chat`}</h3>

      <div className="max-h-80 min-h-72 overflow-y-auto rounded-xl border border-edge bg-bg-800/55 p-3">
        {/* Mapping the messages into the chat box, if there is none then showing appropriate message */}
        {messages.length === 0 ? (
          <p className="empty-state">
            {canSendMessages ? 'No messages yet.' : 'No public chat messages yet.'}
          </p>
        ) : (
          // Mapping older messages from the database by timestamp
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
      {/* input field for the user to enter new messages */}
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