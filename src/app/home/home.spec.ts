import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GameEntryWithId, NewGameEntry } from '../game-vault-crud-service';
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
    setSearchTerm: vi.fn(),
    addToVault: vi.fn(() => Promise.resolve('doc1')),
    removeGame: vi.fn(() => Promise.resolve()),
  };
  let fixture: ComponentFixture<Home>;
  const html = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    vault.searchTerm.set('');
    vault.searchResults.set([]);
    vault.setSearchTerm.mockClear();
    vault.addToVault.mockClear();
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
});
