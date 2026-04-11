import { getRatingBadgeClasses } from '../utils/ratingStyles';
import { getNormalizedRating } from '../utils/reviewRatingStats';

function GameRatingBadge({ rating, displayValue, reviewCount }) {
  const numericRating = Number(rating);

  // Get the rating with styling
  const fallbackDisplayValue = getNormalizedRating(numericRating);
  const renderedValue = displayValue ?? fallbackDisplayValue;
  const hasReviewCount = reviewCount !== undefined && reviewCount !== null;

  return (
    <span className={getRatingBadgeClasses(numericRating)}>
      {renderedValue}/5{hasReviewCount ? ` (${reviewCount})` : ''}
    </span>
  );
}

export default GameRatingBadge;