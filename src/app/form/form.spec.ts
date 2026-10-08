import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';

import { GameEntryWithId } from '../game-vault-interface';
import { GameVaultService } from '../game-vault-service';
import { Form } from './form';
import { findById, toChanges, toFormModel } from './form-helpers';

const saved = {
  id: 'doc1',
  rawgId: 1,
  title: 'Saved Game',
  status: 'playing',
  rating: 4,
  notes: 'Fun so far',
} as GameEntryWithId;

describe('form helpers', () => {
  it('finds a game by document id, and copes with a vault that is still loading', () => {
    expect(findById(null, 'doc1')).toBeUndefined();
    expect(findById([saved], 'doc1')).toBe(saved);
    expect(findById([saved], 'nope')).toBeUndefined();
  });

  it('builds the form model from a game, with defaults when there is none', () => {
    expect(toFormModel(saved)).toEqual({ status: 'playing', rating: 4, notes: 'Fun so far' });
    expect(toFormModel(undefined)).toEqual({ status: 'wishlist', rating: null, notes: '' });
    expect(toFormModel({ ...saved, rating: null }).rating).toBeNull();
  });

  it('turns the model into changes, trimming notes', () => {
    expect(toChanges({ status: 'completed', rating: null, notes: '  great  ' })).toEqual({
      status: 'completed',
      rating: null,
      notes: 'great',
    });
  });
});

describe('Form', () => {
  const vault = {
    games: signal<GameEntryWithId[] | null>([saved]),
    updateGame: vi.fn(() => Promise.resolve()),
  };
  let fixture: ComponentFixture<Form>;
  let navigate: ReturnType<typeof vi.spyOn>;
  const html = () => fixture.nativeElement as HTMLElement;
  const field = <T extends HTMLElement>(id: string) => html().querySelector<T>(`#${id}`)!;

  const type = async (element: HTMLTextAreaElement, value: string) => {
    element.value = value;
    element.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  const stars = () => Array.from(html().querySelectorAll<HTMLButtonElement>('[role="radio"]'));
  const clickStar = async (value: number) => {
    stars()[value - 1].click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    vault.games.set([saved]);
    vault.updateGame.mockReset();
    vault.updateGame.mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      imports: [Form],
      providers: [provideRouter([], withComponentInputBinding()), { provide: GameVaultService, useValue: vault }],
    }).compileComponents();
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(Form);
    fixture.componentRef.setInput('id', 'doc1');
    await fixture.whenStable();
  });

  it('shows a loading message while the vault loads (null)', async () => {
    vault.games.set(null);
    await fixture.whenStable();
    expect(html().textContent).toContain('Loading');
  });

  it('shows "Game not found" for an unknown id', async () => {
    fixture.componentRef.setInput('id', 'missing');
    await fixture.whenStable();
    expect(html().textContent).toContain('Game not found');
    expect(html().querySelector('form')).toBeNull();
  });

  it('pre-fills the form from the saved game', () => {
    expect(html().textContent).toContain('Saved Game');
    expect(field<HTMLSelectElement>('status').value).toBe('playing');
    expect(stars().map((star) => star.getAttribute('aria-checked'))).toEqual(['false', 'false', 'false', 'true', 'false']);
    expect(field<HTMLTextAreaElement>('notes').value).toBe('Fun so far');
  });

  it('saves the changes, then goes back to the list', async () => {
    const status = field<HTMLSelectElement>('status');
    status.value = 'completed';
    status.dispatchEvent(new Event('input'));
    await clickStar(5);
    await type(field<HTMLTextAreaElement>('notes'), 'Finished it');

    html().querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await fixture.whenStable();

    expect(vault.updateGame).toHaveBeenCalledWith('doc1', { status: 'completed', rating: 5, notes: 'Finished it' });
    expect(navigate).toHaveBeenCalledWith('/game-list');
  });

  it('clicking the selected star clears the rating and saves null', async () => {
    await clickStar(4);
    html().querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await fixture.whenStable();
    expect(vault.updateGame).toHaveBeenCalledWith('doc1', expect.objectContaining({ rating: null }));
  });

  it('shows an error and stays on the page when saving fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vault.updateGame.mockRejectedValue(new Error('permission-denied'));
    html().querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await fixture.whenStable();
    expect(html().textContent).toContain('Could not save your changes');
    expect(navigate).not.toHaveBeenCalled();
  });
});
