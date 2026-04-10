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
    <div className="page-shell">
      <div className="space-y-1">
        <h2 className="page-title">Community</h2>
        <p className="page-subtitle">Find users and open their profiles.</p>
      </div>

      <div className="panel space-y-4">
        <h3 className="text-xl">Search Users</h3>

        <input
          type="text"
          className="input-field"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {filteredUsers.length > 0 ? (
          <ul className="max-h-80 overflow-y-auto rounded-xl border border-edge bg-bg-800/45">
            {filteredUsers.map((user) => (
              <li
                key={user._id || user.username}
                className="cursor-pointer border-b border-edge/60 px-4 py-3 text-sm text-text-primary transition last:border-b-0 hover:bg-bg-700/55"
                onClick={() => openProfile(user.username)}
              >
                {user.username}
              </li>
            ))}
          </ul>
        ) : searchTerm ? (
          <p className="empty-state">No users found matching "{searchTerm}"</p>
        ) : (
          <p className="empty-state">No other users found yet.</p>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;