import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { GameVaultService } from './game-vault-service';

describe('App', () => {
  const vault = { signedIn: signal<boolean | null>(false), homeRoute: signal('/auth'), logout: vi.fn() };
  const logoutButton = (root: HTMLElement) =>
    Array.from(root.querySelectorAll('button')).find((button) => button.textContent?.includes('Log out'));

  beforeEach(async () => {
    vault.signedIn.set(false);
    vault.homeRoute.set('/auth');
    vault.logout.mockReset();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: GameVaultService, useValue: vault }, provideRouter([])],
    }).compileComponents();
  });

  it('hides the log out button when signed out', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(logoutButton(fixture.nativeElement)).toBeUndefined();
  });

  it('hides the log out button while it is unknown whether anyone is signed in', async () => {
    vault.signedIn.set(null);
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(logoutButton(fixture.nativeElement)).toBeUndefined();
  });

  it('shows a log out button when signed in, and logs out when it is clicked', async () => {
    vault.signedIn.set(true);
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    logoutButton(fixture.nativeElement)?.click();
    expect(vault.logout).toHaveBeenCalledOnce();
  });

  it('links the title to the login page when signed out', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const link = (fixture.nativeElement as HTMLElement).querySelector('h1 a');
    expect(link?.getAttribute('href')).toBe('/auth');
    expect(link?.textContent).toContain('Game Vault');
  });

  it('links the title to home when signed in', async () => {
    vault.homeRoute.set('/');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1 a')?.getAttribute('href')).toBe('/');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Game Vault');
  });
});
