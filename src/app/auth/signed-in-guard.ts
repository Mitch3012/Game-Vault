import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';

import { GameVaultService } from '../game-vault-service';
import { LOGIN_ROUTE } from './auth.constants';

/** Waits until Firebase has answered, then lets signed-in users through and sends everyone else to login. */
export const signedInGuard: CanActivateFn = () => {
  const signedIn = inject(GameVaultService).signedIn;
  const router = inject(Router);
  return toObservable(signedIn).pipe(
    filter((value) => value !== null),
    take(1),
    map((value) => value || router.createUrlTree([LOGIN_ROUTE])),
  );
};
