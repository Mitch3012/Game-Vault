import { Component, input, output } from '@angular/core';

import { GameCard } from '../../game-card/game-card';
import { NewGameEntry } from '../../game-vault-interface';

/** UI only. A game card with the AI's reason underneath; the parent decides what Add and Remove do. */
@Component({
  imports: [GameCard],
  selector: 'app-suggestion-card',
  styleUrl: './suggestion-card.css',
  templateUrl: './suggestion-card.html',
})
export class SuggestionCard {
  readonly game = input.required<NewGameEntry>();
  /** Firestore document id when the game is already in the vault, otherwise null. */
  readonly savedId = input<string | null>(null);
  /** The AI's one-line reason. `''` = it gave none. */
  readonly reason = input<string>('');

  readonly add = output<number>();
  readonly remove = output<string>();
}
