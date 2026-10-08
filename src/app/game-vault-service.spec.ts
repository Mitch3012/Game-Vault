import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { GameVaultCrudService } from './game-vault-crud-service';
import { GameEntryWithId } from './game-vault-interface';
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
  const crud = { games: signal<GameEntryWithId[] | null>([savedGame]), create: vi.fn() };
  const rawg = { search: () => signal([]), getGame: vi.fn() };
  let service: GameVaultService;

  beforeEach(() => {
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
});
