import { Service, Signal, computed, inject, resource, signal, untracked } from '@angular/core';

import { GameVaultCrudService } from '../game-vault-crud-service';
import { GameEntryWithId, NewGameEntry } from '../game-vault-interface';
import { RawgService } from '../rawg-service';
import { AiService } from './ai-service';
import {
  AiPick,
  Suggested,
  buildSuggestionPrompt,
  normalizeAsk,
  parsePicks,
  toSuggested,
  vaultStateOf,
} from './suggestions-helpers';
import { SUGGESTION_COUNT } from './suggestions.constants';

/**
 * Suggests games from the vault and/or a request in the user's own words. Reads the vault from the
 * CRUD service, not the facade (the facade points to this service, so injecting it here would be circular).
 */
@Service()
export class SuggestionsService {
  private readonly crud = inject(GameVaultCrudService);
  private readonly ai = inject(AiService);
  private readonly rawg = inject(RawgService);
  private readonly isOn = signal(false);
  private readonly askedState = signal('');
  private readonly refreshCount = signal(0);
  private readonly vaultState = computed(() => vaultStateOf(this.crud.games()));

  // The vault is read untracked: adding a game must not ask the AI again. Only the switch, a request,
  // the vault going empty / non-empty (when nothing is asked), or a refresh does.
  private readonly request = computed(() => {
    const asked = this.askedState();
    const state = this.vaultState();
    if (!this.isOn() || state === 'loading' || (state === 'empty' && !asked)) return undefined;
    return { refresh: this.refreshCount(), asked, games: untracked(this.crud.games) ?? [] };
  });

  private readonly resolved = resource({
    params: () => this.request(),
    loader: ({ params }) => this.load(params.games, params.asked),
  });

  readonly enabled = this.isOn.asReadonly();

  /** The user's current request, cleaned up. `''` = none. */
  readonly asked = this.askedState.asReadonly();

  // `null` = loading, `[]` = nothing to show (off, empty vault, failed or none found).
  private readonly items: Signal<Suggested[] | null> = computed(() => {
    if (!this.isOn()) return [];
    if (this.vaultState() === 'loading' || this.resolved.isLoading()) return null;
    if (this.resolved.error()) return [];
    return this.resolved.value() ?? [];
  });

  /** Suggested games. `null` = loading, `[]` = nothing to show. */
  readonly suggestions: Signal<NewGameEntry[] | null> = computed(() => this.items()?.map((item) => item.game) ?? null);

  /** The AI's reason for each suggestion, by RAWG id. `''` = it gave none. */
  readonly reasons: Signal<ReadonlyMap<number, string>> = computed(
    () => new Map((this.items() ?? []).map((item) => [item.game.rawgId, item.reason])),
  );

  /** `true` when the AI request failed. */
  readonly failed = computed(() => this.isOn() && !!this.resolved.error());

  /** `true` when there is nothing to base suggestions on: an empty vault and no request. */
  readonly vaultEmpty = computed(() => this.vaultState() === 'empty' && !this.askedState());

  setEnabled(on: boolean): void {
    this.isOn.set(on);
    if (!on) this.askedState.set('');
  }

  /** Asks for games matching the request. A blank request clears it. Asking twice asks the AI twice. */
  ask(text: string): void {
    this.askedState.set(normalizeAsk(text));
    this.refresh();
  }

  clearAsk(): void {
    this.ask('');
  }

  refresh(): void {
    this.refreshCount.update((count) => count + 1);
  }

  private async load(games: GameEntryWithId[], asked: string): Promise<Suggested[]> {
    try {
      const reply = await this.ai.generate(buildSuggestionPrompt(games, SUGGESTION_COUNT, asked));
      return await this.resolvePicks(parsePicks(reply).slice(0, SUGGESTION_COUNT), games);
    } catch (error) {
      console.error('[SuggestionsService]', error);
      throw error;
    }
  }

  private async resolvePicks(picks: AiPick[], games: GameEntryWithId[]): Promise<Suggested[]> {
    const found = await Promise.all(
      picks.map(async (pick) => ({ game: await this.rawg.findByTitle(pick.title), reason: pick.reason })),
    );
    return toSuggested(found, new Set(games.map((game) => game.rawgId)));
  }
}
