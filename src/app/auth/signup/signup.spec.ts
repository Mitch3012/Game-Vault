import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GameVaultService } from '../../game-vault-service';
import { Signup } from './signup';

describe('Signup', () => {
  const vault = {
    signupError: signal(''),
    signupPending: signal(false),
    clearSignupError: vi.fn(),
    signup: vi.fn(() => Promise.resolve(true)),
  };
  let fixture: ComponentFixture<Signup>;
  const html = () => fixture.nativeElement as HTMLElement;
  const submitButton = () => html().querySelector<HTMLButtonElement>('button[type="submit"]');

  const fillForm = async (userName: string, email: string, password: string) => {
    fixture.componentInstance.signupForm.setValue({ userName, email, password });
    await fixture.whenStable();
  };

  const submit = async () => {
    html().querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    vault.signupError.set('');
    vault.signupPending.set(false);
    vault.clearSignupError.mockClear();
    vault.signup.mockClear();
    await TestBed.configureTestingModule({
      imports: [Signup],
      providers: [{ provide: GameVaultService, useValue: vault }, provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(Signup);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('tells the user the minimum password length', () => {
    expect(html().querySelector('#password-hint')?.textContent).toContain('At least 6 characters');
    expect(html().querySelector('#password')?.getAttribute('aria-describedby')).toBe('password-hint');
  });

  it('links to the login page', () => {
    expect(html().querySelector('a')?.getAttribute('href')).toBe('/auth');
  });

  it('shows no error banner when there is no signup error', () => {
    expect(html().querySelector('app-error-banner')).toBeNull();
  });

  it('shows the signup error in a banner', async () => {
    vault.signupError.set('An account with that email already exists.');
    await fixture.whenStable();
    expect(html().querySelector('[role="alert"]')?.textContent).toContain('already exists');
  });

  it('clears the signup error when the banner is dismissed', async () => {
    vault.signupError.set('An account with that email already exists.');
    await fixture.whenStable();
    html().querySelector<HTMLButtonElement>('[role="alert"] button')?.click();
    expect(vault.clearSignupError).toHaveBeenCalledOnce();
  });

  it('signs up with the entered user name, email and password', async () => {
    await fillForm('Sam', 'a@b.com', 'secret1');
    await submit();
    expect(vault.signup).toHaveBeenCalledExactlyOnceWith('Sam', 'a@b.com', 'secret1');
  });

  it('accepts a password that is not an email address', async () => {
    await fillForm('Sam', 'a@b.com', 'secret1');
    expect(fixture.componentInstance.signupForm.valid).toBe(true);
  });

  it('does not sign up with an invalid email', async () => {
    await fillForm('Sam', 'not-an-email', 'secret1');
    await submit();
    expect(vault.signup).not.toHaveBeenCalled();
  });

  it('does not sign up with a password shorter than 6 characters', async () => {
    await fillForm('Sam', 'a@b.com', '12345');
    await submit();
    expect(vault.signup).not.toHaveBeenCalled();
  });

  it('ignores a second submit while a signup is pending', async () => {
    vault.signupPending.set(true);
    await fillForm('Sam', 'a@b.com', 'secret1');
    await submit();
    expect(vault.signup).not.toHaveBeenCalled();
  });

  it('disables the submit button while a signup is pending', async () => {
    await fillForm('Sam', 'a@b.com', 'secret1');
    expect(submitButton()?.disabled).toBe(false);
    vault.signupPending.set(true);
    await fixture.whenStable();
    expect(submitButton()?.disabled).toBe(true);
  });
});
