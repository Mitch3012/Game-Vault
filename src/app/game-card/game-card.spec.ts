import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NewGameEntry } from '../game-vault-crud-service';
import { GameCard } from './game-card';
import { formatList, releaseYear } from './game-card-helpers';
import { ADD_COOLDOWN_MS } from './game-card.constants';

const game: NewGameEntry = {
  rawgId: 7,
  title: 'Test Quest',
  coverUrl: '',
  platforms: ['PC'],
  genres: ['RPG', 'Action'],
  releaseDate: '2020-05-01',
  rating: null,
  status: 'wishlist',
  notes: '',
};

describe('game card helpers', () => {
  it('limits and joins lists', () => {
    expect(formatList(['a', 'b', 'c', 'd'], 2)).toBe('a · b');
  });

  it('takes the year from a release date, with a fallback', () => {
    expect(releaseYear('2020-05-01')).toBe('2020');
    expect(releaseYear('')).toBe('TBA');
  });
});

describe('GameCard', () => {
  let fixture: ComponentFixture<GameCard>;
  const html = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameCard],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(GameCard);
    fixture.componentRef.setInput('game', game);
    await fixture.whenStable();
  });

  it('shows the title and a placeholder when there is no cover', () => {
    expect(html().querySelector('h3')?.textContent).toContain('Test Quest');
    expect(html().textContent).toContain('No cover');
  });

  it('emits the RAWG id when Add is clicked', () => {
    let emitted: number | undefined;
    fixture.componentInstance.add.subscribe((id) => (emitted = id));
    html().querySelector('button')?.click();
    expect(emitted).toBe(7);
  });

  it('disables Add for a moment after a click, so a double click only adds once', () => {
    vi.useFakeTimers();
    try {
      const emitted: number[] = [];
      fixture.componentInstance.add.subscribe((id) => emitted.push(id));
      const button = html().querySelector('button')!;

      button.click();
      button.click();
      fixture.detectChanges();
      expect(emitted).toEqual([7]);
      expect(button.disabled).toBe(true);
      expect(button.textContent).toContain('Adding');

      vi.advanceTimersByTime(ADD_COOLDOWN_MS);
      fixture.detectChanges();
      expect(button.disabled).toBe(false);
      expect(button.textContent).toContain('Add to vault');
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows Remove and emits the saved id when the game is in the vault', async () => {
    let emitted: string | undefined;
    fixture.componentInstance.remove.subscribe((id) => (emitted = id));
    fixture.componentRef.setInput('savedId', 'doc1');
    await fixture.whenStable();
    const button = html().querySelector('button');
    expect(button?.textContent).toContain('Remove');
    button?.click();
    expect(emitted).toBe('doc1');
  });

  it('links to the edit form for a saved game, and not for an unsaved one', async () => {
    expect(html().querySelector('a')).toBeNull();
    fixture.componentRef.setInput('savedId', 'doc1');
    await fixture.whenStable();
    expect(html().querySelector('a')?.getAttribute('href')).toBe('/form/doc1');
  });
});
