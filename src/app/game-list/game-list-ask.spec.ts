import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ASK_EXAMPLES } from '../ai/suggestions.constants';
import { NewGameEntry } from '../game-vault-interface';
import { GameVaultService } from '../game-vault-service';
import { GameList } from './game-list';
import { createVaultMock, resetVaultMock } from './game-list-test-vault';

const suggested = (rawgId: number): NewGameEntry => ({
  rawgId,
  title: `Game ${rawgId}`,
  coverUrl: '',
  platforms: [],
  genres: [],
  releaseDate: '',
  rating: null,
  status: 'wishlist',
  notes: '',
});

/** The "ask in your own words" and "AI says why" parts of the game list page. */
describe('GameList asking the AI', () => {
  const vault = createVaultMock();
  let fixture: ComponentFixture<GameList>;
  const html = () => fixture.nativeElement as HTMLElement;
  const box = () => html().querySelector<HTMLInputElement>('app-suggestions input[type="text"]')!;

  beforeEach(async () => {
    resetVaultMock(vault);
    vault.games.set([]);
    vault.aiEnabled.set(true);
    vault.suggestions.set([suggested(11)]);
    await TestBed.configureTestingModule({
      imports: [GameList],
      providers: [provideRouter([]), { provide: GameVaultService, useValue: vault }],
    }).compileComponents();
    fixture = TestBed.createComponent(GameList);
    await fixture.whenStable();
  });

  it("shows the AI's reason on each suggestion", async () => {
    vault.suggestionsReasons.set(new Map([[11, 'You like roguelikes.']]));
    await fixture.whenStable();
    expect(html().querySelector('app-suggestion-card')?.textContent).toContain('You like roguelikes.');
  });

  it('names the request in the heading when one was made', async () => {
    vault.suggestionsAsked.set('rainy day');
    await fixture.whenStable();
    expect(html().querySelector('app-suggestions h2')?.textContent).toContain('Picks for "rainy day"');
  });

  it('sends what the user typed to the AI', () => {
    box().value = 'something cozy for a rainy day';
    html().querySelector('app-suggestions form')!.dispatchEvent(new Event('submit'));
    expect(vault.askSuggestions).toHaveBeenCalledExactlyOnceWith('something cozy for a rainy day');
  });

  it('sends an example chip as the request', () => {
    html().querySelector<HTMLButtonElement>('app-suggestions app-ask-chip button')?.click();
    expect(vault.askSuggestions).toHaveBeenCalledExactlyOnceWith(ASK_EXAMPLES[0]);
  });

  it('clears the request', async () => {
    vault.suggestionsAsked.set('rainy day');
    await fixture.whenStable();
    [...html().querySelectorAll<HTMLButtonElement>('app-suggestions button')]
      .find((b) => b.textContent?.includes('Clear'))
      ?.click();
    expect(vault.clearSuggestionsAsk).toHaveBeenCalledOnce();
  });

  it('lets a user with an empty vault ask', () => {
    const ask = [...html().querySelectorAll<HTMLButtonElement>('app-suggestions button')].find(
      (b) => b.textContent?.trim() === 'Ask',
    );
    expect(ask?.disabled).toBe(false);
  });
});
