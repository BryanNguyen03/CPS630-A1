import React from 'react';

const Review = ({ review }) => {
  return (
    <div className="review-card" style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
      <h4>{review.gameName}</h4>
      <p><strong>Rating:</strong> {review.rating} / 5</p>
      <p>{review.review}</p>
    </div>
  );
};

export default Review;
