import { Component, computed, inject, input, linkedSignal, signal, untracked } from '@angular/core';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';

import { GameVaultService } from '../game-vault-service';
import { StarRating } from '../star-rating/star-rating';
import { StateMessage } from '../state-message/state-message';
import { FormModel, findById, toChanges, toFormModel } from './form-helpers';
import { GAME_LIST_URL, SAVE_ERROR_MESSAGE, STATUS_OPTIONS } from './form.constants';

/** Edit the details of a saved game (status, rating, notes). Route: /form/:id */
@Component({
  imports: [FormField, FormRoot, RouterLink, StarRating, StateMessage],
  selector: 'app-form',
  styleUrl: './form.css',
  templateUrl: './form.html',
})
export class Form {
  private readonly vault = inject(GameVaultService);
  private readonly router = inject(Router);

  /** Bound from the route parameter. */
  readonly id = input.required<string>();

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly isLoading = computed(() => this.vault.games() === null);
  protected readonly game = computed(() => findById(this.vault.games(), this.id()));
  protected readonly saveError = signal('');

  // Reset only when a different game loads, so live updates never wipe what you are typing.
  private readonly model = linkedSignal<string | undefined, FormModel>({
    source: () => this.game()?.id,
    computation: () => toFormModel(untracked(this.game)),
  });

  protected readonly detailsForm = form(this.model, { submission: { action: async () => this.save() } });

  private async save(): Promise<undefined> {
    this.saveError.set('');
    try {
      await this.vault.updateGame(this.id(), toChanges(this.model()));
      await this.router.navigateByUrl(GAME_LIST_URL);
    } catch (error) {
      console.error('[Form] failed to save game details', error);
      this.saveError.set(SAVE_ERROR_MESSAGE);
    }
    return undefined;
  }
}
