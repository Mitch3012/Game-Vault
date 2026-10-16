import { Service, computed, inject, signal } from '@angular/core';

import { excludeSaved } from '../ai/suggestions-helpers';
import { Authservice } from '../auth/auth-service';
import { GameVaultCrudService } from '../game-vault-crud-service';
import { NewGameEntry } from '../game-vault-interface';
import { FileService } from './file-service';
import {
  buildExport,
  chunk,
  exportFileName,
  importedMessage,
  parseExport,
  planImport,
  serializeExport,
} from './transfer-helpers';
import { ImportPreview } from './transfer-interface';
import {
  EXPORT_ERROR_MESSAGE,
  IMPORT_BATCH_SIZE,
  IMPORT_ERROR_MESSAGE,
  INVALID_FILE_MESSAGE,
  MAX_FILE_CHARS,
  NOTHING_NEW_MESSAGE,
  TOO_BIG_MESSAGE,
} from './transfer.constants';

/**
 * Exports the vault to a file and imports a friend's file. Reads the vault from the CRUD service,
 * not the facade (the facade points to this service, so injecting it here would be circular).
 */
@Service()
export class TransferService {
  private readonly crud = inject(GameVaultCrudService);
  private readonly auth = inject(Authservice);
  private readonly files = inject(FileService);
  private readonly previewState = signal<ImportPreview | null>(null);
  private readonly busyState = signal(false);
  private readonly messageState = signal('');

  /** What importing the chosen file would do. `null` = no file chosen. */
  readonly preview = this.previewState.asReadonly();

  /** `true` while an import is being saved. */
  readonly busy = this.busyState.asReadonly();

  /** The last result or error. `''` = nothing to say. */
  readonly message = this.messageState.asReadonly();

  /** There is a loaded, non-empty vault to export. */
  readonly canExport = computed(() => (this.crud.games()?.length ?? 0) > 0 && !this.busyState());

  /** The vault has loaded, so duplicates can be told apart from new games. */
  readonly canImport = computed(() => this.crud.games() !== null && !this.busyState());

  /** Downloads the vault, notes included. */
  exportVault(now = new Date()): void {
    const games = this.crud.games();
    if (!games?.length) return;
    try {
      const owner = this.auth.userName();
      this.files.download(exportFileName(owner, now), serializeExport(buildExport(games, owner, now)));
      this.messageState.set('');
    } catch (error) {
      console.error('[TransferService] export failed', error);
      this.messageState.set(EXPORT_ERROR_MESSAGE);
    }
  }

  /** Checks a friend's file and shows what importing it would do. Saves nothing. */
  async chooseFile(file: File): Promise<void> {
    const games = this.crud.games();
    if (games === null) return;
    this.reset();
    if (file.size > MAX_FILE_CHARS) return this.messageState.set(TOO_BIG_MESSAGE);
    const text = await this.readOrNull(file);
    const parsed = parseExport(text ?? '');
    if (!parsed.ok) return this.messageState.set(parsed.error);
    const plan = planImport(parsed, new Set(games.map((game) => game.rawgId)));
    if (!plan.fresh.length) return this.messageState.set(NOTHING_NEW_MESSAGE);
    this.previewState.set(plan);
  }

  /** Saves the previewed games to the user's own vault as Wishlist. */
  async confirmImport(): Promise<void> {
    const plan = this.previewState();
    if (!plan || this.busyState()) return;
    this.busyState.set(true);
    try {
      const toSave = this.stillNew(plan.fresh);
      await this.saveInBatches(toSave);
      this.messageState.set(importedMessage(toSave.length));
    } catch (error) {
      console.error('[TransferService] import failed', error);
      this.messageState.set(IMPORT_ERROR_MESSAGE);
    } finally {
      this.previewState.set(null);
      this.busyState.set(false);
    }
  }

  cancelImport(): void {
    this.reset();
  }

  private reset(): void {
    this.previewState.set(null);
    this.messageState.set('');
  }

  private async readOrNull(file: File): Promise<string | null> {
    try {
      return await this.files.readText(file);
    } catch (error) {
      console.error('[TransferService] could not read the file', error);
      return null;
    }
  }

  // The user may have added some of these since the preview was made.
  private stillNew(entries: NewGameEntry[]): NewGameEntry[] {
    const owned = new Set((this.crud.games() ?? []).map((game) => game.rawgId));
    return excludeSaved(entries, owned);
  }

  private async saveInBatches(entries: NewGameEntry[]): Promise<void> {
    for (const group of chunk(entries, IMPORT_BATCH_SIZE)) {
      await Promise.all(group.map((entry) => this.crud.create(entry)));
    }
  }
}
