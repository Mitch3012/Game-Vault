import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { ContactDev } from './contact/contact-dev/contact-dev';
import { GameVaultService } from './game-vault-service';

@Component({
  selector: 'app-root',
  imports: [ContactDev, RouterLink, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly vault = inject(GameVaultService);

  protected readonly signedIn = this.vault.signedIn;
  protected readonly homeRoute = this.vault.homeRoute;

  protected onLogout(): void {
    void this.vault.logout();
  }
}
