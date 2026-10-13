import { loginErrorMessage } from './auth-helpers';

describe('loginErrorMessage', () => {
  it('explains bad credentials', () => {
    const error = { code: 'auth/invalid-credential' };
    expect(loginErrorMessage(error)).toBe('Incorrect email or password.');
  });

  it('explains rate limiting', () => {
    const error = { code: 'auth/too-many-requests' };
    expect(loginErrorMessage(error)).toBe('Too many attempts. Please wait a moment and try again.');
  });

  it('falls back to the default for an unknown Firebase code', () => {
    const error = { code: 'auth/something-new' };
    expect(loginErrorMessage(error)).toBe('Could not log you in. Please try again.');
  });

  it.each([[new Error('boom')], [null], [undefined], ['auth/invalid-credential']])(
    'falls back to the default when the error has no code (%s)',
    (error) => {
      expect(loginErrorMessage(error)).toBe('Could not log you in. Please try again.');
    },
  );
});
