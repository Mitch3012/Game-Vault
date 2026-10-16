import { Component, computed, input, output } from '@angular/core';

import { GameCard } from '../../game-card/game-card';
import { NewGameEntry } from '../../game-vault-interface';
import { StateMessage } from '../../state-message/state-message';
import { suggestionsMessage } from '../suggestions-helpers';

/** UI only. Shows suggested games, or a status message; the parent decides what Add, Remove and Refresh do. */
@Component({
  imports: [GameCard, StateMessage],
  selector: 'app-suggestions',
  styleUrl: './suggestions.css',
  templateUrl: './suggestions.html',
})
export class Suggestions {
  /** `null` = loading, `[]` = nothing to show. */
  readonly games = input.required<NewGameEntry[] | null>();
  readonly failed = input.required<boolean>();
  readonly vaultEmpty = input.required<boolean>();
  /** RAWG id to Firestore document id, for games already in the vault. */
  readonly savedIds = input.required<Map<number, string>>();

  readonly add = output<number>();
  readonly remove = output<string>();
  readonly refresh = output<void>();

  protected readonly message = computed(() =>
    suggestionsMessage({ games: this.games(), failed: this.failed(), vaultEmpty: this.vaultEmpty() }),
  );
  protected readonly canRefresh = computed(() => this.games() !== null && !this.vaultEmpty());
}
