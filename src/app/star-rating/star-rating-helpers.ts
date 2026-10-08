import { MAX_RATING, MIN_RATING } from '../game-vault.constants';

export interface StarState {
  value: number;
  label: string;
  filled: boolean;
  checked: boolean;
}

/** Clicking the selected star clears the rating (it is optional); any other star selects it. */
export const nextRating = (current: number | null, clicked: number): number | null =>
  current === clicked ? null : clicked;

export const starLabel = (star: number): string => `${star} ${star === 1 ? 'star' : 'stars'}`;

export const buildStars = (rating: number | null, min = MIN_RATING, max = MAX_RATING): StarState[] =>
  Array.from({ length: max - min + 1 }, (_, index) => {
    const value = min + index;
    return { value, label: starLabel(value), filled: rating !== null && value <= rating, checked: value === rating };
  });
