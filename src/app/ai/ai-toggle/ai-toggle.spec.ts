import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AI_PRIVACY_NOTE } from '../suggestions.constants';
import { AiToggle } from './ai-toggle';

describe('AiToggle', () => {
  let fixture: ComponentFixture<AiToggle>;
  const html = () => fixture.nativeElement as HTMLElement;
  const switchButton = () => html().querySelector<HTMLButtonElement>('[role="switch"]')!;

  const render = async (enabled: boolean) => {
    fixture.componentRef.setInput('enabled', enabled);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AiToggle] }).compileComponents();
    fixture = TestBed.createComponent(AiToggle);
  });

  it('shows an off switch', async () => {
    await render(false);
    expect(switchButton().getAttribute('aria-checked')).toBe('false');
  });

  it('shows an on switch', async () => {
    await render(true);
    expect(switchButton().getAttribute('aria-checked')).toBe('true');
  });

  it('asks to turn on when clicked while off', async () => {
    await render(false);
    const toggled: boolean[] = [];
    fixture.componentInstance.toggle.subscribe((value) => toggled.push(value));
    switchButton().click();
    expect(toggled).toEqual([true]);
  });

  it('asks to turn off when clicked while on', async () => {
    await render(true);
    const toggled: boolean[] = [];
    fixture.componentInstance.toggle.subscribe((value) => toggled.push(value));
    switchButton().click();
    expect(toggled).toEqual([false]);
  });

  it('is labelled', async () => {
    await render(false);
    expect(html().textContent).toContain('AI suggestions');
  });

  it('tells the user what is sent to Gemini', async () => {
    await render(false);
    expect(html().textContent).toContain(AI_PRIVACY_NOTE);
  });
});
