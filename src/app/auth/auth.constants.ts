export const LOGIN_SUCCESS_ROUTE = '/';

export const DEFAULT_LOGIN_ERROR = 'Could not log you in. Please try again.';

/** Firebase auth error code -> message shown to the user. */
export const LOGIN_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/invalid-email': 'That email address is not valid.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
};
