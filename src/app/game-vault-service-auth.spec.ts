import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { SuggestionsService } from './ai/suggestions-service';
import { Authservice } from './auth/auth-service';
import { GameVaultCrudService } from './game-vault-crud-service';
import { LOGOUT_ERROR_MESSAGE } from './game-vault.constants';
import { GameVaultService } from './game-vault-service';
import { RawgService } from './rawg-service';

/** The login, logout and signup parts of the facade. */
describe('GameVaultService auth flows', () => {
  const auth = {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    signedIn: signal<boolean | null>(true),
    userName: signal('Sam'),
  };
  const router = { navigateByUrl: vi.fn() };
  const suggestions = {
    enabled: signal(false),
    suggestions: signal([]),
    failed: signal(false),
    vaultEmpty: signal(false),
    setEnabled: vi.fn(),
    refresh: vi.fn(),
  };
  let service: GameVaultService;

  beforeEach(() => {
    auth.login.mockReset();
    auth.signup.mockReset();
    auth.logout.mockReset();
    auth.signedIn.set(true);
    router.navigateByUrl.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: GameVaultCrudService, useValue: { games: signal([]) } },
        { provide: RawgService, useValue: { search: () => signal([]) } },
        { provide: Authservice, useValue: auth },
        { provide: Router, useValue: router },
        { provide: SuggestionsService, useValue: suggestions },
      ],
    });
    service = TestBed.inject(GameVaultService);
  });

  describe('login', () => {
    const badCredentials = { code: 'auth/invalid-credential' };

    it('starts with no login error and nothing pending', () => {
      expect(service.loginError()).toBe('');
      expect(service.loginPending()).toBe(false);
    });

    it('signs in with the given credentials, then goes to the home page', async () => {
      auth.login.mockResolvedValue({});
      await expect(service.login('a@b.com', 'secret')).resolves.toBe(true);
      expect(auth.login).toHaveBeenCalledWith('a@b.com', 'secret');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('is pending only while the sign-in is in flight', async () => {
      let finish: (value: unknown) => void = () => undefined;
      auth.login.mockReturnValue(new Promise((resolve) => (finish = resolve)));
      const attempt = service.login('a@b.com', 'secret');
      expect(service.loginPending()).toBe(true);
      finish({});
      await attempt;
      expect(service.loginPending()).toBe(false);
    });

    it('sets a friendly error, stays put, and does not reject when sign-in fails', async () => {
      auth.login.mockRejectedValue(badCredentials);
      await expect(service.login('a@b.com', 'wrong')).resolves.toBe(false);
      expect(service.loginError()).toBe('Incorrect email or password.');
      expect(router.navigateByUrl).not.toHaveBeenCalled();
      expect(service.loginPending()).toBe(false);
    });

    it('clears an earlier error when the next attempt succeeds', async () => {
      auth.login.mockRejectedValueOnce(badCredentials).mockResolvedValue({});
      await service.login('a@b.com', 'wrong');
      await service.login('a@b.com', 'right');
      expect(service.loginError()).toBe('');
    });

    it('clears the login error on request', async () => {
      auth.login.mockRejectedValue(badCredentials);
      await service.login('a@b.com', 'wrong');
      service.clearLoginError();
      expect(service.loginError()).toBe('');
    });
  });

  describe('logout', () => {
    it('exposes whether a user is signed in', () => {
      expect(service.signedIn()).toBe(true);
      auth.signedIn.set(false);
      expect(service.signedIn()).toBe(false);
    });

    it('signs out, then goes to the login form', async () => {
      auth.logout.mockResolvedValue(undefined);
      await service.logout();
      expect(auth.logout).toHaveBeenCalledOnce();
      expect(router.navigateByUrl).toHaveBeenCalledExactlyOnceWith('/auth');
    });

    it('sets an error, stays put, and does not reject when sign-out fails', async () => {
      auth.logout.mockRejectedValue(new Error('offline'));
      await expect(service.logout()).resolves.toBeUndefined();
      expect(service.actionError()).toBe(LOGOUT_ERROR_MESSAGE);
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('signup', () => {
    const emailTaken = { code: 'auth/email-already-in-use' };

    it('starts with no signup error and nothing pending', () => {
      expect(service.signupError()).toBe('');
      expect(service.signupPending()).toBe(false);
    });

    it('creates the account with the given details, then goes to the home page', async () => {
      auth.signup.mockResolvedValue({});
      await expect(service.signup('Sam', 'a@b.com', 'secret1')).resolves.toBe(true);
      expect(auth.signup).toHaveBeenCalledWith('Sam', 'a@b.com', 'secret1');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('is pending only while the signup is in flight', async () => {
      let finish: (value: unknown) => void = () => undefined;
      auth.signup.mockReturnValue(new Promise((resolve) => (finish = resolve)));
      const attempt = service.signup('Sam', 'a@b.com', 'secret1');
      expect(service.signupPending()).toBe(true);
      finish({});
      await attempt;
      expect(service.signupPending()).toBe(false);
    });

    it('sets a friendly error, stays put, and does not reject when signup fails', async () => {
      auth.signup.mockRejectedValue(emailTaken);
      await expect(service.signup('Sam', 'a@b.com', 'secret1')).resolves.toBe(false);
      expect(service.signupError()).toBe('An account with that email already exists.');
      expect(router.navigateByUrl).not.toHaveBeenCalled();
      expect(service.signupPending()).toBe(false);
    });

    it('keeps the signup and login errors separate', async () => {
      auth.signup.mockRejectedValue(emailTaken);
      await service.signup('Sam', 'a@b.com', 'secret1');
      expect(service.loginError()).toBe('');
    });

    it('clears the signup error on request', async () => {
      auth.signup.mockRejectedValue(emailTaken);
      await service.signup('Sam', 'a@b.com', 'secret1');
      service.clearSignupError();
      expect(service.signupError()).toBe('');
    });
  });
});
