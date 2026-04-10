import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const gameCoverCache = new Map();

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
    <div className="review-card" style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
      {shouldLinkToGame && displayCoverUrl && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px' }}>
          <Link to={`/games/${review.igdbId}`} style={{ display: 'inline-block' }}>
            <img
              src={displayCoverUrl}
              alt={`${gameName} cover`}
              style={{ width: '110px', borderRadius: '6px', objectFit: 'cover' }}
            />
          </Link>
        </div>
      )}
      <h4>
        {shouldLinkToGame ? (
          <Link to={`/games/${review.igdbId}`}>{gameName}</Link>
        ) : (
          gameName
        )}
      </h4>
      {showUserName && (
        <p>
          <strong>User:</strong>{' '}
          {shouldLinkToProfile ? (
            <Link to={`/user/${encodeURIComponent(review.userName)}`}>{userName}</Link>
          ) : (
            userName
          )}
        </p>
      )}
      <p><strong>Rating:</strong> {review.rating} / 5</p>
      <p>{review.review}</p>
    </div>
  );
};

export default Review;
