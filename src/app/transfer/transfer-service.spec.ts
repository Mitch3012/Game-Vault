import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Authservice } from '../auth/auth-service';
import { GameVaultCrudService } from '../game-vault-crud-service';
import { GameEntryWithId } from '../game-vault-interface';
import { FileService } from './file-service';
import { TransferService } from './transfer-service';
import {
  EXPORT_APP,
  EXPORT_ERROR_MESSAGE,
  EXPORT_VERSION,
  IMPORT_BATCH_SIZE,
  IMPORT_ERROR_MESSAGE,
  INVALID_FILE_MESSAGE,
  MAX_FILE_CHARS,
  NOTHING_NEW_MESSAGE,
  TOO_BIG_MESSAGE,
} from './transfer.constants';

const saved = (rawgId: number, overrides: Partial<GameEntryWithId> = {}): GameEntryWithId => ({
  id: `doc${rawgId}`,
  rawgId,
  title: `Game ${rawgId}`,
  coverUrl: '',
  platforms: [],
  genres: [],
  releaseDate: '',
  rating: 4,
  status: 'completed',
  notes: 'My notes',
  addedAt: 1,
  ...overrides,
});

const friendGame = (rawgId: number, extra: Record<string, unknown> = {}) => ({
  rawgId,
  title: `Game ${rawgId}`,
  coverUrl: '',
  platforms: [],
  genres: [],
  releaseDate: '',
  status: 'completed',
  rating: 5,
  notes: 'Loved it',
  ...extra,
});

const exportFile = (games: unknown[], name = 'friend.json') =>
  new File([JSON.stringify({ app: EXPORT_APP, version: EXPORT_VERSION, owner: 'Sam', games })], name);

