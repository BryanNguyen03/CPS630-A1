function UpdateReviewSection({
  itemList,
  selectedReviewId,
  onSelectedReviewIdChange,
  updatedReview,
  onUpdatedReviewChange,
  updatedRating,
  onUpdatedRatingChange,
  onUpdateReview,
}) {
  return (
    <div className="input-section">
      <h4>Update a Review</h4>
      <select
        value={selectedReviewId}
        onChange={(e) => onSelectedReviewIdChange(e.target.value)}
      >
        <option value="">-- Select a review to update --</option>
        {itemList.map((item) => (
          <option key={item._id} value={item._id}>
            {item.gameName} - "{item.review.slice(0, 40)}{item.review.length > 40 ? '...' : ''}"
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Updated review text"
        value={updatedReview}
        onChange={(e) => onUpdatedReviewChange(e.target.value)}
      />
      <input
        type="number"
        placeholder="Updated Rating (1-5)"
        min={1}
        max={5}
        value={updatedRating}
        onChange={(e) => onUpdatedRatingChange(e.target.value)}
      />
      <button onClick={onUpdateReview}>Update Review</button>
    </div>
  );
}

export default UpdateReviewSection;