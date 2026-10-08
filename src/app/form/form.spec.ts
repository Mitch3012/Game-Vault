import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';

import { GameEntryWithId } from '../game-vault-crud-service';
import { GameVaultService } from '../game-vault-service';
import { Form } from './form';
import { findById, parseRating, ratingError, toChanges, toFormModel } from './form-helpers';

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
    expect(toFormModel(saved)).toEqual({ status: 'playing', rating: '4', notes: 'Fun so far' });
    expect(toFormModel(undefined)).toEqual({ status: 'wishlist', rating: '', notes: '' });
    expect(toFormModel({ ...saved, rating: null }).rating).toBe('');
  });

  it('parses an empty rating as null', () => {
    expect(parseRating('  ')).toBeNull();
    expect(parseRating('3')).toBe(3);
  });

  it('accepts empty or whole numbers in range and rejects everything else', () => {
    expect(ratingError('')).toBeUndefined();
    expect(ratingError('1')).toBeUndefined();
    expect(ratingError('5')).toBeUndefined();
    expect(ratingError('0')?.kind).toBe('rating');
    expect(ratingError('6')?.kind).toBe('rating');
    expect(ratingError('2.5')?.kind).toBe('rating');
    expect(ratingError('abc')?.kind).toBe('rating');
  });

  it('turns the model into changes, trimming notes', () => {
    expect(toChanges({ status: 'completed', rating: '', notes: '  great  ' })).toEqual({
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

  const type = async (element: HTMLInputElement | HTMLTextAreaElement, value: string) => {
    element.value = value;
    element.dispatchEvent(new Event('input'));
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
    expect(field<HTMLInputElement>('rating').value).toBe('4');
    expect(field<HTMLTextAreaElement>('notes').value).toBe('Fun so far');
  });

  it('saves the changes, then goes back to the list', async () => {
    const status = field<HTMLSelectElement>('status');
    status.value = 'completed';
    status.dispatchEvent(new Event('input'));
    await type(field<HTMLInputElement>('rating'), '5');
    await type(field<HTMLTextAreaElement>('notes'), 'Finished it');

    html().querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await fixture.whenStable();

    expect(vault.updateGame).toHaveBeenCalledWith('doc1', { status: 'completed', rating: 5, notes: 'Finished it' });
    expect(navigate).toHaveBeenCalledWith('/game-list');
  });

  it('clearing the rating saves null', async () => {
    await type(field<HTMLInputElement>('rating'), '');
    html().querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await fixture.whenStable();
    expect(vault.updateGame).toHaveBeenCalledWith('doc1', expect.objectContaining({ rating: null }));
  });

  it('blocks saving an invalid rating and shows why', async () => {
    const rating = field<HTMLInputElement>('rating');
    await type(rating, '9');
    rating.dispatchEvent(new Event('blur'));
    await fixture.whenStable();

    expect(html().textContent).toContain('Rating must be a whole number from 1 to 5');
    expect(html().querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
    html().querySelector('form')?.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(vault.updateGame).not.toHaveBeenCalled();
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
