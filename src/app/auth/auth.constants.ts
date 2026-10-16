export const HOME_ROUTE = '/';
export const LOGIN_SUCCESS_ROUTE = HOME_ROUTE;
export const LOGIN_ROUTE = '/auth';
export const SIGNUP_ROUTE = '/signup';

/** Firebase rejects passwords shorter than this. */
export const MIN_PASSWORD_LENGTH = 6;

export const DEFAULT_LOGIN_ERROR = 'Could not log you in. Please try again.';
export const DEFAULT_SIGNUP_ERROR = 'Could not sign you up. Please try again.';

const SHARED_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  'auth/invalid-email': 'That email address is not valid.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
};

/** Firebase auth error code -> message shown to the user on login. */
export const LOGIN_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  ...SHARED_ERROR_MESSAGES,
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/user-disabled': 'This account has been disabled.',
};

/** Firebase auth error code -> message shown to the user on signup. */
export const SIGNUP_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  ...SHARED_ERROR_MESSAGES,
  'auth/email-already-in-use': 'An account with that email already exists.',
  'auth/weak-password': `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
};

export const LOGIN_PROMPT_WELCOME = 'Welcome to Game Vault!';
export const LOGIN_PROMPT_MESSAGE = "You haven't logged in yet.";
export const LOGIN_PROMPT_LINK_TEXT = 'Click here to log in';
export const LOGIN_PROMPT_SUFFIX = 'to save games to your vault.';
