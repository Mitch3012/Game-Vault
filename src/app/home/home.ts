import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { GameCard } from '../game-card/game-card';
import { GameVaultService } from '../game-vault-service';
import { StateMessage } from '../state-message/state-message';
import { savedIdByRawgId } from './home-helpers';

@Component({
  imports: [RouterLink, GameCard, StateMessage],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly vault = inject(GameVaultService);

  protected readonly searchTerm = this.vault.searchTerm;
  protected readonly results = this.vault.searchResults;
  protected readonly savedIds = computed(() => savedIdByRawgId(this.vault.games()));

  protected onSearch(term: string): void {
    this.vault.setSearchTerm(term);
  }

  protected onAdd(rawgId: number): void {
    void this.vault.addToVault(rawgId);
  }

  protected onRemove(id: string): void {
    void this.vault.removeGame(id);
  }
}
