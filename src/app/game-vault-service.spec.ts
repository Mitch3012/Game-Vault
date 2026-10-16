import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { SuggestionsService } from './ai/suggestions-service';
import { Authservice } from './auth/auth-service';
import { GameVaultCrudService } from './game-vault-crud-service';
import { GameEntryWithId, NewGameEntry } from './game-vault-interface';
import { ADD_ERROR_MESSAGE, REMOVE_ERROR_MESSAGE } from './game-vault.constants';
import { GameVaultService, findByRawgId } from './game-vault-service';
import { RawgService } from './rawg-service';
import { TransferService } from './transfer/transfer-service';
import { ImportPreview } from './transfer/transfer-interface';

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
    suggestions: signal<NewGameEntry[] | null>([]),
    failed: signal(false),
    vaultEmpty: signal(false),
    asked: signal(''),
    reasons: signal<ReadonlyMap<number, string>>(new Map()),
    setEnabled: vi.fn(),
    refresh: vi.fn(),
    ask: vi.fn(),
    clearAsk: vi.fn(),
  };
  const transfer = {
    preview: signal<ImportPreview | null>(null),
    busy: signal(false),
    message: signal(''),
    canExport: signal(true),
    canImport: signal(true),
    exportVault: vi.fn(),
    chooseFile: vi.fn(),
    confirmImport: vi.fn(),
    cancelImport: vi.fn(),
  };
  let service: GameVaultService;

  beforeEach(() => {
    suggestions.setEnabled.mockReset();
    suggestions.refresh.mockReset();
    suggestions.ask.mockReset();
    suggestions.clearAsk.mockReset();
    crud.create.mockReset();
    crud.delete.mockReset();
    rawg.getGame.mockReset();
    auth.login.mockReset();
    auth.signup.mockReset();
    auth.logout.mockReset();
    auth.signedIn.set(true);
    crud.games.set([savedGame]);
    router.navigateByUrl.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: GameVaultCrudService, useValue: crud },
        { provide: RawgService, useValue: rawg },
        { provide: Authservice, useValue: auth },
        { provide: Router, useValue: router },
        { provide: SuggestionsService, useValue: suggestions },
        { provide: TransferService, useValue: transfer },
      ],
    });
    service = TestBed.inject(GameVaultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('vault export and import', () => {
    beforeEach(() => {
      transfer.exportVault.mockReset();
      transfer.chooseFile.mockReset();
      transfer.confirmImport.mockReset();
      transfer.cancelImport.mockReset();
    });

    it('exposes the transfer state from the transfer service', () => {
      expect(service.transferPreview).toBe(transfer.preview);
      expect(service.transferBusy).toBe(transfer.busy);
      expect(service.transferMessage).toBe(transfer.message);
      expect(service.transferCanExport).toBe(transfer.canExport);
      expect(service.transferCanImport).toBe(transfer.canImport);
    });

    it('exports through the transfer service', () => {
      service.exportVault();
      expect(transfer.exportVault).toHaveBeenCalledOnce();
    });

    it('hands the chosen file to the transfer service', async () => {
      const file = new File(['{}'], 'friend.json');
      await service.chooseImportFile(file);
      expect(transfer.chooseFile).toHaveBeenCalledExactlyOnceWith(file);
    });

    it('confirms and cancels through the transfer service', async () => {
      await service.confirmImport();
      service.cancelImport();
      expect(transfer.confirmImport).toHaveBeenCalledOnce();
      expect(transfer.cancelImport).toHaveBeenCalledOnce();
    });
  });

  describe('AI suggestions', () => {
    it('exposes the suggestions state from the suggestions service', () => {
      expect(service.aiEnabled).toBe(suggestions.enabled);
      expect(service.suggestions).toBe(suggestions.suggestions);
      expect(service.suggestionsFailed).toBe(suggestions.failed);
      expect(service.suggestionsVaultEmpty).toBe(suggestions.vaultEmpty);
      expect(service.suggestionsAsked).toBe(suggestions.asked);
      expect(service.suggestionsReasons).toBe(suggestions.reasons);
    });

    it('turns the AI on and off through the suggestions service', () => {
      service.setAiEnabled(true);
      expect(suggestions.setEnabled).toHaveBeenCalledExactlyOnceWith(true);
    });

    it('asks and clears the request through the suggestions service', () => {
      service.askSuggestions('something cozy');
      service.clearSuggestionsAsk();
      expect(suggestions.ask).toHaveBeenCalledExactlyOnceWith('something cozy');
      expect(suggestions.clearAsk).toHaveBeenCalledOnce();
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

    it('shows the login prompt instead of saving, and does not redirect', async () => {
      await expect(service.addToVault(99)).resolves.toBeUndefined();
      expect(service.loginPromptVisible()).toBe(true);
      expect(router.navigateByUrl).not.toHaveBeenCalled();
      expect(crud.create).not.toHaveBeenCalled();
      expect(rawg.getGame).not.toHaveBeenCalled();
    });

    it('does not set an action error', async () => {
      await service.addToVault(99);
      expect(service.actionError()).toBe('');
    });

    it('hides the login prompt on request', async () => {
      await service.addToVault(99);
      service.dismissLoginPrompt();
      expect(service.loginPromptVisible()).toBe(false);
    });

    it('hides the login prompt once the user signs in', async () => {
      await service.addToVault(99);
      auth.signedIn.set(true);
      expect(service.loginPromptVisible()).toBe(false);
    });
  });

  it('shows no login prompt until a logged-out user tries to add a game', () => {
    auth.signedIn.set(false);
    expect(service.loginPromptVisible()).toBe(false);
  });

  it('does not show the login prompt while it is unknown whether the user is signed in', async () => {
    auth.signedIn.set(null);
    await service.addToVault(99);
    expect(service.loginPromptVisible()).toBe(false);
  });

  it('does nothing while the vault is still loading, so a game cannot be saved twice', async () => {
    crud.games.set(null);
    await expect(service.addToVault(99)).resolves.toBeUndefined();
    expect(rawg.getGame).not.toHaveBeenCalled();
    expect(crud.create).not.toHaveBeenCalled();
  });

  it('exposes the signed-in user name', () => {
    expect(service.userName()).toBe('Sam');
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
});
