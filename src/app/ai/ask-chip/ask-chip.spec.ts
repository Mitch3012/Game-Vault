import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AskChip } from './ask-chip';

describe('AskChip', () => {
  let fixture: ComponentFixture<AskChip>;
  const button = () => (fixture.nativeElement as HTMLElement).querySelector('button')!;

  const render = async (disabled = false) => {
    fixture.componentRef.setInput('label', 'cozy');
    fixture.componentRef.setInput('disabled', disabled);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AskChip] }).compileComponents();
    fixture = TestBed.createComponent(AskChip);
  });

  it('shows its label', async () => {
    await render();
    expect(button().textContent).toContain('cozy');
  });

  it('emits its label when clicked', async () => {
    await render();
    const picked: string[] = [];
    fixture.componentInstance.pick.subscribe((label) => picked.push(label));
    button().click();
    expect(picked).toEqual(['cozy']);
  });

  it('is disabled when told to be', async () => {
    await render(true);
    expect(button().disabled).toBe(true);
  });
});
