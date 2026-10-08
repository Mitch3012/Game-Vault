import { GameEntryChanges, GameEntryWithId, GameStatus } from '../game-vault-interface';

/** What the form edits. A `null` rating means "no rating". */
export interface FormModel {
  status: GameStatus;
  rating: number | null;
  notes: string;
}

export const findById = (games: GameEntryWithId[] | null, id: string): GameEntryWithId | undefined =>
  games?.find((game) => game.id === id);

export const toFormModel = (game: GameEntryWithId | undefined): FormModel => ({
  status: game?.status ?? 'wishlist',
  rating: game?.rating ?? null,
  notes: game?.notes ?? '',
});

export const toChanges = (model: FormModel): GameEntryChanges => ({
  status: model.status,
  rating: model.rating,
  notes: model.notes.trim(),
});
