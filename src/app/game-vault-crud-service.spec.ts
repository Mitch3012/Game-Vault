import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { Subject } from 'rxjs';

import { Authservice } from './auth/auth-service';
import { GameVaultCrudService, WATCH_GAMES } from './game-vault-crud-service';
import { GameEntryWithId, NewGameEntry } from './game-vault-interface';
import { NO_USER_ERROR } from './game-vault.constants';

const fakeFirestore = {} as Firestore;
const newGame = { rawgId: 1, title: 'Hades' } as NewGameEntry;
const saved = (id: string) => ({ id, rawgId: 1, title: 'Hades' }) as GameEntryWithId;

describe('GameVaultCrudService', () => {
  const userId = signal<string | null>(null);
  const streams = new Map<string, Subject<GameEntryWithId[]>>();
  const watch = vi.fn((_firestore: Firestore, uid: string) => {
    const stream = new Subject<GameEntryWithId[]>();
    streams.set(uid, stream);
    return stream;
  });
  let service: GameVaultCrudService;

  beforeEach(() => {
    userId.set(null);
    streams.clear();
    watch.mockClear();
    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: fakeFirestore },
        { provide: Authservice, useValue: { userId } },
        { provide: WATCH_GAMES, useValue: watch },
      ],
    });
    service = TestBed.inject(GameVaultCrudService);
    TestBed.tick();
  });

  describe('games', () => {
    it('is null while the user is unknown, and watches nothing', () => {
      expect(service.games()).toBeNull();
      expect(watch).not.toHaveBeenCalled();
    });

    it('is empty when signed out, and watches nothing', () => {
      userId.set('');
      TestBed.tick();
      expect(service.games()).toEqual([]);
      expect(watch).not.toHaveBeenCalled();
    });

    it("is null until the signed-in user's games arrive, then shows them", () => {
      userId.set('u1');
      TestBed.tick();
      expect(watch).toHaveBeenCalledExactlyOnceWith(fakeFirestore, 'u1');
      expect(service.games()).toBeNull();
      streams.get('u1')!.next([saved('g1')]);
      expect(service.games()).toEqual([expect.objectContaining({ id: 'g1' })]);
    });

    it("switches to the new user's games, and never shows the previous user's", () => {
      userId.set('u1');
      TestBed.tick();
      streams.get('u1')!.next([saved('g1')]);
      userId.set('u2');
      TestBed.tick();
      expect(watch).toHaveBeenLastCalledWith(fakeFirestore, 'u2');
      expect(service.games()).toBeNull();
      streams.get('u1')!.next([saved('stale')]);
      expect(service.games()).toBeNull();
    });

    it('clears the games when the user signs out', () => {
      userId.set('u1');
      TestBed.tick();
      streams.get('u1')!.next([saved('g1')]);
      userId.set('');
      TestBed.tick();
      expect(service.games()).toEqual([]);
    });
  });

  describe.each([
    ['unknown', null],
    ['signed out', ''],
  ])('when the user is %s', (_label, uid) => {
    beforeEach(() => userId.set(uid));

    it('create rejects', async () => {
      await expect(service.create(newGame)).rejects.toThrow(NO_USER_ERROR);
    });

    it('read rejects', async () => {
      await expect(service.read('g1')).rejects.toThrow(NO_USER_ERROR);
    });

    it('update rejects', async () => {
      await expect(service.update('g1', { notes: 'x' })).rejects.toThrow(NO_USER_ERROR);
    });

    it('delete rejects', async () => {
      await expect(service.delete('g1')).rejects.toThrow(NO_USER_ERROR);
    });
  });

  it('still requires an id when signed in', async () => {
    userId.set('u1');
    await expect(service.read('')).rejects.toThrow('an id is required');
  });
});
