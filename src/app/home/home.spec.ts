import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GameEntryWithId, NewGameEntry } from '../game-vault-interface';
import { GameVaultService } from '../game-vault-service';
import { Home } from './home';
import { savedIdByRawgId } from './home-helpers';

const entry = (rawgId: number): NewGameEntry => ({
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

describe('savedIdByRawgId', () => {
  it('maps RAWG ids to document ids, and handles a vault that is still loading', () => {
    expect(savedIdByRawgId(null).size).toBe(0);
    expect(savedIdByRawgId([{ id: 'doc1', rawgId: 5 } as GameEntryWithId]).get(5)).toBe('doc1');
  });
});

describe('Home', () => {
  const vault = {
    searchTerm: signal(''),
    searchResults: signal<NewGameEntry[] | null>([]),
    games: signal<GameEntryWithId[] | null>([]),
    actionError: signal(''),
    clearActionError: vi.fn(),
    setSearchTerm: vi.fn(),
    addToVault: vi.fn(() => Promise.resolve('doc1')),
    removeGame: vi.fn(() => Promise.resolve()),
    loginPromptVisible: signal(false),
    dismissLoginPrompt: vi.fn(),
  };
  let fixture: ComponentFixture<Home>;
  const html = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    vault.searchTerm.set('');
    vault.searchResults.set([]);
    vault.actionError.set('');
    vault.clearActionError.mockClear();
    vault.setSearchTerm.mockClear();
    vault.addToVault.mockClear();
    vault.loginPromptVisible.set(false);
    vault.dismissLoginPrompt.mockClear();
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([]), { provide: GameVaultService, useValue: vault }],
    }).compileComponents();
    fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('searches when the Search button is clicked', async () => {
    const input = html().querySelector<HTMLInputElement>('#search')!;
    input.value = 'zelda';
    html().querySelector<HTMLButtonElement>('button.vault-btn')?.click();
    expect(vault.setSearchTerm).toHaveBeenCalledWith('zelda');
  });

  it('shows a searching message while results are loading', async () => {
    vault.searchResults.set(null);
    await fixture.whenStable();
    expect(html().textContent).toContain('Searching');
  });

  it('shows "No games found" for a search with no matches', async () => {
    vault.searchTerm.set('zzzz');
    await fixture.whenStable();
    expect(html().textContent).toContain('No games found');
  });

  it('shows a card per result and adds the game when Add is clicked', async () => {
    vault.searchResults.set([entry(1), entry(2)]);
    await fixture.whenStable();
    expect(html().querySelectorAll('app-game-card').length).toBe(2);
    html().querySelector<HTMLButtonElement>('app-game-card button')?.click();
    expect(vault.addToVault).toHaveBeenCalledWith(1);
  });

  it('shows no error banner when there is no error', () => {
    expect(html().querySelector('app-error-banner')).toBeNull();
  });

  it('shows the action error, and clears it when dismissed', async () => {
    vault.actionError.set('Could not add that game.');
    await fixture.whenStable();
    expect(html().querySelector('[role="alert"]')?.textContent).toContain('Could not add that game.');
    html().querySelector<HTMLButtonElement>('[role="alert"] button')?.click();
    expect(vault.clearActionError).toHaveBeenCalled();
  });

  describe('login prompt', () => {
    it('is not shown by default', () => {
      expect(html().querySelector('app-login-prompt')).toBeNull();
    });

    it('is shown, with a link to the login page, after a logged-out visitor tries to add a game', async () => {
      vault.loginPromptVisible.set(true);
      await fixture.whenStable();
      expect(html().querySelector('app-login-prompt a')?.getAttribute('href')).toBe('/auth');
    });

    it('sits above the search results', async () => {
      vault.searchResults.set([entry(1)]);
      vault.loginPromptVisible.set(true);
      await fixture.whenStable();
      const prompt = html().querySelector('app-login-prompt')!;
      const card = html().querySelector('app-game-card')!;
      expect(prompt.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('is dismissed when its dismiss button is clicked', async () => {
      vault.loginPromptVisible.set(true);
      await fixture.whenStable();
      html().querySelector<HTMLButtonElement>('app-login-prompt button')?.click();
      expect(vault.dismissLoginPrompt).toHaveBeenCalledOnce();
    });

    it('is dismissed when the page is left', () => {
      fixture.destroy();
      expect(vault.dismissLoginPrompt).toHaveBeenCalled();
    });
  });

  it('clears the action error when the page is left', () => {
    fixture.destroy();
    expect(vault.clearActionError).toHaveBeenCalled();
  });
});
