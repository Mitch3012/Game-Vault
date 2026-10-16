import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { Observable } from 'rxjs';

import { GameVaultService } from '../game-vault-service';
import { signedInGuard } from './signed-in-guard';

describe('signedInGuard', () => {
  const vault = { signedIn: signal<boolean | null>(null) };
  let results: (boolean | UrlTree)[];

  const run = () => {
    const outcome = TestBed.runInInjectionContext(() =>
      signedInGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as Observable<boolean | UrlTree>;
    outcome.subscribe((result) => results.push(result));
    TestBed.tick();
  };

  beforeEach(() => {
    vault.signedIn.set(null);
    results = [];
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: GameVaultService, useValue: vault }],
    });
  });

  it('waits while it is unknown whether anyone is signed in', () => {
    run();
    expect(results).toEqual([]);
  });

  it('allows a signed-in user straight away', () => {
    vault.signedIn.set(true);
    run();
    expect(results).toEqual([true]);
  });

  it('redirects a signed-out user to the login page', () => {
    vault.signedIn.set(false);
    run();
    expect(results).toHaveLength(1);
    expect((results[0] as UrlTree).toString()).toBe('/auth');
  });

  it('allows the user once Firebase says they are signed in', () => {
    run();
    vault.signedIn.set(true);
    TestBed.tick();
    expect(results).toEqual([true]);
  });

  it('redirects once Firebase says nobody is signed in', () => {
    run();
    vault.signedIn.set(false);
    TestBed.tick();
    expect((results[0] as UrlTree).toString()).toBe('/auth');
  });

  it('decides only once', () => {
    vault.signedIn.set(true);
    run();
    vault.signedIn.set(false);
    TestBed.tick();
    expect(results).toEqual([true]);
  });
});
