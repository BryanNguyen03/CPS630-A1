import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function GameDetailsPage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Parse id as a number for matching with our dataset
  const gameId = parseInt(id, 10);

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:8080/api/games/${gameId}`),
      fetch(`http://localhost:8080/api/games/${gameId}/reviews`)
    ])
      .then(async ([gameResponse, reviewsResponse]) => {
        const gameData = await gameResponse.json();
        const reviewsData = await reviewsResponse.json();

        if (!gameData.error) {
          setGame(gameData);
        }
        if (!reviewsData.error) {
          setReviews(reviewsData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching game details:', err);
        setLoading(false);
      });
  }, [gameId]);

  if (loading) {
    return <div className="page">Loading game details...</div>;
  }

  if (!game) {
    return <div className="page">Game not found.</div>;
  }

  return (
    <div className="page">
      <Link to="/games" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Games
      </Link>
      
      <div className="game-details" style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'flex-start' }}>
        {game.coverUrl && (
          <img 
            src={game.coverUrl} 
            alt={`${game.name} cover`} 
            style={{ width: '250px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}
          />
        )}
        <div style={{ flex: 1 }}>
          <h2>{game.name}</h2>
          {game.rating && (
            <div style={{ marginBottom: '15px' }}>
              <strong>IGDB Rating:</strong> <span className={`rating-badge rate-${Math.round(game.rating / 20) || '0'}`}>
                {Math.round(game.rating / 20) || '0'}/5
              </span>
            </div>
          )}
          {game.releaseDate && (
             <p><strong>Release Date:</strong> {new Date(game.releaseDate).toLocaleDateString()}</p>
          )}
          <p style={{ lineHeight: '1.6' }}>{game.summary || 'No summary available.'}</p>
        </div>
      </div>

      <h3>Reviews for {game.name}</h3>
      
      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="game-card" style={{ marginBottom: '15px' }}>
              <div className="game-header">
                <span className={`rating-badge rate-${review.rating}`}>
                  {review.rating}/5
                </span>
                <small>{new Date().toLocaleDateString()}</small> 
              </div>
              <div className="game-body">
                <p>"{review.review}"</p>
              </div>
            </div>
          ))
        ) : (
          <p>No reviews yet for this game.</p>
        )}
      </div>
    </div>
  );
}

export default GameDetailsPage;
