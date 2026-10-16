import { GameEntry, GameEntryWithId, NewGameEntry } from '../game-vault-interface';
import {
  SUGGESTIONS_EMPTY_VAULT_TEXT,
  SUGGESTIONS_FAILED_TEXT,
  SUGGESTIONS_LOADING_TEXT,
  SUGGESTIONS_NONE_TEXT,
  SUGGESTION_COUNT,
} from './suggestions.constants';

export type VaultState = 'loading' | 'empty' | 'ready';
export type VaultGame = Pick<GameEntry, 'title' | 'genres' | 'status' | 'rating'>;

export interface SuggestionsView {
  games: NewGameEntry[] | null;
  failed: boolean;
  vaultEmpty: boolean;
}

const ARRAY_SPAN = /\[[\s\S]*\]/;

export const vaultStateOf = (games: GameEntryWithId[] | null): VaultState => {
  if (games === null) return 'loading';
  return games.length ? 'ready' : 'empty';
};

const describeGame = (game: VaultGame): string => {
  const details = [game.genres.join(', '), game.status, game.rating ? `${game.rating}/5` : ''];
  return `- ${game.title} (${details.filter(Boolean).join('; ')})`;
};

/** Sends only title, genres, status and rating. Notes are never included. */
export const buildSuggestionPrompt = (games: VaultGame[], count = SUGGESTION_COUNT): string =>
  [
    'Here are the video games in my collection:',
    ...games.map(describeGame),
    `Suggest ${count} other video games I would enjoy. Do not repeat any game listed above.`,
    'Reply with only a JSON array of game title strings, nothing else.',
  ].join('\n');

const tryParse = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

// Tries the whole reply first, then the first `[...]` in it (models add prose or code fences).
const parseJson = (text: string): unknown => {
  const trimmed = text.trim();
  const whole = tryParse(trimmed);
  if (whole !== undefined) return whole;
  return tryParse(trimmed.match(ARRAY_SPAN)?.[0] ?? '') ?? [];
};

/** Reads the AI's reply into clean, unique titles. Anything unexpected gives `[]`. */
export const parseTitles = (text: string): string[] => {
  const parsed = parseJson(text);
  if (!Array.isArray(parsed)) return [];
  const titles = parsed.filter((item): item is string => typeof item === 'string');
  return [...new Set(titles.map((title) => title.trim()).filter(Boolean))];
};

export const compact = <T>(items: (T | undefined)[]): T[] =>
  items.filter((item): item is T => item !== undefined);

export const uniqueByRawgId = (entries: NewGameEntry[]): NewGameEntry[] =>
  entries.filter((entry, index) => entries.findIndex((other) => other.rawgId === entry.rawgId) === index);

export const excludeSaved = (entries: NewGameEntry[], savedRawgIds: ReadonlySet<number>): NewGameEntry[] =>
  entries.filter((entry) => !savedRawgIds.has(entry.rawgId));

/** The one line of status text to show instead of cards. `''` = there are cards to show. */
export const suggestionsMessage = (view: SuggestionsView): string => {
  if (view.vaultEmpty) return SUGGESTIONS_EMPTY_VAULT_TEXT;
  if (view.failed) return SUGGESTIONS_FAILED_TEXT;
  if (view.games === null) return SUGGESTIONS_LOADING_TEXT;
  if (view.games.length === 0) return SUGGESTIONS_NONE_TEXT;
  return '';
};
