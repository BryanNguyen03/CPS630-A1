import { useParams, Link } from 'react-router-dom';

function GameDetailsPage({ itemList }) {
  const { id } = useParams();

  // 1. Find the specific item to get the Game Name
  const selectedGameEntry = itemList.find((item) => item._id === id);

  if (!selectedGameEntry) {
    return <div className="page">Game not found.</div>;
  }

  // 2. Filter the entire list to find ALL reviews for this specific game
  const allReviewsForThisGame = itemList.filter(
    (item) => item.gameName === selectedGameEntry.gameName
  );

  return (
    <div className="page">
      <Link to="/games" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Games
      </Link>
      
      <h2>Reviews for {selectedGameEntry.gameName}</h2>
      
      <div className="reviews-list">
        {allReviewsForThisGame.map((review) => (
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
        ))}
      </div>
    </div>
  );
}

export default GameDetailsPage;