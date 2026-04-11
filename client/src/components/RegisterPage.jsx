import React, { useState } from 'react';

const RegisterPage = ({onRegistrationSuccess, showToast }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!username.trim() || !password) {
      showToast?.('Please enter both username and password.', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        showToast?.('Registration successful! You can now log in.', 'success');
        setUsername('');
        setPassword('');
        //refreshing the userlist to include the new user via parent component function from App
        onRegistrationSuccess();
      } else {
        const data = await response.json().catch(() => ({}));
        showToast?.(data.message || 'Registration failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      showToast?.('An error occurred while registering. Please try again.', 'error');
    }
  };

  return (
    <div className="page-shell mx-auto max-w-lg">
      <h2 className="page-title">Register</h2>
      <p className="page-subtitle">Create an account to leave reviews and chat with the community.</p>

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
        <button className="btn-primary w-full" onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
};

export default RegisterPage;