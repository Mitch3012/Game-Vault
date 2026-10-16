import { GameEntry, GameEntryWithId, NewGameEntry } from '../game-vault-interface';
import {
  MAX_ASK_CHARS,
  MAX_REASON_CHARS,
  SUGGESTIONS_EMPTY_VAULT_TEXT,
  SUGGESTIONS_FAILED_TEXT,
  SUGGESTIONS_LOADING_TEXT,
  SUGGESTIONS_NONE_TEXT,
  SUGGESTIONS_TITLE_FALLBACK,
  SUGGESTION_COUNT,
} from './suggestions.constants';

export type VaultState = 'loading' | 'empty' | 'ready';
export type VaultGame = Pick<GameEntry, 'title' | 'genres' | 'status' | 'rating'>;

export interface SuggestionsView {
  games: NewGameEntry[] | null;
  failed: boolean;
  vaultEmpty: boolean;
}

/** One game the AI suggested. `reason` is `''` when it gave none. */
export interface AiPick {
  title: string;
  reason: string;
}

/** A suggested game with the AI's reason for it. `reason` is `''` when it gave none. */
export interface Suggested {
  game: NewGameEntry;
  reason: string;
}

/** A pick after the RAWG lookup. `game` is `undefined` when RAWG did not know the title. */
export interface FoundPick {
  game: NewGameEntry | undefined;
  reason: string;
}

const ARRAY_SPAN = /\[[\s\S]*\]/;
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;

export const vaultStateOf = (games: GameEntryWithId[] | null): VaultState => {
  if (games === null) return 'loading';
  return games.length ? 'ready' : 'empty';
};

const describeGame = (game: VaultGame): string => {
  const details = [game.genres.join(', '), game.status, game.rating ? `${game.rating}/5` : ''];
  return `- ${game.title} (${details.filter(Boolean).join('; ')})`;
};

const collectionSection = (games: VaultGame[]): string =>
  games.length ? ['Here are the video games in my collection:', ...games.map(describeGame)].join('\n') : 'I have no games saved yet.';

const requestSection = (hasGames: boolean, count: number, asked: string): string => {
  if (asked) {
    const tune = hasGames ? ' Use my collection to tune the picks, and do not repeat any game listed above.' : '';
    return `Suggest ${count} video games that best match this request: "${asked}".${tune}`;
  }
  if (hasGames) return `Suggest ${count} other video games I would enjoy. Do not repeat any game listed above.`;
  return `Suggest ${count} popular, well-loved video games.`;
};

const formatSection = (hasGames: boolean, asked: string): string => {
  const why = hasGames ? 'mention a specific game from my collection' : asked ? 'say how it fits the request' : 'say why it is worth playing';
  const shape = '{"title": "Game name", "reason": "one short sentence, under 120 characters"}';
  return `Reply with only a JSON array of objects like ${shape}, nothing else. The reason should ${why}.`;
};

/** Sends only title, genres, status and rating, plus the user's request. Notes are never included. */
export const buildSuggestionPrompt = (games: VaultGame[], count = SUGGESTION_COUNT, asked = ''): string =>
  [collectionSection(games), requestSection(games.length > 0, count, asked), formatSection(games.length > 0, asked)].join('\n');

/** Cleans a user's request: one line, no control characters, no double quotes, at most 200 characters. */
export const normalizeAsk = (text: string): string =>
  text
    .replace(CONTROL_CHARS, ' ')
    .replace(/"/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_ASK_CHARS);

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

const cleanText = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.replace(CONTROL_CHARS, ' ').trim().slice(0, max) : '';

const toPick = (item: unknown): AiPick | undefined => {
  const record = item !== null && typeof item === 'object' ? (item as Record<string, unknown>) : undefined;
  const title = cleanText(record ? record['title'] : item, MAX_ASK_CHARS);
  if (!title) return undefined;
  return { title, reason: cleanText(record?.['reason'], MAX_REASON_CHARS) };
};

/** Reads the AI's reply into clean, unique picks. Accepts objects or plain titles. Anything unexpected gives `[]`. */
export const parsePicks = (text: string): AiPick[] => {
  const parsed = parseJson(text);
  if (!Array.isArray(parsed)) return [];
  const picks = parsed.map(toPick).filter((pick): pick is AiPick => pick !== undefined);
  return picks.filter((pick, index) => picks.findIndex((other) => other.title === pick.title) === index);
};

/** Keeps picks RAWG found, once each, that the user does not already have. */
export const toSuggested = (found: FoundPick[], savedRawgIds: ReadonlySet<number>): Suggested[] => {
  const known = found.filter((item): item is Suggested => item.game !== undefined);
  const unique = known.filter((item, index) => known.findIndex((other) => other.game.rawgId === item.game.rawgId) === index);
  return unique.filter((item) => !savedRawgIds.has(item.game.rawgId));
};

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

/** The suggestions heading: names the request when there is one, else the user. */
export const suggestionsTitle = (userName: string, asked = ''): string => {
  if (asked) return `Picks for "${asked}"`;
  return userName ? `Suggested for ${userName}` : SUGGESTIONS_TITLE_FALLBACK;
};
