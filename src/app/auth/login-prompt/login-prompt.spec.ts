import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LOGIN_PROMPT_LINK_TEXT, LOGIN_PROMPT_MESSAGE, LOGIN_PROMPT_WELCOME } from '../auth.constants';
import { LoginPrompt } from './login-prompt';

describe('LoginPrompt', () => {
  let fixture: ComponentFixture<LoginPrompt>;
  const html = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPrompt],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginPrompt);
    await fixture.whenStable();
  });

  it('welcomes the visitor and says they have not logged in', () => {
    expect(html().textContent).toContain(LOGIN_PROMPT_WELCOME);
    expect(html().textContent).toContain(LOGIN_PROMPT_MESSAGE);
  });

  it('links through to the login page', () => {
    const link = html().querySelector('a');
    expect(link?.getAttribute('href')).toBe('/auth');
    expect(link?.textContent).toContain(LOGIN_PROMPT_LINK_TEXT);
  });

  it('is announced politely to screen readers', () => {
    expect(html().querySelector('[role="status"]')).not.toBeNull();
  });

  it('can be dismissed', () => {
    let dismissed = 0;
    fixture.componentInstance.dismiss.subscribe(() => dismissed++);
    html().querySelector<HTMLButtonElement>('button')?.click();
    expect(dismissed).toBe(1);
  });
});
