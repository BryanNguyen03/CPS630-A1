import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import ReviewList from './ReviewList';
import { getNormalizedRating, getRatingBadgeClasses } from '../utils/ratingStyles';

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

  const fetchData = useCallback(() => {
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
  }, [gameId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  if (loading) {
    return (
      <div className="page-shell">
        <p className="empty-state">Loading game details...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="page-shell">
        <p className="empty-state">Game not found.</p>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Link to="/" className="btn-secondary w-fit">
        &lt;- Back to Games
      </Link>

      <div className="grid gap-5 lg:grid-cols-[16rem,1fr] lg:items-start">
        {game.coverUrl && (
          <img
            src={game.coverUrl}
            alt={`${game.name} cover`}
            className="w-full max-w-64 rounded-xl border border-edge object-cover shadow-[0_24px_40px_-32px_rgba(0,0,0,0.95)]"
          />
        )}

        <div className="space-y-3">
          <h2 className="page-title">{game.name}</h2>

          {game.rating && (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <strong className="text-text-primary">IGDB Rating:</strong>
              <span className={getRatingBadgeClasses(getNormalizedRating(game.rating / 20))}>
                {getNormalizedRating(game.rating / 20)}/5
              </span>
            </div>
          )}

          {game.releaseDate && (
            <p className="text-sm text-text-muted">
              <strong className="text-text-primary">Release Date:</strong> {new Date(game.releaseDate).toLocaleDateString()}
            </p>
          )}

          <p className="leading-7 text-text-muted">{game.summary || 'No summary available.'}</p>
        </div>
      </div>

      <h3 className="text-xl">Reviews for {game.name}</h3>

      {/* Add review form — only shown if logged in and haven't reviewed yet */}
      {token && !userAlreadyReviewed && (
        <div className="panel space-y-3">
          <h4 className="text-lg">Leave a Review</h4>

          <textarea
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            placeholder="Write your review..."
            rows={4}
            className="textarea-field"
          />

          <input
            type="number"
            value={newRating}
            onChange={(e) => setNewRating(e.target.value)}
            placeholder="Rating (1–5)"
            min={1}
            max={5}
            className="input-field"
          />

          {submitError && (
            <p className="text-sm text-rose-300">{submitError}</p>
          )}

          <button className="btn-primary w-fit" onClick={submitReview} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review (POST)'}
          </button>
        </div>
      )}

      {/* Already reviewed notice */}
      {token && userAlreadyReviewed && (
        <p className="rounded-lg border border-edge bg-bg-800/50 p-3 text-sm text-text-muted">
          You've already reviewed this game. Head to Manage Reviews to edit or delete it.
        </p>
      )}

      {/* Not logged in nudge */}
      {!token && (
        <p className="rounded-lg border border-edge bg-bg-800/50 p-3 text-sm text-text-muted">
          <Link to="/login">Log in</Link> to leave a review.
        </p>
      )}

      <div className="space-y-3">
        <ReviewList
          reviews={reviews}
          linkMode="profile"
          emptyMessage="No reviews yet for this game."
        />
      </div>
    </div>
  );
}

export default GameDetailsPage;