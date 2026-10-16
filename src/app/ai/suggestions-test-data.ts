import { GameEntryWithId, NewGameEntry } from '../game-vault-interface';

/** Shared sample data for the suggestions service specs. */
export const entry = (rawgId: number, title = `Game ${rawgId}`): NewGameEntry => ({
  rawgId,
  title,
  coverUrl: '',
  platforms: [],
  genres: [],
  releaseDate: '',
  rating: null,
  status: 'wishlist',
  notes: '',
});

export const saved = (rawgId: number, title: string): GameEntryWithId => ({
  ...entry(rawgId, title),
  id: `doc${rawgId}`,
  addedAt: 0,
});
