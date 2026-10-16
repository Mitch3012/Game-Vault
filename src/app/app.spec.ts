import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { GameVaultService } from './game-vault-service';

describe('App', () => {
  const vault = { signedIn: signal<boolean | null>(false), logout: vi.fn() };
  const logoutButton = (root: HTMLElement) =>
    Array.from(root.querySelectorAll('button')).find((button) => button.textContent?.includes('Log out'));

  beforeEach(async () => {
    vault.signedIn.set(false);
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