describe('TransferService', () => {
  const games = signal<GameEntryWithId[] | null>([]);
  const crud = { games, create: vi.fn() };
  const files = { download: vi.fn(), readText: vi.fn((file: File) => file.text()) };
  const auth = { userName: signal('Alex') };
  let service: TransferService;

  beforeEach(() => {
    games.set([saved(1), saved(2)]);
    auth.userName.set('Alex');
    crud.create.mockReset().mockResolvedValue('new-id');
    files.download.mockReset();
    files.readText.mockClear();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: GameVaultCrudService, useValue: crud },
        { provide: Authservice, useValue: auth },
        { provide: FileService, useValue: files },
      ],
    });
    service = TestBed.inject(TransferService);
  });

  afterEach(() => vi.restoreAllMocks());

  describe('canExport and canImport', () => {
    it('allow both once the vault has games', () => {
      expect(service.canExport()).toBe(true);
      expect(service.canImport()).toBe(true);
    });

    it('do not allow export for an empty vault, but still allow import', () => {
      games.set([]);
      expect(service.canExport()).toBe(false);
      expect(service.canImport()).toBe(true);
    });

    it('allow neither while the vault is loading', () => {
      games.set(null);
      expect(service.canExport()).toBe(false);
      expect(service.canImport()).toBe(false);
    });
  });

  describe('exportVault', () => {
    const now = new Date('2026-10-16T12:00:00.000Z');

    it('downloads the vault, notes included, named after the user and the date', () => {
      service.exportVault(now);
      const [fileName, text] = files.download.mock.calls[0];
      expect(fileName).toBe('game-vault-alex-2026-10-16.json');
      const data = JSON.parse(text);
      expect(data.owner).toBe('Alex');
      expect(data.games).toHaveLength(2);
      expect(data.games[0].notes).toBe('My notes');
    });

    it('does nothing for an empty vault', () => {
      games.set([]);
      service.exportVault(now);
      expect(files.download).not.toHaveBeenCalled();
    });

    it('does nothing while the vault is loading', () => {
      games.set(null);
      service.exportVault(now);
      expect(files.download).not.toHaveBeenCalled();
    });

    it('sets an error message, and does not throw, when the download fails', () => {
      files.download.mockImplementation(() => {
        throw new Error('blocked');
      });
      expect(() => service.exportVault(now)).not.toThrow();
      expect(service.message()).toBe(EXPORT_ERROR_MESSAGE);
    });
  });

  describe('chooseFile', () => {
    it('shows a preview of the new games, and saves nothing yet', async () => {
      await service.chooseFile(exportFile([friendGame(2), friendGame(3), friendGame(4)]));
      expect(service.preview()).toMatchObject({ owner: 'Sam', alreadyOwned: 1, skipped: 0 });
      expect(service.preview()?.fresh.map((g) => g.rawgId)).toEqual([3, 4]);
      expect(service.message()).toBe('');
      expect(crud.create).not.toHaveBeenCalled();
    });

    it('rejects a file that is not an export, with a message and no preview', async () => {
      await service.chooseFile(new File(['hello'], 'notes.txt'));
      expect(service.preview()).toBeNull();
      expect(service.message()).toBe(INVALID_FILE_MESSAGE);
    });

    it('rejects a file over the size limit without reading it', async () => {
      const big = exportFile([friendGame(3)]);
      Object.defineProperty(big, 'size', { value: MAX_FILE_CHARS + 1 });
      await service.chooseFile(big);
      expect(files.readText).not.toHaveBeenCalled();
      expect(service.message()).toBe(TOO_BIG_MESSAGE);
    });

    it('says so when there is nothing new, and shows no preview', async () => {
      await service.chooseFile(exportFile([friendGame(1), friendGame(2)]));
      expect(service.preview()).toBeNull();
      expect(service.message()).toBe(NOTHING_NEW_MESSAGE);
    });

    it('says the file is invalid when it cannot be read', async () => {
      files.readText.mockRejectedValueOnce(new Error('unreadable'));
      await service.chooseFile(exportFile([friendGame(3)]));
      expect(service.message()).toBe(INVALID_FILE_MESSAGE);
    });

    it('does nothing while the vault is loading, so it cannot import games the user already has', async () => {
      games.set(null);
      await service.chooseFile(exportFile([friendGame(3)]));
      expect(files.readText).not.toHaveBeenCalled();
      expect(service.preview()).toBeNull();
    });

    it('replaces an earlier preview and clears an earlier message', async () => {
      await service.chooseFile(new File(['hello'], 'notes.txt'));
      await service.chooseFile(exportFile([friendGame(3)]));
      expect(service.message()).toBe('');
      expect(service.preview()?.fresh).toHaveLength(1);
    });
  });

  describe('confirmImport', () => {
    it('saves each new game as Wishlist with a labelled note, then reports and clears the preview', async () => {
      await service.chooseFile(exportFile([friendGame(3), friendGame(4)]));
      await service.confirmImport();
      expect(crud.create).toHaveBeenCalledTimes(2);
      expect(crud.create).toHaveBeenCalledWith(
        expect.objectContaining({ rawgId: 3, status: 'wishlist', rating: null, notes: 'From Sam (5/5): Loved it' }),
      );
      expect(service.message()).toBe('Imported 2 games as Wishlist.');
      expect(service.preview()).toBeNull();
      expect(service.busy()).toBe(false);
    });

    it('skips games the user added after the preview was made', async () => {
      await service.chooseFile(exportFile([friendGame(3), friendGame(4)]));
      games.update((current) => [...(current ?? []), saved(3)]);
      await service.confirmImport();
      expect(crud.create).toHaveBeenCalledOnce();
      expect(crud.create).toHaveBeenCalledWith(expect.objectContaining({ rawgId: 4 }));
    });

    it('adds nothing the second time the same file is imported', async () => {
      const file = exportFile([friendGame(3)]);
      await service.chooseFile(file);
      await service.confirmImport();
      games.update((current) => [...(current ?? []), saved(3)]);
      await service.chooseFile(file);
      expect(service.preview()).toBeNull();
      expect(service.message()).toBe(NOTHING_NEW_MESSAGE);
    });

    it('is busy while saving, and ignores a second click', async () => {
      let finish: (id: string) => void = () => undefined;
      crud.create.mockReturnValue(new Promise<string>((resolve) => (finish = resolve)));
      await service.chooseFile(exportFile([friendGame(3)]));
      const running = service.confirmImport();
      expect(service.busy()).toBe(true);
      await service.confirmImport();
      finish('id');
      await running;
      expect(crud.create).toHaveBeenCalledOnce();
      expect(service.busy()).toBe(false);
    });

    it('saves in small batches, not all at once', async () => {
      let running = 0;
      let peak = 0;
      crud.create.mockImplementation(async () => {
        running++;
        peak = Math.max(peak, running);
        await Promise.resolve();
        running--;
        return 'id';
      });
      const many = Array.from({ length: IMPORT_BATCH_SIZE * 2 + 5 }, (_, i) => friendGame(100 + i));
      await service.chooseFile(exportFile(many));
      await service.confirmImport();
      expect(crud.create).toHaveBeenCalledTimes(many.length);
      expect(peak).toBeLessThanOrEqual(IMPORT_BATCH_SIZE);
    });

    it('sets an error message, clears the preview and stops being busy when saving fails', async () => {
      crud.create.mockRejectedValue(new Error('permission-denied'));
      await service.chooseFile(exportFile([friendGame(3)]));
      await service.confirmImport();
      expect(service.message()).toBe(IMPORT_ERROR_MESSAGE);
      expect(service.preview()).toBeNull();
      expect(service.busy()).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });

    it('does nothing without a preview', async () => {
      await service.confirmImport();
      expect(crud.create).not.toHaveBeenCalled();
    });
  });

  describe('cancelImport', () => {
    it('closes the preview and saves nothing', async () => {
      await service.chooseFile(exportFile([friendGame(3)]));
      service.cancelImport();
      expect(service.preview()).toBeNull();
      expect(crud.create).not.toHaveBeenCalled();
    });
  });
});
