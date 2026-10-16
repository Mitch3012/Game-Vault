import { signal } from '@angular/core';

import { GameEntryWithId, NewGameEntry } from '../game-vault-interface';
import { ImportPreview } from '../transfer/transfer-interface';

/** A fake facade with everything the game list page reads. Shared by the game list specs. */
export const createVaultMock = () => ({
  games: signal<GameEntryWithId[] | null>(null),
  actionError: signal(''),
  clearActionError: vi.fn(),
  removeGame: vi.fn(() => Promise.resolve()),
  addToVault: vi.fn(() => Promise.resolve('doc2')),
  userName: signal('Sam'),
  transferPreview: signal<ImportPreview | null>(null),
  transferBusy: signal(false),
  transferMessage: signal(''),
  transferCanExport: signal(true),
  transferCanImport: signal(true),
  exportVault: vi.fn(),
  chooseImportFile: vi.fn(() => Promise.resolve()),
  confirmImport: vi.fn(() => Promise.resolve()),
  cancelImport: vi.fn(),
  aiEnabled: signal(false),
  suggestions: signal<NewGameEntry[] | null>([]),
  suggestionsFailed: signal(false),
  suggestionsVaultEmpty: signal(false),
  suggestionsAsked: signal(''),
  suggestionsReasons: signal<ReadonlyMap<number, string>>(new Map()),
  setAiEnabled: vi.fn(),
  refreshSuggestions: vi.fn(),
  askSuggestions: vi.fn(),
  clearSuggestionsAsk: vi.fn(),
});

export type VaultMock = ReturnType<typeof createVaultMock>;

/** Puts the fake back to how a fresh page load would find it. */
export const resetVaultMock = (vault: VaultMock): void => {
  vault.games.set(null);
  vault.actionError.set('');
  vault.userName.set('Sam');
  vault.transferPreview.set(null);
  vault.transferMessage.set('');
  vault.aiEnabled.set(false);
  vault.suggestions.set([]);
  vault.suggestionsFailed.set(false);
  vault.suggestionsVaultEmpty.set(false);
  vault.suggestionsAsked.set('');
  vault.suggestionsReasons.set(new Map());
  [
    vault.clearActionError,
    vault.removeGame,
    vault.addToVault,
    vault.exportVault,
    vault.chooseImportFile,
    vault.confirmImport,
    vault.cancelImport,
    vault.setAiEnabled,
    vault.refreshSuggestions,
    vault.askSuggestions,
    vault.clearSuggestionsAsk,
  ].forEach((mock) => mock.mockClear());
};
