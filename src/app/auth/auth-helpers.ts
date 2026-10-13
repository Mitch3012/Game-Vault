import { DEFAULT_LOGIN_ERROR, LOGIN_ERROR_MESSAGES } from './auth.constants';

const errorCode = (error: unknown): string => {
  const code = (error as { code?: unknown } | null | undefined)?.code;
  return typeof code === 'string' ? code : '';
};

/** Friendly message for a failed login. Unknown or code-less errors get the default. */
export const loginErrorMessage = (error: unknown): string =>
  LOGIN_ERROR_MESSAGES[errorCode(error)] ?? DEFAULT_LOGIN_ERROR;
