import { Service, inject, signal } from '@angular/core';

import { GameVaultCrudService } from './game-vault-crud-service';
import { GameEntryChanges, GameEntryWithId, GameStatus } from './game-vault-interface';
import { ADD_ERROR_MESSAGE, REMOVE_ERROR_MESSAGE } from './game-vault.constants';
import { RawgService } from './rawg-service';

export const findByRawgId = (games: GameEntryWithId[] | null, rawgId: number): GameEntryWithId | undefined =>
  games?.find((game) => game.rawgId === rawgId);

/** Facade: the only service components talk to. */
@Service()
export class GameVaultService {
  private readonly crud = inject(GameVaultCrudService);
  private readonly rawg = inject(RawgService);
  private readonly error = signal('');

  readonly searchTerm = signal('');

  /** RAWG search results. `null` = loading, `[]` = nothing to show. */
  readonly searchResults = this.rawg.search(() => this.searchTerm());

  /** Saved games. `null` = loading, `[]` = empty vault. */
  readonly games = this.crud.games;

  /** Message for the last failed add or remove. `''` = no error. */
  readonly actionError = this.error.asReadonly();

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  clearActionError(): void {
    this.error.set('');
  }

  /** Saves the game. Resolves with its document id, or `undefined` (and sets `actionError`) on failure. */
  addToVault(rawgId: number, status: GameStatus = 'wishlist'): Promise<string | undefined> {
    return this.attempt(() => this.saveFromRawg(rawgId, status), ADD_ERROR_MESSAGE);
  }

  updateGame(id: string, changes: GameEntryChanges): Promise<void> {
    return this.crud.update(id, changes);
  }

  /** Deletes the game. Never rejects: a failure sets `actionError` instead. */
  async removeGame(id: string): Promise<void> {
    await this.attempt(() => this.crud.delete(id), REMOVE_ERROR_MESSAGE);
  }

  // Fetches the game from RAWG and saves it. Resolves with the existing id if already saved.
  private async saveFromRawg(rawgId: number, status: GameStatus): Promise<string> {
    const existing = findByRawgId(this.games(), rawgId);
    if (existing) return existing.id;
    const entry = await this.rawg.getGame(rawgId);
    return this.crud.create({ ...entry, status });
  }

  private async attempt<T>(action: () => Promise<T>, message: string): Promise<T | undefined> {
    try {
      const result = await action();
      this.clearActionError();
      return result;
    } catch (error) {
      console.error('[GameVaultService]', message, error);
      this.error.set(message);
      return undefined;
    }
  }
}
