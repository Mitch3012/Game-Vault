import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GameEntryWithId, NewGameEntry } from '../game-vault-interface';
import { GameVaultService } from '../game-vault-service';
import { GameList } from './game-list';

const saved = { id: 'doc1', rawgId: 1, title: 'Saved Game', genres: [], platforms: [], releaseDate: '' } as unknown as GameEntryWithId;

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

describe('GameList', () => {
  const vault = {
    games: signal<GameEntryWithId[] | null>(null),
    actionError: signal(''),
    clearActionError: vi.fn(),
    removeGame: vi.fn(() => Promise.resolve()),
    addToVault: vi.fn(() => Promise.resolve('doc2')),
    aiEnabled: signal(false),
    suggestions: signal<NewGameEntry[] | null>([]),
    suggestionsFailed: signal(false),
    suggestionsVaultEmpty: signal(false),
    setAiEnabled: vi.fn(),
    refreshSuggestions: vi.fn(),
  };
  let fixture: ComponentFixture<GameList>;
  const html = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    vault.games.set(null);
    vault.actionError.set('');
    vault.clearActionError.mockClear();
    vault.removeGame.mockClear();
    vault.addToVault.mockClear();
    vault.aiEnabled.set(false);
    vault.suggestions.set([]);
    vault.suggestionsFailed.set(false);
    vault.suggestionsVaultEmpty.set(false);
    vault.setAiEnabled.mockClear();
    vault.refreshSuggestions.mockClear();
    await TestBed.configureTestingModule({
      imports: [GameList],
      providers: [provideRouter([]), { provide: GameVaultService, useValue: vault }],
    }).compileComponents();
    fixture = TestBed.createComponent(GameList);
    await fixture.whenStable();
  });

  it('shows a loading message while the vault loads (null)', () => {
    expect(html().textContent).toContain('Loading');
  });

  it('shows an empty message for an empty vault ([])', async () => {
    vault.games.set([]);
    await fixture.whenStable();
    expect(html().textContent).toContain('Your vault is empty');
  });

  it('shows a card per saved game and removes by id', async () => {
    vault.games.set([saved]);
    await fixture.whenStable();
    expect(html().querySelectorAll('app-game-card').length).toBe(1);
    html().querySelector<HTMLButtonElement>('app-game-card button')?.click();
    expect(vault.removeGame).toHaveBeenCalledWith('doc1');
  });

  it('shows the action error, and clears it when dismissed', async () => {
    vault.actionError.set('Could not remove that game.');
    await fixture.whenStable();
    expect(html().querySelector('[role="alert"]')?.textContent).toContain('Could not remove that game.');
    html().querySelector<HTMLButtonElement>('[role="alert"] button')?.click();
    expect(vault.clearActionError).toHaveBeenCalled();
  });

  describe('AI suggestions', () => {
    const switchButton = () => html().querySelector<HTMLButtonElement>('[role="switch"]')!;
    const showSuggestions = async (games: NewGameEntry[]) => {
      vault.aiEnabled.set(true);
      vault.suggestions.set(games);
      await fixture.whenStable();
    };

    it('shows the AI switch, off, with no suggestions section', () => {
      expect(switchButton().getAttribute('aria-checked')).toBe('false');
      expect(html().querySelector('app-suggestions')).toBeNull();
    });

    const isBefore = (first: Element, second: Element) =>
      !!(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);

    const vaultHeading = () => [...html().querySelectorAll('h2')].find((h) => h.textContent?.includes('Your vault'))!;

    it('puts the AI switch at the top, above the saved games', async () => {
      vault.games.set([saved]);
      await fixture.whenStable();
      expect(isBefore(switchButton(), vaultHeading())).toBe(true);
      expect(isBefore(switchButton(), html().querySelector('app-game-card')!)).toBe(true);
    });

    it('puts the suggestions at the top, above the saved games', async () => {
      vault.games.set([saved]);
      await showSuggestions([suggested(11)]);
      expect(isBefore(html().querySelector('app-suggestions')!, vaultHeading())).toBe(true);
    });

    it('turns the AI on when the switch is clicked', () => {
      switchButton().click();
      expect(vault.setAiEnabled).toHaveBeenCalledExactlyOnceWith(true);
    });

    it('shows the suggestions section when the AI is on', async () => {
      await showSuggestions([suggested(11), suggested(12)]);
      expect(html().querySelector('app-suggestions')).not.toBeNull();
      expect(html().querySelectorAll('app-suggestions app-game-card').length).toBe(2);
    });

    it('adds a suggested game to the vault', async () => {
      await showSuggestions([suggested(11)]);
      html().querySelector<HTMLButtonElement>('app-suggestions app-game-card button')?.click();
      expect(vault.addToVault).toHaveBeenCalledWith(11);
    });

    it('shows Edit instead of Add for a suggestion that is already saved', async () => {
      vault.games.set([saved]);
      await showSuggestions([suggested(1)]);
      const card = html().querySelector('app-suggestions app-game-card')!;
      expect(card.textContent).toContain('Edit');
      expect(card.textContent).not.toContain('Add to vault');
    });

    it('refreshes the suggestions', async () => {
      await showSuggestions([suggested(11)]);
      const refresh = [...html().querySelectorAll<HTMLButtonElement>('app-suggestions button')].find((b) =>
        b.textContent?.includes('Refresh'),
      );
      refresh?.click();
      expect(vault.refreshSuggestions).toHaveBeenCalledOnce();
    });
  });

  it('clears the action error when the page is left', () => {
    fixture.destroy();
    expect(vault.clearActionError).toHaveBeenCalled();
  });
});
