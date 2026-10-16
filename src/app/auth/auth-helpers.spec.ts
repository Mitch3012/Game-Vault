import { HOME_ROUTE, LOGIN_ROUTE } from './auth.constants';
import {
  homeRouteFor,
  loginErrorMessage,
  signedInFrom,
  signupErrorMessage,
  userIdOf,
  userNameOf,
} from './auth-helpers';

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

describe('signedInFrom', () => {
  it('is null while the user is unknown', () => {
    expect(signedInFrom(null)).toBeNull();
  });

  it('is false when signed out', () => {
    expect(signedInFrom('')).toBe(false);
  });

  it('is true for a uid', () => {
    expect(signedInFrom('u1')).toBe(true);
  });
});

describe('homeRouteFor', () => {
  it('is home when signed in', () => {
    expect(homeRouteFor(true)).toBe(HOME_ROUTE);
  });

  it('is the login page when signed out', () => {
    expect(homeRouteFor(false)).toBe(LOGIN_ROUTE);
  });

  it('is the login page while it is unknown', () => {
    expect(homeRouteFor(null)).toBe(LOGIN_ROUTE);
  });
});

describe('userIdOf', () => {
  it('is null while Firebase has not answered', () => {
    expect(userIdOf(undefined)).toBeNull();
  });

  it('is an empty string when nobody is signed in', () => {
    expect(userIdOf(null)).toBe('');
  });

  it('is the uid of the signed-in user', () => {
    expect(userIdOf({ uid: 'u1' })).toBe('u1');
  });
});

describe('userNameOf', () => {
  it.each([[undefined], [null], [{ uid: 'u1' }], [{ uid: 'u1', displayName: null }], [{ uid: 'u1', displayName: '   ' }]])(
    'is empty when there is no name (%j)',
    (user) => {
      expect(userNameOf(user)).toBe('');
    },
  );

  it('is the trimmed display name', () => {
    expect(userNameOf({ uid: 'u1', displayName: '  Sam ' })).toBe('Sam');
  });
});
