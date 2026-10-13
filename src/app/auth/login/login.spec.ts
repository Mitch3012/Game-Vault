import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameVaultService } from '../../game-vault-service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  const vault = {
    loginError: signal(''),
    loginPending: signal(false),
    clearLoginError: vi.fn(),
    login: vi.fn(() => Promise.resolve(true)),
  };
  let fixture: ComponentFixture<LoginComponent>;
  const html = () => fixture.nativeElement as HTMLElement;
  const submitButton = () => html().querySelector<HTMLButtonElement>('button[type="submit"]');

  const fillForm = async (email: string, password: string) => {
    fixture.componentInstance.loginForm.setValue({ email, password });
    await fixture.whenStable();
  };

  const submit = async () => {
    html().querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    vault.loginError.set('');
    vault.loginPending.set(false);
    vault.clearLoginError.mockClear();
    vault.login.mockClear();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [{ provide: GameVaultService, useValue: vault }],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows no error banner when there is no login error', () => {
    expect(html().querySelector('app-error-banner')).toBeNull();
  });

  it('shows the login error in a banner', async () => {
    vault.loginError.set('Incorrect email or password.');
    await fixture.whenStable();
    expect(html().querySelector('[role="alert"]')?.textContent).toContain('Incorrect email or password.');
  });

  it('clears the login error when the banner is dismissed', async () => {
    vault.loginError.set('Incorrect email or password.');
    await fixture.whenStable();
    html().querySelector<HTMLButtonElement>('[role="alert"] button')?.click();
    expect(vault.clearLoginError).toHaveBeenCalledOnce();
  });

  it('logs in with the entered email and password', async () => {
    await fillForm('a@b.com', 'secret');
    await submit();
    expect(vault.login).toHaveBeenCalledExactlyOnceWith('a@b.com', 'secret');
  });

  it('does not log in while the form is invalid', async () => {
    await fillForm('not-an-email', 'secret');
    await submit();
    expect(vault.login).not.toHaveBeenCalled();
  });

  it('ignores a second submit while a login is pending', async () => {
    vault.loginPending.set(true);
    await fillForm('a@b.com', 'secret');
    await submit();
    expect(vault.login).not.toHaveBeenCalled();
  });

  it('disables the submit button while a login is pending', async () => {
    await fillForm('a@b.com', 'secret');
    expect(submitButton()?.disabled).toBe(false);
    vault.loginPending.set(true);
    await fixture.whenStable();
    expect(submitButton()?.disabled).toBe(true);
  });
});
