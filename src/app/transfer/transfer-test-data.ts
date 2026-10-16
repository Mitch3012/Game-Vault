import { GameEntryWithId } from '../game-vault-interface';
import { parseExport } from './transfer-helpers';
import { EXPORT_APP, EXPORT_VERSION } from './transfer.constants';

/** Shared sample data for the transfer specs. */
export const saved = (overrides: Partial<GameEntryWithId> = {}): GameEntryWithId => ({
  id: 'doc1',
  rawgId: 3328,
  title: 'The Witcher 3',
  coverUrl: 'https://media.rawg.io/media/games/w3.jpg',
  platforms: ['PC'],
  genres: ['RPG'],
  releaseDate: '2015-05-18',
  rating: 5,
  status: 'completed',
  notes: 'Best open world.',
  addedAt: 123,
  ...overrides,
});

export const file = (games: unknown[], extra: Record<string, unknown> = {}) =>
  JSON.stringify({ app: EXPORT_APP, version: EXPORT_VERSION, owner: 'Sam', games, ...extra });

export const wire = (overrides: Record<string, unknown> = {}) => ({
  rawgId: 1,
  title: 'Hades',
  coverUrl: '',
  platforms: [],
  genres: [],
  releaseDate: '',
  status: 'wishlist',
  rating: null,
  notes: '',
  ...overrides,
});

export const parsedGames = (text: string) => {
  const result = parseExport(text);
  if (!result.ok) throw new Error(`expected a valid file, got: ${result.error}`);
  return result;
};
