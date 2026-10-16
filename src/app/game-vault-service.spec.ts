import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { SuggestionsService } from './ai/suggestions-service';
import { Authservice } from './auth/auth-service';
import { GameVaultCrudService } from './game-vault-crud-service';
import { GameEntryWithId, NewGameEntry } from './game-vault-interface';
import { ADD_ERROR_MESSAGE, LOGOUT_ERROR_MESSAGE, REMOVE_ERROR_MESSAGE } from './game-vault.constants';
import { GameVaultService, findByRawgId } from './game-vault-service';
import { RawgService } from './rawg-service';

const savedGame = { id: 'doc1', rawgId: 42 } as GameEntryWithId;

describe('findByRawgId', () => {
  it('returns undefined while the vault is loading', () => {
    expect(findByRawgId(null, 42)).toBeUndefined();
  });

  it('finds a saved game by its RAWG id', () => {
    expect(findByRawgId([savedGame], 42)).toBe(savedGame);
  });
});

describe('GameVaultService', () => {
  const crud = { games: signal<GameEntryWithId[] | null>([savedGame]), create: vi.fn(), delete: vi.fn() };
  const rawg = { search: () => signal([]), getGame: vi.fn() };
  const auth = { login: vi.fn(), signup: vi.fn(), logout: vi.fn(), signedIn: signal<boolean | null>(true) };
  const router = { navigateByUrl: vi.fn() };
  const suggestions = {
    enabled: signal(false),
    suggestions: signal<NewGameEntry[] | null>([]),
    failed: signal(false),
    vaultEmpty: signal(false),
    setEnabled: vi.fn(),
    refresh: vi.fn(),
  };
  let service: GameVaultService;

  beforeEach(() => {
    suggestions.setEnabled.mockReset();
    suggestions.refresh.mockReset();
    crud.create.mockReset();
    crud.delete.mockReset();
    rawg.getGame.mockReset();
    auth.login.mockReset();
    auth.signup.mockReset();
    auth.logout.mockReset();
    auth.signedIn.set(true);
    router.navigateByUrl.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: GameVaultCrudService, useValue: crud },
        { provide: RawgService, useValue: rawg },
        { provide: Authservice, useValue: auth },
        { provide: Router, useValue: router },
        { provide: SuggestionsService, useValue: suggestions },
      ],
    });
    service = TestBed.inject(GameVaultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('AI suggestions', () => {
    it('exposes the suggestions state from the suggestions service', () => {
      expect(service.aiEnabled).toBe(suggestions.enabled);
      expect(service.suggestions).toBe(suggestions.suggestions);
      expect(service.suggestionsFailed).toBe(suggestions.failed);
      expect(service.suggestionsVaultEmpty).toBe(suggestions.vaultEmpty);
    });

    it('turns the AI on and off through the suggestions service', () => {
      service.setAiEnabled(true);
      expect(suggestions.setEnabled).toHaveBeenCalledExactlyOnceWith(true);
    });

    it('refreshes through the suggestions service', () => {
      service.refreshSuggestions();
      expect(suggestions.refresh).toHaveBeenCalledOnce();
    });
  });

  it('returns the existing id instead of saving a duplicate', async () => {
    expect(await service.addToVault(42)).toBe('doc1');
    expect(rawg.getGame).not.toHaveBeenCalled();
  });

  describe('addToVault when the user is not signed in', () => {
    beforeEach(() => auth.signedIn.set(false));

    it('goes to the login form instead of saving', async () => {
      await expect(service.addToVault(99)).resolves.toBeUndefined();
      expect(router.navigateByUrl).toHaveBeenCalledExactlyOnceWith('/auth');
      expect(crud.create).not.toHaveBeenCalled();
      expect(rawg.getGame).not.toHaveBeenCalled();
    });

    it('does not set an action error', async () => {
      await service.addToVault(99);
      expect(service.actionError()).toBe('');
    });
  });

  it('does nothing while it is still unknown whether the user is signed in', async () => {
    auth.signedIn.set(null);
    await expect(service.addToVault(99)).resolves.toBeUndefined();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(crud.create).not.toHaveBeenCalled();
  });

  it('has no action error to begin with', () => {
    expect(service.actionError()).toBe('');
  });

  it('sets an add error, and does not reject, when adding fails', async () => {
    rawg.getGame.mockRejectedValue(new Error('rawg down'));
    await expect(service.addToVault(99)).resolves.toBeUndefined();
    expect(service.actionError()).toBe(ADD_ERROR_MESSAGE);
  });

  it('sets a remove error, and does not reject, when removing fails', async () => {
    crud.delete.mockRejectedValue(new Error('permission-denied'));
    await expect(service.removeGame('doc1')).resolves.toBeUndefined();
    expect(service.actionError()).toBe(REMOVE_ERROR_MESSAGE);
  });

  it('clears the error after the next action succeeds', async () => {
    crud.delete.mockRejectedValueOnce(new Error('boom'));
    await service.removeGame('doc1');
    crud.delete.mockResolvedValue(undefined);
    await service.removeGame('doc1');
    expect(service.actionError()).toBe('');
  });

  it('clears the error on request', async () => {
    crud.delete.mockRejectedValue(new Error('boom'));
    await service.removeGame('doc1');
    service.clearActionError();
    expect(service.actionError()).toBe('');
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

  describe('homeRoute', () => {
    it('is home when signed in', () => {
      auth.signedIn.set(true);
      expect(service.homeRoute()).toBe('/');
    });

    it('is the login page when signed out', () => {
      auth.signedIn.set(false);
      expect(service.homeRoute()).toBe('/auth');
    });

    it('is the login page while it is unknown', () => {
      auth.signedIn.set(null);
      expect(service.homeRoute()).toBe('/auth');
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
