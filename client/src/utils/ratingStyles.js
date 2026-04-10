const normalizeRating = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(5, Math.round(numericValue)));
};

const ratingBadgeClasses = {
  0: 'pill-badge border-edge bg-bg-700 text-text-muted',
  1: 'pill-badge border-rose-400/35 bg-rose-500/15 text-rose-200',
  2: 'pill-badge border-orange-400/35 bg-orange-500/15 text-orange-200',
  3: 'pill-badge border-amber-400/35 bg-amber-500/15 text-amber-200',
  4: 'pill-badge border-emerald-400/35 bg-emerald-500/15 text-emerald-200',
  5: 'pill-badge border-green-400/35 bg-green-500/15 text-green-200',
};

export const getNormalizedRating = (value) => normalizeRating(value);

export const getRatingBadgeClasses = (value) => {
  const normalized = normalizeRating(value);
  return ratingBadgeClasses[normalized] ?? ratingBadgeClasses[0];
};
