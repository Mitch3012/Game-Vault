export const USERS_COLLECTION = 'users';
export const GAMES_SUBCOLLECTION = 'games';
export const NO_USER_ERROR = 'GameVaultCrudService: no user is signed in';

export const MIN_RATING = 1;
export const MAX_RATING = 5;

export const ADD_ERROR_MESSAGE = 'Could not add that game. Please try again.';
export const REMOVE_ERROR_MESSAGE = 'Could not remove that game. Please try again.';
export const LOGOUT_ERROR_MESSAGE = 'Could not log you out. Please try again.';

export const LOAD_ERROR_MESSAGE = '[GameVaultCrudService] failed to load games';
export const PERMISSION_DENIED_HINT =
  '[GameVaultCrudService] Firestore denied access to users/{uid}/games. Paste firestore.rules into the Firebase console (Firestore, Rules) so the vault can load.';

export const VAULT_TITLE_FALLBACK = 'Your vault';
