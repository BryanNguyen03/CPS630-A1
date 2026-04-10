import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const receivedToken = data.token;
        const username = data.username;
        localStorage.setItem('authToken', receivedToken);
        localStorage.setItem('authUsername', username);
        onLoginSuccess({ token: receivedToken, username }); // Update token and username in App.js
        navigate('/', { replace: true });
        alert('Login successful!');

      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="page-shell mx-auto max-w-lg">
      <h2 className="page-title">Login</h2>
      <p className="page-subtitle">Sign in to manage reviews and join profile chats.</p>

      <div className="panel space-y-3">
        <input
          type="text"
          className="input-field"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="input-field"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn-primary w-full" onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default LoginPage;