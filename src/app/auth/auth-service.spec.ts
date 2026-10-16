import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Auth, User, UserCredential } from '@angular/fire/auth';
import { Subject } from 'rxjs';

import { AUTH_STATE, Authservice, CREATE_USER, SIGN_IN, SIGN_OUT, UPDATE_PROFILE } from './auth-service';

const fakeAuth = {} as Auth;
const credential = { user: { uid: 'u1' } } as UserCredential;

describe('Authservice', () => {
  const signIn = vi.fn();
  const createUser = vi.fn();
  const updateProfile = vi.fn();
  const signOut = vi.fn();
  const authState = new Subject<User | null>();
  let service: Authservice;

  beforeEach(() => {
    signOut.mockReset();
    signIn.mockReset();
    createUser.mockReset();
    updateProfile.mockReset();
    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: fakeAuth },
        { provide: SIGN_IN, useValue: signIn },
        { provide: CREATE_USER, useValue: createUser },
        { provide: UPDATE_PROFILE, useValue: updateProfile },
        { provide: AUTH_STATE, useValue: () => authState },
        { provide: SIGN_OUT, useValue: signOut },
      ],
    });
    service = TestBed.inject(Authservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('userId', () => {
    it('is null until Firebase reports the auth state', () => {
      expect(service.userId()).toBeNull();
    });

    it('is the uid once a user is signed in', () => {
      authState.next({ uid: 'u1' } as User);
      expect(service.userId()).toBe('u1');
    });

    it('is an empty string when nobody is signed in', () => {
      authState.next(null);
      expect(service.userId()).toBe('');
    });

    it('follows the user when they change', () => {
      authState.next({ uid: 'u1' } as User);
      authState.next({ uid: 'u2' } as User);
      expect(service.userId()).toBe('u2');
    });
  });

  describe('signedIn', () => {
    it('is null until Firebase reports the auth state', () => {
      expect(service.signedIn()).toBeNull();
    });

    it('is true once a user is signed in', () => {
      authState.next({ uid: 'u1' } as User);
      expect(service.signedIn()).toBe(true);
    });

    it('is false when there is no user', () => {
      authState.next(null);
      expect(service.signedIn()).toBe(false);
    });
  });

  it('signs in with the Auth instance and the given credentials', async () => {
    signIn.mockResolvedValue(credential);
    await expect(service.login('a@b.com', 'secret')).resolves.toBe(credential);
    expect(signIn).toHaveBeenCalledExactlyOnceWith(fakeAuth, 'a@b.com', 'secret');
  });

  it('calls Firebase inside an injection context, which AngularFire requires', async () => {
    signIn.mockImplementation(() => {
      inject(Auth);
      return Promise.resolve(credential);
    });
    await expect(service.login('a@b.com', 'secret')).resolves.toBe(credential);
  });

  it('rejects with the Firebase error when sign-in fails', async () => {
    const failure = { code: 'auth/invalid-credential' };
    signIn.mockRejectedValue(failure);
    await expect(service.login('a@b.com', 'wrong')).rejects.toBe(failure);
  });

  describe('logout', () => {
    it('signs out of the Auth instance', async () => {
      signOut.mockResolvedValue(undefined);
      await service.logout();
      expect(signOut).toHaveBeenCalledExactlyOnceWith(fakeAuth);
    });

    it('calls Firebase inside an injection context, which AngularFire requires', async () => {
      signOut.mockImplementation(() => {
        inject(Auth);
        return Promise.resolve();
      });
      await expect(service.logout()).resolves.toBeUndefined();
    });

    it('rejects with the Firebase error when sign-out fails', async () => {
      const failure = { code: 'auth/network-request-failed' };
      signOut.mockRejectedValue(failure);
      await expect(service.logout()).rejects.toBe(failure);
    });
  });

  describe('userName', () => {
    it('is empty until Firebase reports a user', () => {
      expect(service.userName()).toBe('');
    });

    it('is the display name of the signed-in user', () => {
      authState.next({ uid: 'u1', displayName: 'Sam' } as User);
      expect(service.userName()).toBe('Sam');
    });

    it('is empty when nobody is signed in', () => {
      authState.next(null);
      expect(service.userName()).toBe('');
    });

    it('shows the name from signup straight away, although Firebase does not announce profile changes', async () => {
      const user = { uid: 'u1', displayName: null } as unknown as User;
      authState.next(user);
      expect(service.userName()).toBe('');
      createUser.mockResolvedValue({ user });
      updateProfile.mockImplementation((target: User, profile: { displayName: string }) => {
        (target as { displayName: string | null }).displayName = profile.displayName;
        return Promise.resolve();
      });
      await service.signup('Sam', 'a@b.com', 'secret1');
      expect(service.userName()).toBe('Sam');
    });
  });

  describe('signup', () => {
    it('creates the account, then saves the user name as the display name', async () => {
      createUser.mockResolvedValue(credential);
      updateProfile.mockResolvedValue(undefined);
      await expect(service.signup('Sam', 'a@b.com', 'secret1')).resolves.toBe(credential);
      expect(createUser).toHaveBeenCalledExactlyOnceWith(fakeAuth, 'a@b.com', 'secret1');
      expect(updateProfile).toHaveBeenCalledExactlyOnceWith(credential.user, { displayName: 'Sam' });
    });

    it('calls Firebase inside an injection context, which AngularFire requires', async () => {
      const needsContext = () => {
        inject(Auth);
        return Promise.resolve(credential);
      };
      createUser.mockImplementation(needsContext);
      updateProfile.mockImplementation(needsContext);
      await expect(service.signup('Sam', 'a@b.com', 'secret1')).resolves.toBe(credential);
    });

    it('rejects with the Firebase error and skips the profile when creation fails', async () => {
      const failure = { code: 'auth/email-already-in-use' };
      createUser.mockRejectedValue(failure);
      await expect(service.signup('Sam', 'a@b.com', 'secret1')).rejects.toBe(failure);
      expect(updateProfile).not.toHaveBeenCalled();
    });
  });
});
