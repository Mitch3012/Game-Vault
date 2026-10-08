import { GameEntryChanges, GameEntryWithId, GameStatus } from '../game-vault-crud-service';
import { MAX_RATING, MIN_RATING } from './form.constants';

/** What the form edits. Rating is text so an empty box means "no rating". */
export interface FormModel {
  status: GameStatus;
  rating: string;
  notes: string;
}

export const findById = (games: GameEntryWithId[] | null, id: string): GameEntryWithId | undefined =>
  games?.find((game) => game.id === id);

export const toFormModel = (game: GameEntryWithId | undefined): FormModel => ({
  status: game?.status ?? 'wishlist',
  rating: game?.rating == null ? '' : String(game.rating),
  notes: game?.notes ?? '',
});

export const parseRating = (text: string): number | null => (text.trim() === '' ? null : Number(text));

export const ratingError = (text: string, min = MIN_RATING, max = MAX_RATING) => {
  const rating = parseRating(text);
  if (rating === null) return undefined;
  if (Number.isInteger(rating) && rating >= min && rating <= max) return undefined;
  return { kind: 'rating', message: `Rating must be a whole number from ${min} to ${max}` };
};

export const toChanges = (model: FormModel): GameEntryChanges => ({
  status: model.status,
  rating: parseRating(model.rating),
  notes: model.notes.trim(),
});
