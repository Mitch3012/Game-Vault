import { Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NewGameEntry } from '../game-vault-crud-service';
import { formatList, releaseYear } from './game-card-helpers';
import { ADD_COOLDOWN_MS } from './game-card.constants';

/** UI only. Shows one game; the parent decides what Add and Remove do. */
@Component({
  imports: [RouterLink],
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

  private readonly destroyRef = inject(DestroyRef);

  /** True for a moment after Add is clicked. */
  protected readonly adding = signal(false);

  protected readonly year = computed(() => releaseYear(this.game().releaseDate));
  protected readonly genres = computed(() => formatList(this.game().genres));
  protected readonly platforms = computed(() => formatList(this.game().platforms, 4));

  protected onAdd(): void {
    if (this.adding()) return;
    this.adding.set(true);
    this.add.emit(this.game().rawgId);
    const timer = setTimeout(() => this.adding.set(false), ADD_COOLDOWN_MS);
    this.destroyRef.onDestroy(() => clearTimeout(timer));
  }

  protected onRemove(): void {
    const id = this.savedId();
    if (!id) return;
    this.remove.emit(id);
  }
}
