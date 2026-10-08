import { Component, inject } from '@angular/core';

import { GameCard } from '../game-card/game-card';
import { GameVaultService } from '../game-vault-service';
import { StateMessage } from '../state-message/state-message';

@Component({
  imports: [GameCard, StateMessage],
  selector: 'app-game-list',
  styleUrl: './game-list.css',
  templateUrl: './game-list.html',
})
export class GameList {
  private readonly vault = inject(GameVaultService);

  protected readonly games = this.vault.games;

  protected onRemove(id: string): void {
    void this.vault.removeGame(id);
  }
}
