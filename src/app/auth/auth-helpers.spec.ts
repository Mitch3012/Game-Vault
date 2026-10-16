import { loginErrorMessage, signupErrorMessage } from './auth-helpers';

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

describe('signupErrorMessage', () => {
  it('explains an email that is already registered', () => {
    const error = { code: 'auth/email-already-in-use' };
    expect(signupErrorMessage(error)).toBe('An account with that email already exists.');
  });

  it('explains a weak password', () => {
    const error = { code: 'auth/weak-password' };
    expect(signupErrorMessage(error)).toBe('Password must be at least 6 characters.');
  });

  it('shares the network message with login', () => {
    const error = { code: 'auth/network-request-failed' };
    expect(signupErrorMessage(error)).toBe(loginErrorMessage(error));
  });

  it('does not use login-only messages', () => {
    const error = { code: 'auth/invalid-credential' };
    expect(signupErrorMessage(error)).toBe('Could not sign you up. Please try again.');
  });

  it.each([[new Error('boom')], [null], [undefined]])('falls back to the default without a code (%s)', (error) => {
    expect(signupErrorMessage(error)).toBe('Could not sign you up. Please try again.');
  });
});
