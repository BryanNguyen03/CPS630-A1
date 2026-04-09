import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function GameDetailsPage({ token, currentUser }) {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newRating, setNewRating] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const gameId = parseInt(id, 10);

  const fetchData = () => {
    return Promise.all([
      fetch(`http://localhost:8080/api/games/${gameId}`),
      fetch(`http://localhost:8080/api/games/${gameId}/reviews`)
    ])
      .then(async ([gameResponse, reviewsResponse]) => {
        const gameData = await gameResponse.json();
        const reviewsData = await reviewsResponse.json();
        if (!gameData.error) setGame(gameData);
        if (!reviewsData.error) setReviews(reviewsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching game details:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [gameId]);

  // Check if the current logged-in user already has a review for this game
  const userAlreadyReviewed = token && currentUser?.username
    ? reviews.some(r => r.userName === currentUser.username)
    : false;

  const submitReview = async () => {
    if (!newReviewText.trim() || !newRating) {
      setSubmitError('Please fill in both the review and rating.');
      return;
    }
    if (isNaN(newRating) || newRating < 1 || newRating > 5) {
      setSubmitError('Rating must be between 1 and 5.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('http://localhost:8080/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          igdbId: gameId,
          gameName: game.name,
          review: newReviewText,
          rating: Number(newRating)
        })
      });

      if (response.ok) {
        setNewReviewText('');
        setNewRating('');
        await fetchData(); // Refresh reviews
      } else {
        const data = await response.json();
        setSubmitError(data.message || 'Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page">Loading game details...</div>;
  if (!game) return <div className="page">Game not found.</div>;

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
              <strong>IGDB Rating:</strong>{' '}
              <span className={`rating-badge rate-${Math.round(game.rating / 20) || '0'}`}>
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

      {/* Add review form — only shown if logged in and haven't reviewed yet */}
      {token && !userAlreadyReviewed && (
        <div className="input-section" style={{ marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '10px' }}>Leave a Review</h4>
          <textarea
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            placeholder="Write your review..."
            rows={4}
            style={{ width: '100%', marginBottom: '8px', resize: 'vertical' }}
          />
          <input
            type="number"
            value={newRating}
            onChange={(e) => setNewRating(e.target.value)}
            placeholder="Rating (1–5)"
            min={1}
            max={5}
            style={{ marginBottom: '8px' }}
          />
          {submitError && (
            <p style={{ color: 'red', marginBottom: '8px' }}>{submitError}</p>
          )}
          <button onClick={submitReview} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review (POST)'}
          </button>
        </div>
      )}

      {/* Already reviewed notice */}
      {token && userAlreadyReviewed && (
        <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
          You've already reviewed this game. Head to Manage Reviews to edit or delete it.
        </p>
      )}

      {/* Not logged in nudge */}
      {!token && (
        <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
          <Link to="/login">Log in</Link> to leave a review.
        </p>
      )}

      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="game-card" style={{ marginBottom: '15px' }}>
              <div className="game-header">
                <strong>{review.userName}</strong>
                <span className={`rating-badge rate-${review.rating}`}>
                  {review.rating}/5
                </span>
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