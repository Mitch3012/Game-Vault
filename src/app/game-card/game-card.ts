import { Component, computed, input, output } from '@angular/core';

import { NewGameEntry } from '../game-vault-crud-service';
import { formatList, releaseYear } from './game-card-helpers';

/** UI only. Shows one game; the parent decides what Add and Remove do. */
@Component({
  imports: [],
  selector: 'app-game-card',
  styleUrl: './game-card.css',
  templateUrl: './game-card.html',
})
export class GameCard {
  readonly game = input.required<NewGameEntry>();
  /** Firestore document id when the game is already in the vault, otherwise null. */
  readonly savedId = input<string | null>(null);

  readonly add = output<number>();
  readonly remove = output<string>();

  protected readonly year = computed(() => releaseYear(this.game().releaseDate));
  protected readonly genres = computed(() => formatList(this.game().genres));
  protected readonly platforms = computed(() => formatList(this.game().platforms, 4));

  protected onAdd(): void {
    this.add.emit(this.game().rawgId);
  }

  protected onRemove(): void {
    const id = this.savedId();
    if (!id) return;
    this.remove.emit(id);
  }
}
