import { Component, computed, input, output } from '@angular/core';

import { NewGameEntry } from '../../game-vault-interface';
import { StateMessage } from '../../state-message/state-message';
import { AskChip } from '../ask-chip/ask-chip';
import { SuggestionCard } from '../suggestion-card/suggestion-card';
import { suggestionsMessage } from '../suggestions-helpers';
import { ASK_EXAMPLES, ASK_PLACEHOLDER, MAX_ASK_CHARS } from '../suggestions.constants';

/** UI only. Shows suggested games, or a status message; the parent decides what Add, Remove, Ask and Refresh do. */
@Component({
  imports: [AskChip, StateMessage, SuggestionCard],
  selector: 'app-suggestions',
  styleUrl: './suggestions.css',
  templateUrl: './suggestions.html',
})
export class Suggestions {
  /** The heading, e.g. "Suggested for Sam". */
  readonly title = input.required<string>();
  /** `null` = loading, `[]` = nothing to show. */
  readonly games = input.required<NewGameEntry[] | null>();
  readonly failed = input.required<boolean>();
  readonly vaultEmpty = input.required<boolean>();
  /** The user's current request to the AI. `''` = none. */
  readonly asked = input.required<string>();
  /** The AI's reason for each suggestion, by RAWG id. */
  readonly reasons = input.required<ReadonlyMap<number, string>>();
  /** RAWG id to Firestore document id, for games already in the vault. */
  readonly savedIds = input.required<Map<number, string>>();

  readonly add = output<number>();
  readonly remove = output<string>();
  readonly refresh = output<void>();
  readonly ask = output<string>();
  readonly clearAsk = output<void>();

  protected readonly examples = ASK_EXAMPLES;
  protected readonly placeholder = ASK_PLACEHOLDER;
  protected readonly maxLength = MAX_ASK_CHARS;

  protected readonly message = computed(() =>
    suggestionsMessage({ games: this.games(), failed: this.failed(), vaultEmpty: this.vaultEmpty() }),
  );
  protected readonly canRefresh = computed(() => this.games() !== null && !this.vaultEmpty());
  protected readonly canAsk = computed(() => this.games() !== null);

  protected onSubmit(event: Event, box: HTMLInputElement): void {
    event.preventDefault();
    this.ask.emit(box.value);
  }
}
