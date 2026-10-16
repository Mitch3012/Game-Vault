import { Component, DestroyRef, computed, inject } from '@angular/core';

import { AiToggle } from '../ai/ai-toggle/ai-toggle';
import { Suggestions } from '../ai/suggestions/suggestions';
import { ErrorBanner } from '../error-banner/error-banner';
import { GameCard } from '../game-card/game-card';
import { GameVaultService } from '../game-vault-service';
import { savedIdByRawgId } from '../home/home-helpers';
import { suggestionsTitle } from '../ai/suggestions-helpers';
import { vaultTitle } from './game-list-helpers';
import { StateMessage } from '../state-message/state-message';
import { TransferPanel } from '../transfer/transfer-panel/transfer-panel';

@Component({
  imports: [AiToggle, ErrorBanner, GameCard, StateMessage, Suggestions, TransferPanel],
  selector: 'app-game-list',
  styleUrl: './game-list.css',
  templateUrl: './game-list.html',
})
export class GameList {
  private readonly vault = inject(GameVaultService);

  protected readonly games = this.vault.games;
  protected readonly actionError = this.vault.actionError;
  protected readonly savedIds = computed(() => savedIdByRawgId(this.games()));
  protected readonly vaultHeading = computed(() => vaultTitle(this.vault.userName()));
  protected readonly suggestionsHeading = computed(() => suggestionsTitle(this.vault.userName()));
  protected readonly aiEnabled = this.vault.aiEnabled;
  protected readonly suggestions = this.vault.suggestions;
  protected readonly suggestionsFailed = this.vault.suggestionsFailed;
  protected readonly suggestionsVaultEmpty = this.vault.suggestionsVaultEmpty;
  protected readonly transferPreview = this.vault.transferPreview;
  protected readonly transferBusy = this.vault.transferBusy;
  protected readonly transferMessage = this.vault.transferMessage;
  protected readonly canExport = this.vault.transferCanExport;
  protected readonly canImport = this.vault.transferCanImport;

  // An error from this page should not still be showing on the next one.
  private readonly clearOnLeave = inject(DestroyRef).onDestroy(() => this.vault.clearActionError());

  protected onRemove(id: string): void {
    void this.vault.removeGame(id);
  }

  protected onAdd(rawgId: number): void {
    void this.vault.addToVault(rawgId);
  }

  protected onToggleAi(on: boolean): void {
    this.vault.setAiEnabled(on);
  }

  protected onRefreshSuggestions(): void {
    this.vault.refreshSuggestions();
  }

  protected onExport(): void {
    this.vault.exportVault();
  }

  protected onFileChosen(file: File): void {
    void this.vault.chooseImportFile(file);
  }

  protected onConfirmImport(): void {
    void this.vault.confirmImport();
  }

  protected onCancelImport(): void {
    this.vault.cancelImport();
  }

  protected onDismissError(): void {
    this.vault.clearActionError();
  }
}
