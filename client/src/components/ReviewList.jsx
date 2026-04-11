//reviewlist component which renders a list of reviews passed in by the parent component
import React from 'react';
import Review from './Review';

/**
 * linkMode is passed through to each Review to control navigation based on page context.
 * See Review.jsx for the full set of supported values.
 */
const ReviewList = ({ reviews = [], linkMode = 'none', emptyMessage = 'No reviews yet.', showUserName = true }) => {
  if (reviews.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map((review, index) => (
        <Review
          key={review._id || `${review.igdbId || 'game'}-${review.userId || review.userName || 'user'}-${index}`}
          review={review}
          linkMode={linkMode}
          showUserName={showUserName}
        />
      ))}
    </div>
  );
};

export default ReviewList;
