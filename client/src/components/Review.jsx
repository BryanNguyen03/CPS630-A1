import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRatingBadgeClasses } from '../utils/ratingStyles';

// In-memory cache so repeated renders of the same game don't re-fetch covers
const gameCoverCache = new Map();

/**
 * linkMode controls which entity the review links to, depending on the page context:
 *   - 'game'    → game title & cover link to the game page  (used on user profile)
 *   - 'profile' → username links to the reviewer's profile  (used on game details page)
 *   - 'none'    → no navigation links rendered (default)
 */
const Review = ({ review, linkMode = 'none', showUserName = true }) => {
  const [coverUrl, setCoverUrl] = useState(() => review.coverUrl || gameCoverCache.get(review.igdbId) || '');
  const gameName = review.gameName || 'Unknown game';
  const userName = review.userName || 'Unknown user';
  const shouldLinkToGame = linkMode === 'game' && review.igdbId;
  const shouldLinkToProfile = linkMode === 'profile' && review.userName;
  const displayCoverUrl = review.coverUrl || coverUrl;

  useEffect(() => {
    if (!shouldLinkToGame || review.coverUrl || gameCoverCache.has(review.igdbId)) {
      return;
    }

    let isCancelled = false;

    const loadCover = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/games/${review.igdbId}`);
        if (!response.ok) {
          return;
        }

        const game = await response.json();
        const fetchedCoverUrl = game?.coverUrl || '';

        if (!isCancelled) {
          gameCoverCache.set(review.igdbId, fetchedCoverUrl);
          setCoverUrl(fetchedCoverUrl);
        }
      } catch (error) {
        console.error('Error loading game cover:', error);
      }
    };

    loadCover();

    return () => {
      isCancelled = true;
    };
  }, [shouldLinkToGame, review.coverUrl, review.igdbId]);

  return (
    <article className="card space-y-2">
      {shouldLinkToGame && displayCoverUrl && (
        <div className="mb-1 flex justify-start">
          <Link to={`/games/${review.igdbId}`} className="inline-block">
            <img
              src={displayCoverUrl}
              alt={`${gameName} cover`}
              className="h-28 w-24 rounded-lg object-cover sm:h-32 sm:w-28"
            />
          </Link>
        </div>
      )}

      <h4 className="text-lg font-semibold">
        {shouldLinkToGame ? (
          <Link to={`/games/${review.igdbId}`}>{gameName}</Link>
        ) : (
          gameName
        )}
      </h4>

      {showUserName && (
        <p className="text-sm text-text-muted">
          <strong className="text-text-primary">User:</strong>{' '}
          {shouldLinkToProfile ? (
            <Link to={`/user/${encodeURIComponent(review.userName)}`}>{userName}</Link>
          ) : (
            userName
          )}
        </p>
      )}

      <div className="flex items-center gap-2 text-sm text-text-muted">
        <strong className="text-text-primary">Rating:</strong>
        <span className={getRatingBadgeClasses(review.rating)}>{review.rating}/5</span>
      </div>

      <p className="text-sm leading-6 text-text-muted">{review.review}</p>
    </article>
  );
};

export default Review;
