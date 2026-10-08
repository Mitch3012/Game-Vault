import { GameStatus } from '../game-vault-crud-service';

export const MIN_RATING = 1;
export const MAX_RATING = 5;
export const GAME_LIST_URL = '/game-list';
export const SAVE_ERROR_MESSAGE = 'Could not save your changes. Please try again.';

export const STATUS_OPTIONS: readonly { value: GameStatus; label: string }[] = [
  { value: 'wishlist', label: 'Wishlist' },
  { value: 'playing', label: 'Playing' },
  { value: 'completed', label: 'Completed' },
  { value: 'dropped', label: 'Dropped' },
];
