import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GameEntryWithId, NewGameEntry } from '../game-vault-interface';
import { GameVaultService } from '../game-vault-service';
import { ImportPreview } from '../transfer/transfer-interface';
import { GameList } from './game-list';
import { createVaultMock, resetVaultMock } from './game-list-test-vault';

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
  const vault = createVaultMock();
  let fixture: ComponentFixture<GameList>;
  const html = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    resetVaultMock(vault);
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

  describe('export and import', () => {
    const panelButton = (label: string) =>
      [...html().querySelectorAll<HTMLButtonElement>('app-transfer-panel button')].find((b) =>
        b.textContent?.includes(label),
      )!;
    const preview: ImportPreview = { owner: 'Sam', total: 3, fresh: [suggested(11)], alreadyOwned: 2, skipped: 0 };

    it('shows the panel under the vault heading and above the saved games', async () => {
      vault.games.set([saved]);
      await fixture.whenStable();
      const panel = html().querySelector('app-transfer-panel')!;
      const heading = html().querySelector('#vault-heading')!;
      const card = html().querySelector('app-game-card')!;
      expect(heading.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(panel.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('exports when Export is clicked', () => {
      panelButton('Export vault').click();
      expect(vault.exportVault).toHaveBeenCalledOnce();
    });

    it('disables Export when there is nothing to export', async () => {
      vault.transferCanExport.set(false);
      await fixture.whenStable();
      expect(panelButton('Export vault').disabled).toBe(true);
    });

    it('hands a chosen file to the vault', () => {
      const file = new File(['{}'], 'friend.json');
      const picker = html().querySelector<HTMLInputElement>('app-transfer-panel input[type="file"]')!;
      Object.defineProperty(picker, 'files', { value: [file], configurable: true });
      picker.dispatchEvent(new Event('change'));
      expect(vault.chooseImportFile).toHaveBeenCalledExactlyOnceWith(file);
    });

    it('confirms the import from the preview', async () => {
      vault.transferPreview.set(preview);
      await fixture.whenStable();
      panelButton('Import 1 as Wishlist').click();
      expect(vault.confirmImport).toHaveBeenCalledOnce();
    });

    it('cancels the import from the preview', async () => {
      vault.transferPreview.set(preview);
      await fixture.whenStable();
      panelButton('Cancel').click();
      expect(vault.cancelImport).toHaveBeenCalledOnce();
    });

    it('shows the result message', async () => {
      vault.transferMessage.set('Imported 1 game as Wishlist.');
      await fixture.whenStable();
      expect(html().querySelector('app-transfer-panel [role="status"]')?.textContent).toContain('Imported 1 game');
    });
  });

  describe('personal headings', () => {
    it("names the vault after the user", () => {
      expect(html().querySelector('#vault-heading')?.textContent).toContain("Sam's vault");
    });

    it('falls back to "Your vault" when there is no name', async () => {
      vault.userName.set('');
      await fixture.whenStable();
      expect(html().querySelector('#vault-heading')?.textContent).toContain('Your vault');
    });

    it('names the suggestions after the user', async () => {
      vault.aiEnabled.set(true);
      await fixture.whenStable();
      expect(html().querySelector('app-suggestions h2')?.textContent).toContain('Suggested for Sam');
    });

    it('falls back to "Suggested for you" when there is no name', async () => {
      vault.userName.set('');
      vault.aiEnabled.set(true);
      await fixture.whenStable();
      expect(html().querySelector('app-suggestions h2')?.textContent).toContain('Suggested for you');
    });
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

    const vaultHeading = () => html().querySelector('#vault-heading')!;

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
