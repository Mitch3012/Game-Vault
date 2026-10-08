import { TestBed } from '@angular/core/testing';

import { StateMessage } from './state-message';

describe('StateMessage', () => {
  it('shows the text it is given', async () => {
    await TestBed.configureTestingModule({ imports: [StateMessage] }).compileComponents();
    const fixture = TestBed.createComponent(StateMessage);
    fixture.componentRef.setInput('text', 'Loading…');
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Loading…');
  });
});
