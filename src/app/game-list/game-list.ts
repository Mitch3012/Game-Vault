import { Component, DestroyRef, inject } from '@angular/core';

import { ErrorBanner } from '../error-banner/error-banner';
import { GameCard } from '../game-card/game-card';
import { GameVaultService } from '../game-vault-service';
import { StateMessage } from '../state-message/state-message';

@Component({
  imports: [ErrorBanner, GameCard, StateMessage],
  selector: 'app-game-list',
  styleUrl: './game-list.css',
  templateUrl: './game-list.html',
})
export class GameList {
  private readonly vault = inject(GameVaultService);

  protected readonly games = this.vault.games;
  protected readonly actionError = this.vault.actionError;

  // An error from this page should not still be showing on the next one.
  private readonly clearOnLeave = inject(DestroyRef).onDestroy(() => this.vault.clearActionError());

  protected onRemove(id: string): void {
    void this.vault.removeGame(id);
  }

  protected onDismissError(): void {
    this.vault.clearActionError();
  }
}
