// used to compute styles and fallback value for ratings
export const getNormalizedRating = (value) => {
  return Math.round(Number(value));
};

// formats average rating to 1 decimal place
const formatAverageRating = (value) => value.toFixed(1).replace(/\.0$/, '');

export const getAverageRatingFromReviews = (reviews = []) => {
  // Used on GameDetailsPage for game average rating and review count
  const validRatings = reviews.map((review) => Number(review?.rating));

  if (validRatings.length === 0) {
    return {
      averageRating: null,
      reviewCount: 0,
      averageDisplayValue: null
    };
  }

  const averageRating = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;

  return {
    averageRating,
    reviewCount: validRatings.length,
    averageDisplayValue: formatAverageRating(averageRating)
  };
};

// used on GamesPage to compute average rating and count per game
export const buildReviewStatsByGameId = (reviews = []) => {
  const statsMap = new Map();

  reviews.forEach((review) => {
    const igdbId = Number(review?.igdbId);
    const rating = Number(review?.rating);

    if (Number.isNaN(igdbId)) {
      return;
    }

    const current = statsMap.get(igdbId) || { sum: 0, reviewCount: 0 };
    const sum = current.sum + rating;
    const reviewCount = current.reviewCount + 1;
    const averageRating = sum / reviewCount;

    statsMap.set(igdbId, {
      sum,
      reviewCount,
      averageRating,
      averageDisplayValue: formatAverageRating(averageRating)
    });
  });

  return statsMap;
};