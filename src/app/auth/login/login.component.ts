import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ErrorBanner } from '../../error-banner/error-banner';
import { GameVaultService } from '../../game-vault-service';
import { SIGNUP_ROUTE } from '../auth.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ErrorBanner, RouterLink],
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class LoginComponent {
  gameVault = inject(GameVaultService);

  readonly loginError = this.gameVault.loginError;
  readonly loginPending = this.gameVault.loginPending;
  readonly signupRoute = SIGNUP_ROUTE;

  loginForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      validators: [Validators.required],
    }),
  });

  onSubmit(): void {
    if (this.loginForm.invalid || this.loginPending()) return;
    const { email, password } = this.loginForm.getRawValue();
    if (!email || !password) return;
    this.gameVault.login(email, password);
  }

  onDismissError(): void {
    this.gameVault.clearLoginError();
  }
}
