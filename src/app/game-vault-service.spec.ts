import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

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
  let service: GameVaultService;

  beforeEach(() => {
    crud.create.mockReset();
    crud.delete.mockReset();
    rawg.getGame.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: GameVaultCrudService, useValue: crud },
        { provide: RawgService, useValue: rawg },
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
});
