import {
  DEFAULT_LOGIN_ERROR,
  DEFAULT_SIGNUP_ERROR,
  HOME_ROUTE,
  LOGIN_ROUTE,
  LOGIN_ERROR_MESSAGES,
  SIGNUP_ERROR_MESSAGES,
} from './auth.constants';

const errorCode = (error: unknown): string => {
  const code = (error as { code?: unknown } | null | undefined)?.code;
  return typeof code === 'string' ? code : '';
};

const messageFor = (messages: Readonly<Record<string, string>>, fallback: string) => (error: unknown) =>
  messages[errorCode(error)] ?? fallback;

/** Friendly message for a failed login. Unknown or code-less errors get the default. */
export const loginErrorMessage = messageFor(LOGIN_ERROR_MESSAGES, DEFAULT_LOGIN_ERROR);

/** Friendly message for a failed signup. Unknown or code-less errors get the default. */
export const signupErrorMessage = messageFor(SIGNUP_ERROR_MESSAGES, DEFAULT_SIGNUP_ERROR);

/** `null` = the user is not known yet, `''` = nobody is signed in, otherwise a uid. */
export const signedInFrom = (userId: string | null): boolean | null => (userId === null ? null : userId !== '');

/** Where the app title should go: home when signed in, the login page otherwise. */
export const homeRouteFor = (signedIn: boolean | null): string => (signedIn ? HOME_ROUTE : LOGIN_ROUTE);

/** Just the parts of a Firebase user the app reads. */
export interface UserLike {
  uid: string;
  displayName?: string | null;
}

/** `undefined` = Firebase has not answered, `null` = nobody is signed in. */
export type UserState = UserLike | null | undefined;

/** `null` = not known yet, `''` = nobody is signed in, otherwise the uid. */
export const userIdOf = (user: UserState): string | null => {
  if (user === undefined) return null;
  return user?.uid ?? '';
};

/** The user's display name, trimmed. `''` when there is none. */
export const userNameOf = (user: UserState): string => (user?.displayName ?? '').trim();
