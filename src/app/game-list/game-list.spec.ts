import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GameEntryWithId } from '../game-vault-interface';
import { GameVaultService } from '../game-vault-service';
import { GameList } from './game-list';

const saved = { id: 'doc1', rawgId: 1, title: 'Saved Game', genres: [], platforms: [], releaseDate: '' } as unknown as GameEntryWithId;

describe('GameList', () => {
  const vault = {
    games: signal<GameEntryWithId[] | null>(null),
    actionError: signal(''),
    clearActionError: vi.fn(),
    removeGame: vi.fn(() => Promise.resolve()),
  };
  let fixture: ComponentFixture<GameList>;
  const html = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    vault.games.set(null);
    vault.actionError.set('');
    vault.clearActionError.mockClear();
    vault.removeGame.mockClear();
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

  it('clears the action error when the page is left', () => {
    fixture.destroy();
    expect(vault.clearActionError).toHaveBeenCalled();
  });
});
