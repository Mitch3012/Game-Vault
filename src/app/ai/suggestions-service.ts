import { Service, Signal, computed, inject, resource, signal, untracked } from '@angular/core';

import { GameVaultCrudService } from '../game-vault-crud-service';
import { GameEntryWithId, NewGameEntry } from '../game-vault-interface';
import { RawgService } from '../rawg-service';
import { AiService } from './ai-service';
import {
  buildSuggestionPrompt,
  compact,
  excludeSaved,
  parseTitles,
  uniqueByRawgId,
  vaultStateOf,
} from './suggestions-helpers';
import { SUGGESTION_COUNT } from './suggestions.constants';

/**
 * Suggests games from the vault. Reads the vault from the CRUD service, not the facade
 * (the facade points to this service, so injecting it here would be circular).
 */
@Service()
export class SuggestionsService {
  private readonly crud = inject(GameVaultCrudService);
  private readonly ai = inject(AiService);
  private readonly rawg = inject(RawgService);
  private readonly isOn = signal(false);
  private readonly refreshCount = signal(0);
  private readonly vaultState = computed(() => vaultStateOf(this.crud.games()));

  // The vault is read untracked: adding a game must not ask the AI again.
  // Only the switch, the vault going empty / non-empty, or a refresh does.
  private readonly request = computed(() => {
    if (!this.isOn() || this.vaultState() !== 'ready') return undefined;
    return { refresh: this.refreshCount(), games: untracked(this.crud.games) ?? [] };
  });

  private readonly resolved = resource({
    params: () => this.request(),
    loader: ({ params }) => this.load(params.games),
  });

  readonly enabled = this.isOn.asReadonly();

  /** Suggested games. `null` = loading, `[]` = nothing to show (off, empty vault, failed or none found). */
  readonly suggestions: Signal<NewGameEntry[] | null> = computed(() => {
    if (!this.isOn()) return [];
    if (this.vaultState() === 'loading' || this.resolved.isLoading()) return null;
    if (this.resolved.error()) return [];
    return this.resolved.value() ?? [];
  });

  /** `true` when the last AI request failed. */
  readonly failed = computed(() => this.isOn() && !!this.resolved.error());

  /** `true` when the vault has no games, so there is nothing to base suggestions on. */
  readonly vaultEmpty = computed(() => this.vaultState() === 'empty');

  setEnabled(on: boolean): void {
    this.isOn.set(on);
  }

  refresh(): void {
    this.refreshCount.update((count) => count + 1);
  }

  private async load(games: GameEntryWithId[]): Promise<NewGameEntry[]> {
    try {
      const reply = await this.ai.generate(buildSuggestionPrompt(games));
      return await this.resolveTitles(parseTitles(reply).slice(0, SUGGESTION_COUNT), games);
    } catch (error) {
      console.error('[SuggestionsService]', error);
      throw error;
    }
  }

  private async resolveTitles(titles: string[], games: GameEntryWithId[]): Promise<NewGameEntry[]> {
    const found = await Promise.all(titles.map((title) => this.rawg.findByTitle(title)));
    return excludeSaved(uniqueByRawgId(compact(found)), new Set(games.map((game) => game.rawgId)));
  }
}
