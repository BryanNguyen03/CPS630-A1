import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function GamesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/games')
      .then(res => res.json())
      .then(data => setGames(data))
      .catch(err => console.error('Error fetching games:', err));
  }, []);

  const filteredGames = searchTerm.trim() === ''
    ? games
    : games.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="page">
      <h2>Explore Games</h2>
      <p>Browse through our collection of games.</p>

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
            <Link to={`/games/${item.igdbId}`} key={item._id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="game-card">
              {item.coverUrl && (
                <img 
                  src={item.coverUrl} 
                  alt={`${item.name} cover`} 
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
                />
              )}
              <div className="game-header">
                <h3 style={{ marginTop: '10px' }}>{item.name}</h3>
                {item.rating && (
                  <span className={`rating-badge rate-${Math.round(item.rating / 20) || '0'}`}>
                    {Math.round(item.rating / 20) || '0'}/5
                  </span>
                )}
              </div>
              
              <div className="game-body">
                <p className="summary-snippet" style={{ fontSize: '0.9em', color: '#666' }}>
                  {item.summary ? `${item.summary.substring(0, 100)}...` : 'No summary available.'}
                </p>
              </div>

              <div className="game-footer">
                <small>Released: {item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : 'Unknown'}</small>
              </div>
            </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default GamesPage;