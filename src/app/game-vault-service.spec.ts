import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { Authservice } from './auth/auth-service';
import { GameVaultCrudService } from './game-vault-crud-service';
import { GameEntryWithId } from './game-vault-interface';
import { ADD_ERROR_MESSAGE, REMOVE_ERROR_MESSAGE } from './game-vault.constants';
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
  const auth = { login: vi.fn() };
  const router = { navigateByUrl: vi.fn() };
  let service: GameVaultService;

  beforeEach(() => {
    crud.create.mockReset();
    crud.delete.mockReset();
    rawg.getGame.mockReset();
    auth.login.mockReset();
    router.navigateByUrl.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: GameVaultCrudService, useValue: crud },
        { provide: RawgService, useValue: rawg },
        { provide: Authservice, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
    service = TestBed.inject(GameVaultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns the existing id instead of saving a duplicate', async () => {
    expect(await service.addToVault(42)).toBe('doc1');
    expect(rawg.getGame).not.toHaveBeenCalled();
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
});
