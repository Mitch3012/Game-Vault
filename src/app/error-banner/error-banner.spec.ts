import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorBanner } from './error-banner';

describe('ErrorBanner', () => {
  let fixture: ComponentFixture<ErrorBanner>;
  const html = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ErrorBanner] }).compileComponents();
    fixture = TestBed.createComponent(ErrorBanner);
    fixture.componentRef.setInput('message', 'Something went wrong');
    await fixture.whenStable();
  });

  it('shows the message as an alert', () => {
    expect(html().querySelector('[role="alert"]')?.textContent).toContain('Something went wrong');
  });

  it('emits dismiss when the Dismiss button is clicked', () => {
    let dismissed = 0;
    fixture.componentInstance.dismiss.subscribe(() => dismissed++);
    html().querySelector<HTMLButtonElement>('button')?.click();
    expect(dismissed).toBe(1);
  });
});
