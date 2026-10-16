import { Observable, of, startWith } from 'rxjs';

import { GameEntryWithId } from './game-vault-interface';
import {
  GAMES_SUBCOLLECTION,
  LOAD_ERROR_MESSAGE,
  NO_USER_ERROR,
  PERMISSION_DENIED_HINT,
  USERS_COLLECTION,
} from './game-vault.constants';

export const userGamesPath = (uid: string): [string, string, string] => [
  USERS_COLLECTION,
  uid,
  GAMES_SUBCOLLECTION,
];

export const gamePath = (uid: string, id: string): [string, string, string, string] => [
  ...userGamesPath(uid),
  id,
];

/** The signed-in uid, or throws when nobody is signed in or it is not known yet. */
export const requireUserId = (uid: string | null): string => {
  if (!uid) throw new Error(NO_USER_ERROR);
  return uid;
};

/**
 * `null` = user unknown, `[]` = signed out, otherwise the user's own games.
 * A signed-in user's stream starts with `null`, so a switch never keeps showing the previous user's games.
 */
export const gamesFor = (
  uid: string | null,
  watch: (uid: string) => Observable<GameEntryWithId[]>,
): Observable<GameEntryWithId[] | null> => {
  if (uid === null) return of(null);
  if (!uid) return of([]);
  return watch(uid).pipe(startWith(null));
};

const errorCodeOf = (error: unknown): string => {
  const code = (error as { code?: unknown } | null | undefined)?.code;
  return typeof code === 'string' ? code : '';
};

/** What to log when the games stream fails. Permission errors get a hint about the Firestore rules. */
export const loadErrorMessage = (error: unknown): string =>
  errorCodeOf(error).endsWith('permission-denied') ? PERMISSION_DENIED_HINT : LOAD_ERROR_MESSAGE;
