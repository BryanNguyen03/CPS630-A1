import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CommunityPage = ({ currentUser, users = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return users
      .filter((user) => user.username !== currentUser?.username)
      .filter((user) => {
        if (!normalizedSearch) {
          return true;
        }
        return user.username.toLowerCase().includes(normalizedSearch);
      })
      .sort((a, b) => a.username.localeCompare(b.username));
  }, [users, currentUser?.username, searchTerm]);

  const openProfile = (username) => {
    navigate(`/user/${encodeURIComponent(username)}`);
  };

  return (
    <div className="page">
      <h2>Community</h2>
      <p>Find users and open their profiles.</p>

      <div className="user-selection-section">
        <h3>Search Users</h3>
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
          {filteredUsers.length > 0 ? (
            <ul className="user-list">
              {filteredUsers.map((user) => (
                <li
                  key={user._id || user.username}
                  className="user-item"
                  onClick={() => openProfile(user.username)}
                >
                  {user.username}
                </li>
              ))}
            </ul>
          ) : searchTerm ? (
            <p className="no-items">No users found matching "{searchTerm}"</p>
          ) : (
            <p className="no-items">No other users found yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;