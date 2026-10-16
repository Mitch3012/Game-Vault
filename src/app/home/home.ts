import { Component, DestroyRef, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LoginPrompt } from '../auth/login-prompt/login-prompt';
import { ErrorBanner } from '../error-banner/error-banner';
import { GameCard } from '../game-card/game-card';
import { GameVaultService } from '../game-vault-service';
import { StateMessage } from '../state-message/state-message';
import { savedIdByRawgId } from './home-helpers';

@Component({
  imports: [ErrorBanner, LoginPrompt, RouterLink, GameCard, StateMessage],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly vault = inject(GameVaultService);

  protected readonly searchTerm = this.vault.searchTerm;
  protected readonly results = this.vault.searchResults;
  protected readonly actionError = this.vault.actionError;
  protected readonly loginPromptVisible = this.vault.loginPromptVisible;
  protected readonly savedIds = computed(() => savedIdByRawgId(this.vault.games()));

  // An error or login notice from this page should not still be showing on the next one.
  private readonly clearOnLeave = inject(DestroyRef).onDestroy(() => {
    this.vault.clearActionError();
    this.vault.dismissLoginPrompt();
  });

  protected onSearch(term: string): void {
    this.vault.setSearchTerm(term);
  }

  protected onAdd(rawgId: number): void {
    void this.vault.addToVault(rawgId);
  }

  protected onRemove(id: string): void {
    void this.vault.removeGame(id);
  }

  protected onDismissLoginPrompt(): void {
    this.vault.dismissLoginPrompt();
  }

  protected onDismissError(): void {
    this.vault.clearActionError();
  }
}
