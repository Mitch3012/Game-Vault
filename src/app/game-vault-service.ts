import { Service, inject, signal } from '@angular/core';

import {
  GameEntryChanges,
  GameEntryWithId,
  GameStatus,
  GameVaultCrudService,
} from './game-vault-crud-service';
import { RawgService } from './rawg-service';

export const findByRawgId = (games: GameEntryWithId[] | null, rawgId: number): GameEntryWithId | undefined =>
  games?.find((game) => game.rawgId === rawgId);

/** Facade: the only service components talk to. */
@Service()
export class GameVaultService {
  private readonly crud = inject(GameVaultCrudService);
  private readonly rawg = inject(RawgService);

  readonly searchTerm = signal('');

  /** RAWG search results. `null` = loading, `[]` = nothing to show. */
  readonly searchResults = this.rawg.search(() => this.searchTerm());

  /** Saved games. `null` = loading, `[]` = empty vault. */
  readonly games = this.crud.games;

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  /** Fetches the game from RAWG and saves it. Resolves with the document id (existing id if already saved). */
  async addToVault(rawgId: number, status: GameStatus = 'wishlist'): Promise<string> {
    const existing = findByRawgId(this.games(), rawgId);
    if (existing) return existing.id;
    const entry = await this.rawg.getGame(rawgId);
    return this.crud.create({ ...entry, status });
  }

  updateGame(id: string, changes: GameEntryChanges): Promise<void> {
    return this.crud.update(id, changes);
  }

  removeGame(id: string): Promise<void> {
    return this.crud.delete(id);
  }
}
