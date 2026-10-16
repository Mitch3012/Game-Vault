import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NewGameEntry } from '../../game-vault-interface';
import { SuggestionCard } from './suggestion-card';

const game: NewGameEntry = {
  rawgId: 7,
  title: 'Hades',
  coverUrl: '',
  platforms: [],
  genres: [],
  releaseDate: '',
  rating: null,
  status: 'wishlist',
  notes: '',
};

describe('SuggestionCard', () => {
  let fixture: ComponentFixture<SuggestionCard>;
  const html = () => fixture.nativeElement as HTMLElement;

  const render = async (reason = '', savedId: string | null = null) => {
    fixture.componentRef.setInput('game', game);
    fixture.componentRef.setInput('savedId', savedId);
    fixture.componentRef.setInput('reason', reason);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestionCard],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(SuggestionCard);
  });

  it('shows the game', async () => {
    await render();
    expect(html().querySelector('app-game-card')?.textContent).toContain('Hades');
  });

  it("shows the AI's reason, labelled as the AI's opinion", async () => {
    await render('Fast combat like Hollow Knight.');
    const reason = html().querySelector('[data-testid="reason"]');
    expect(reason?.textContent).toContain('Fast combat like Hollow Knight.');
    expect(reason?.textContent).toContain("AI's take");
  });

  it('shows no reason line when the AI gave none', async () => {
    await render('');
    expect(html().querySelector('[data-testid="reason"]')).toBeNull();
  });

  it('shows the reason as plain text, never as markup', async () => {
    await render('<b>bold</b>');
    expect(html().querySelector('[data-testid="reason"] b')).toBeNull();
    expect(html().querySelector('[data-testid="reason"]')?.textContent).toContain('<b>bold</b>');
  });

  it('emits the RAWG id when the game is added', async () => {
    await render();
    const added: number[] = [];
    fixture.componentInstance.add.subscribe((id) => added.push(id));
    html().querySelector<HTMLButtonElement>('app-game-card button')?.click();
    expect(added).toEqual([7]);
  });

  it('shows Edit instead of Add for a game already saved, and emits its id on Remove', async () => {
    await render('', 'doc1');
    expect(html().querySelector('app-game-card')?.textContent).toContain('Edit');
    const removed: string[] = [];
    fixture.componentInstance.remove.subscribe((id) => removed.push(id));
    [...html().querySelectorAll<HTMLButtonElement>('app-game-card button')]
      .find((b) => b.textContent?.includes('Remove'))
      ?.click();
    expect(removed).toEqual(['doc1']);
  });
});
