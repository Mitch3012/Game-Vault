import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ErrorBanner } from '../../error-banner/error-banner';
import { GameVaultService } from '../../game-vault-service';
import { LOGIN_ROUTE, MIN_PASSWORD_LENGTH } from '../auth.constants';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, ErrorBanner, RouterLink],
  styleUrl: './signup.css',
  templateUrl: './signup.html',
})
export class Signup {
  gameVault = inject(GameVaultService);

  readonly signupError = this.gameVault.signupError;
  readonly signupPending = this.gameVault.signupPending;
  readonly minPasswordLength = MIN_PASSWORD_LENGTH;
  readonly loginRoute = LOGIN_ROUTE;

  signupForm = new FormGroup({
    userName: new FormControl('', {
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)],
    }),
  });

  onSubmit(): void {
    if (this.signupForm.invalid || this.signupPending()) return;
    const { userName, email, password } = this.signupForm.getRawValue();
    if (!userName || !email || !password) return;
    this.gameVault.signup(userName, email, password);
  }

  onDismissError(): void {
    this.gameVault.clearSignupError();
  }
}
