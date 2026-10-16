import { GameStatus } from '../game-vault-interface';

export const EXPORT_APP = 'game-vault';
export const EXPORT_VERSION = 1;

export const MAX_FILE_CHARS = 1_000_000;
export const MAX_GAMES = 500;
export const MAX_TITLE_CHARS = 200;
export const MAX_NOTES_CHARS = 1000;
export const MAX_OWNER_CHARS = 40;
export const MAX_DATE_CHARS = 20;
export const MAX_LIST_ITEMS = 20;
export const MAX_LIST_ITEM_CHARS = 60;
export const MAX_FILE_NAME_OWNER_CHARS = 30;

/** Only RAWG's own image host is accepted, so a file cannot point the app at a tracking URL. */
export const COVER_URL_PREFIX = 'https://media.rawg.io/';

export const GAME_STATUSES: readonly GameStatus[] = ['wishlist', 'playing', 'completed', 'dropped'];
export const IMPORTED_STATUS: GameStatus = 'wishlist';

/** How many games are saved at the same time during an import. */
export const IMPORT_BATCH_SIZE = 20;

export const FALLBACK_OWNER = 'a friend';

export const INVALID_FILE_MESSAGE = 'That file is not a Game Vault export.';
export const TOO_BIG_MESSAGE = 'That file is too large to import.';
export const TOO_MANY_MESSAGE = `That file has more than ${MAX_GAMES} games, which is too many to import.`;
export const NOTHING_NEW_MESSAGE = 'Nothing new to import: you already have all of these games.';
export const IMPORT_ERROR_MESSAGE = 'Could not import those games. Please try again.';
export const EXPORT_ERROR_MESSAGE = 'Could not export your vault. Please try again.';
