import { GameEntryWithId, NewGameEntry } from '../game-vault-interface';
import { ExportedGame, ImportPreview, ParseResult, VaultExport } from './transfer-interface';
import {
  COVER_URL_PREFIX,
  EXPORT_APP,
  EXPORT_VERSION,
  FALLBACK_OWNER,
  GAME_STATUSES,
  IMPORTED_STATUS,
  INVALID_FILE_MESSAGE,
  MAX_DATE_CHARS,
  MAX_FILE_CHARS,
  MAX_FILE_NAME_OWNER_CHARS,
  MAX_GAMES,
  MAX_LIST_ITEMS,
  MAX_LIST_ITEM_CHARS,
  MAX_NOTES_CHARS,
  MAX_OWNER_CHARS,
  MAX_TITLE_CHARS,
  TOO_BIG_MESSAGE,
  TOO_MANY_MESSAGE,
} from './transfer.constants';

const SINGLE_LINE_CONTROLS = /[\u0000-\u001F\u007F]/g;
const MULTI_LINE_CONTROLS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | undefined =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : undefined;

const textOf = (value: unknown, max: number, controls = SINGLE_LINE_CONTROLS): string =>
  typeof value === 'string' ? value.replace(controls, '').trim().slice(0, max) : '';

const listOf = (value: unknown): string[] =>
  (Array.isArray(value) ? value : [])
    .map((item) => textOf(item, MAX_LIST_ITEM_CHARS))
    .filter(Boolean)
    .slice(0, MAX_LIST_ITEMS);

const coverOf = (value: unknown): string =>
  typeof value === 'string' && value.startsWith(COVER_URL_PREFIX) ? value : '';

/** `undefined` = not allowed (a rating must be a whole number 1 to 5, or null). */
const ratingOf = (value: unknown): number | null | undefined => {
  if (value === null) return null;
  const whole = Number.isInteger(value) ? (value as number) : 0;
  return whole >= 1 && whole <= 5 ? whole : undefined;
};

const statusOf = (value: unknown): ExportedGame['status'] | undefined =>
  GAME_STATUSES.find((status) => status === value);

const rawgIdOf = (value: unknown): number | undefined =>
  Number.isInteger(value) && (value as number) > 0 ? (value as number) : undefined;

const parseGame = (raw: unknown): ExportedGame | undefined => {
  const game = asRecord(raw);
  if (!game) return undefined;
  const rawgId = rawgIdOf(game['rawgId']);
  const title = textOf(game['title'], MAX_TITLE_CHARS);
  const status = statusOf(game['status']);
  const rating = ratingOf(game['rating']);
  if (rawgId === undefined || !title || !status || rating === undefined) return undefined;
  return {
    rawgId,
    title,
    coverUrl: coverOf(game['coverUrl']),
    platforms: listOf(game['platforms']),
    genres: listOf(game['genres']),
    releaseDate: textOf(game['releaseDate'], MAX_DATE_CHARS),
    status,
    rating,
    notes: textOf(game['notes'], MAX_NOTES_CHARS, MULTI_LINE_CONTROLS),
  };
};

const toExportedGame = (game: GameEntryWithId): ExportedGame => ({
  rawgId: game.rawgId,
  title: game.title,
  coverUrl: game.coverUrl,
  platforms: game.platforms,
  genres: game.genres,
  releaseDate: game.releaseDate,
  status: game.status,
  rating: game.rating,
  notes: game.notes ?? '',
});

export const buildExport = (games: GameEntryWithId[], owner: string, now: Date): VaultExport => ({
  app: EXPORT_APP,
  version: EXPORT_VERSION,
  exportedAt: now.toISOString(),
  owner,
  games: games.map(toExportedGame),
});

export const serializeExport = (data: VaultExport): string => JSON.stringify(data, null, 2);

const fileSafe = (owner: string): string =>
  owner
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_FILE_NAME_OWNER_CHARS)
    .replace(/-+$/g, '');

export const exportFileName = (owner: string, now: Date): string =>
  ['game-vault', fileSafe(owner), now.toISOString().slice(0, 10)].filter(Boolean).join('-') + '.json';

const tryParse = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const failure = (error: string): ParseResult => ({ ok: false, error });

/** Checks a file's text and reads out the valid games. Never trusts the file. */
export const parseExport = (text: string): ParseResult => {
  if (text.length > MAX_FILE_CHARS) return failure(TOO_BIG_MESSAGE);
  const root = asRecord(tryParse(text));
  const games = root?.['games'];
  if (!root || root['app'] !== EXPORT_APP || root['version'] !== EXPORT_VERSION) return failure(INVALID_FILE_MESSAGE);
  if (!Array.isArray(games)) return failure(INVALID_FILE_MESSAGE);
  if (games.length > MAX_GAMES) return failure(TOO_MANY_MESSAGE);
  const valid = games.map(parseGame).filter((game): game is ExportedGame => game !== undefined);
  return { ok: true, owner: textOf(root['owner'], MAX_OWNER_CHARS), games: valid, skipped: games.length - valid.length };
};

/** The friend's rating and notes, labelled so they are not mistaken for the user's own. */
export const importedNote = (owner: string, rating: number | null, notes: string): string => {
  const label = `From ${owner || FALLBACK_OWNER}${rating ? ` (${rating}/5)` : ''}`;
  return notes ? `${label}: ${notes}` : label;
};

const toImportedGame = (game: ExportedGame, owner: string): NewGameEntry => ({
  rawgId: game.rawgId,
  title: game.title,
  coverUrl: game.coverUrl,
  platforms: game.platforms,
  genres: game.genres,
  releaseDate: game.releaseDate,
  rating: null,
  status: IMPORTED_STATUS,
  notes: importedNote(owner, game.rating, game.notes),
});

const firstOfEach = (games: ExportedGame[]): ExportedGame[] =>
  games.filter((game, index) => games.findIndex((other) => other.rawgId === game.rawgId) === index);

/** Works out what importing would do, without saving anything. */
export const planImport = (
  parsed: { owner: string; games: ExportedGame[]; skipped: number },
  ownedRawgIds: ReadonlySet<number>,
): ImportPreview => {
  const unique = firstOfEach(parsed.games);
  const fresh = unique.filter((game) => !ownedRawgIds.has(game.rawgId));
  const skipped = parsed.skipped + (parsed.games.length - unique.length);
  return {
    owner: parsed.owner,
    total: unique.length + skipped,
    fresh: fresh.map((game) => toImportedGame(game, parsed.owner)),
    alreadyOwned: unique.length - fresh.length,
    skipped,
  };
};

export const previewSummary = (preview: ImportPreview): string => {
  const who = preview.owner ? `${preview.owner}'s` : "A friend's";
  const games = preview.total === 1 ? 'game' : 'games';
  return `${who} vault: ${preview.total} ${games}. ${preview.fresh.length} new, ${preview.alreadyOwned} already in your vault, ${preview.skipped} skipped.`;
};

export const importedMessage = (count: number): string =>
  `Imported ${count} ${count === 1 ? 'game' : 'games'} as Wishlist.`;

/** Splits a list into groups of at most `size` (at least one). */
export const chunk = <T>(items: T[], size: number): T[][] => {
  const step = Math.max(1, size);
  return Array.from({ length: Math.ceil(items.length / step) }, (_, index) =>
    items.slice(index * step, index * step + step),
  );
};

/** The first file of a file picker's selection, or `null` if none was chosen. */
export const firstFile = (files: FileList | null): File | null => files?.[0] ?? null;
