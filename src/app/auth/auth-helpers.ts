import {
  DEFAULT_LOGIN_ERROR,
  DEFAULT_SIGNUP_ERROR,
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
