//Component for the login page, handles user login
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLoginSuccess, showToast }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  //calls the backend api to cross-validate user input with the details stored in the database
  const handleLogin = async () => {
    if (!username.trim() || !password) {
      showToast?.('Please enter both username and password.', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      //handling the possible returns either success or failed login
      if (response.ok) {
        const data = await response.json();
        const receivedToken = data.token;
        const loggedInUsername = data.username;
        onLoginSuccess({ token: receivedToken, username: loggedInUsername });
        navigate('/', { replace: true });
      } else {
        const data = await response.json().catch(() => ({}));
        showToast?.(data.message || 'Login failed. Please check your credentials.', 'error');
      }
    //catching any errors
    } catch (error) {
      console.error('Error during login:', error);
      showToast?.('An error occurred while logging in. Please try again.', 'error');
    }
  };

  //simple user input for login
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