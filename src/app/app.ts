import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { GameVaultService } from './game-vault-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly vault = inject(GameVaultService);

  protected readonly signedIn = this.vault.signedIn;

  protected onLogout(): void {
    void this.vault.logout();
  }
}
