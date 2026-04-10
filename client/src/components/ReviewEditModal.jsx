function ReviewEditModal({
  isOpen,
  gameName,
  updatedReview,
  onUpdatedReviewChange,
  updatedRating,
  onUpdatedRatingChange,
  onClose,
  onUpdateReview,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg space-y-4 rounded-xl border border-edge bg-bg-900 p-5 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.95)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-lg">Edit Review{gameName ? `: ${gameName}` : ''}</h4>
          <button type="button" className="btn-secondary w-fit" onClick={onClose}>
            Close
          </button>
        </div>

        <textarea
          className="textarea-field"
          placeholder="Updated review text"
          value={updatedReview}
          onChange={(e) => onUpdatedReviewChange(e.target.value)}
        />

        <input
          type="number"
          className="input-field"
          placeholder="Updated Rating (1-5)"
          min={1}
          max={5}
          value={updatedRating}
          onChange={(e) => onUpdatedRatingChange(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2">
          <button type="button" className="btn-secondary w-fit" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary w-fit" onClick={onUpdateReview}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewEditModal;