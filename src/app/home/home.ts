import { Component, DestroyRef, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ErrorBanner } from '../error-banner/error-banner';
import { GameCard } from '../game-card/game-card';
import { GameVaultService } from '../game-vault-service';
import { StateMessage } from '../state-message/state-message';
import { savedIdByRawgId } from './home-helpers';

@Component({
  imports: [ErrorBanner, RouterLink, GameCard, StateMessage],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly vault = inject(GameVaultService);

  protected readonly searchTerm = this.vault.searchTerm;
  protected readonly results = this.vault.searchResults;
  protected readonly actionError = this.vault.actionError;
  protected readonly savedIds = computed(() => savedIdByRawgId(this.vault.games()));

  // An error from this page should not still be showing on the next one.
  private readonly clearOnLeave = inject(DestroyRef).onDestroy(() => this.vault.clearActionError());

  protected onSearch(term: string): void {
    this.vault.setSearchTerm(term);
  }

  protected onAdd(rawgId: number): void {
    void this.vault.addToVault(rawgId);
  }

  protected onRemove(id: string): void {
    void this.vault.removeGame(id);
  }

  protected onDismissError(): void {
    this.vault.clearActionError();
  }
}
