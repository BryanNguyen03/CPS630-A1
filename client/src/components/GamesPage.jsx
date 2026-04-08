import { useState } from 'react';
import { Link } from 'react-router-dom'; // 1. Import Link

function GamesPage({ itemList }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGames = itemList.filter(item =>
    item.gameName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page">
      <h2>Explore Games</h2>
      <p>Browse through our collection of community-reviewed titles.</p>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search for a game..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="games-grid">
        {filteredGames.length === 0 ? (
          <p className="no-items">No games found matching "{searchTerm}"</p>
        ) : (
          filteredGames.map((item) => (
            <div key={item._id} className="game-card">
              <div className="game-header">
                <h3>{item.gameName}</h3>
                <span className={`rating-badge rate-${item.rating}`}>
                  {item.rating}/5
                </span>
              </div>
              
              <div className="game-body">
                <p className="review-snippet">
                  <strong>Latest Review:</strong> "{item.review}"
                </p>
              </div>

              <div className="game-footer">
                <small>Review ID: {item._id.substring(0, 8)}...</small>
                {/* 2. Changed button to Link */}
                <Link 
                  to={`/games/${item._id}/reviews`} 
                  className="view-details-btn"
                  style={{ textDecoration: 'none', textAlign: 'center' }}
                >
                  Read All Reviews
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default GamesPage;