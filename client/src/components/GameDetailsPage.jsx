//This component is for seeing indiviudal games, it also allows users to enter their review and see other reviews for the game
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import ReviewList from './ReviewList';
import { getNormalizedRating, getRatingBadgeClasses } from '../utils/ratingStyles';

function GameDetailsPage({ token, currentUser }) {
  
  //use state varaibles for rendering the page correctly
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true); //loading for the fetch

  //usestate variables for user review submission and input
  const [newRating, setNewRating] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  //usestate variables for the filters on the reviews for the game
  const [sortBy, setSortBy] = useState('highest'); //highest or lowest
  const [ratingFilter, setRatingFilter] = useState('all'); //all or 1,2,3,4,5

  //usestate variables for the lazy loading
  const [loadedCount, setLoadedCount] = useState(10); //variable for number of games currently displayed
  const [isLoading, setIsLoading] = useState(false); //semaphore to prevent duplicate batch requests (Load for the scrolling)
  const batchSize = 10; //variable to hold the current games per batch to be loaded
  const sentinelRef = useRef(null); //component reference that triggers batch load when it is in view

  //variable for getting the current game ID
  const gameId = parseInt(id, 10);

  //getting the game information and the reviews for it
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


  //at every render fetching game information and reviews
  useEffect(() => {
    fetchData();
  }, [fetchData]);



  //filtering and sorting the reviews based on user selections
  //since it is not in state or useEffect, it updates everytime the page re-renders / at every new state
  const filteredAndSortedReviews = reviews
    .filter((r) => ratingFilter === 'all' || r.rating === parseInt(ratingFilter, 10))
    .sort((a, b) => {
      if (sortBy === 'highest') {
        return (b.rating || 0) - (a.rating || 0);
      } else {
        return (a.rating || 0) - (b.rating || 0);
      }
    });


  //getting only the reviews currently loaded for display (For initial load)
  const displayedReviews = filteredAndSortedReviews.slice(0, loadedCount);

  //reset loaded count when sort/filter changes
  useEffect(() => {
    setLoadedCount(10);
  }, [ratingFilter, sortBy]);

  //setting up Intersection Observer for infinite scroll on reviews, 
  //runs whenever there is a change in the amount of reviews or if the user scrolls down past the observer div 
  useEffect(() => {
    //creating the observer
    const observer = new IntersectionObserver(
      (entries) => {
        //trigger load when observer becomes visible and conditions are met
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          loadedCount < filteredAndSortedReviews.length
        ) {
          setIsLoading(true);
          //setting a small timeout to not make it instant
          setTimeout(() => {
            //adding the amount for next load, without going over total review count
            setLoadedCount((prev) => Math.min(prev + batchSize, filteredAndSortedReviews.length));
            setIsLoading(false);
          }, 100);
        }
      },
      //allowing 10% of the observer div to be viewed before triggering
      { threshold: 0.1 }
    );

    //attaching the new observer to the current div
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    //before rerunning this useeffect it unobserves the old div (whenever the conditions in [] change)
    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [loadedCount, filteredAndSortedReviews.length, isLoading]);


  //check if the current logged-in user already has a review for this game
  const userAlreadyReviewed = token && currentUser?.username
    ? reviews.some(r => r.userName === currentUser.username)
    : false;

  
  //handler function for submitting a review
  const submitReview = async () => {
    //input validation
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

    //try catch for the fetch POST method
    try {
      //calling the api route for submitting a review by the user, to store it in the database
      const response = await fetch('http://localhost:8080/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` //authorization required
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

  //displaying loading components if loading page
  if (loading) {
    return (
      <div className="page-shell">
        <p className="empty-state">Loading game details...</p>
      </div>
    );
  }

  //displaying game not found components if needed
  if (!game) {
    return (
      <div className="page-shell">
        <p className="empty-state">Game not found.</p>
      </div>
    );
  }

  //regular display for the page
  return (
    <div className="page-shell">
      <Link to="/" className="btn-secondary w-fit">
        &lt;- Back to Games
      </Link>

      <div className="flex flex-nowrap gap-5 items-start">
        {game.coverUrl && (
          <img
            src={game.coverUrl}
            alt={`${game.name} cover`}
            className="w-64 shrink-0 rounded-xl border border-edge object-cover shadow-[0_24px_40px_-32px_rgba(0,0,0,0.95)]"
          />
        )}

        <div className="space-y-3 flex-1">
          <h2 className="page-title">{game.name}</h2>

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
        {/* Sort and Filter Controls */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex flex-col gap-1">
            <label htmlFor="sort-by" className="text-sm font-medium text-text-primary">
              Sort by Rating
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="highest">Highest to Low</option>
              <option value="lowest">Lowest to High</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="filter-rating" className="text-sm font-medium text-text-primary">
              Filter by Rating
            </label>
            <select
              id="filter-rating"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* filtered and sorted review display */}
        <ReviewList
          //pass only the loaded reviews for display (lazy loading handled here)
          reviews={displayedReviews}
          linkMode="profile"
          emptyMessage="No reviews found with selected filters."
        />

        {/* sentinel/observer div, when scrolled into view it triggers loading next batch */}
        {loadedCount < filteredAndSortedReviews.length && (
          <div ref={sentinelRef} style={{ height: '20px', margin: '20px 0' }} />
        )}

        {/* loading indicator,  shows while fetching next batch */}
        {isLoading && loadedCount < filteredAndSortedReviews.length && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#999' }}>Loading more reviews...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameDetailsPage;