import { InjectionToken, Injector, Service, Signal, inject, runInInjectionContext } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  CollectionReference,
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable, catchError, map, of, switchMap } from 'rxjs';

import { Authservice } from './auth/auth-service';
import { gamePath, gamesFor, loadErrorMessage, requireUserId, userGamesPath } from './game-vault-crud-helpers';
import { GameEntry, GameEntryChanges, GameEntryWithId, NewGameEntry } from './game-vault-interface';

export const assertId = (id: string): void => {
  if (!id) throw new Error('GameVaultCrudService: an id is required');
};

export const withAddedAt = (game: NewGameEntry, addedAt: number): GameEntry => ({ ...game, addedAt });

// Games saved before notes existed have no `notes`, so default it.
export const toGameWithId = (id: string, data: unknown): GameEntryWithId => ({
  ...(data as GameEntry),
  notes: (data as Partial<GameEntry>).notes ?? '',
  id,
});

export type WatchGamesFn = (firestore: Firestore, uid: string) => Observable<GameEntryWithId[]>;

/** Streams one user's games, live. A failure ends the stream with an empty list. */
export const watchUserGames: WatchGamesFn = (firestore, uid) =>
  collectionData(collection(firestore, ...userGamesPath(uid)) as CollectionReference<GameEntryWithId>, {
    idField: 'id',
  }).pipe(
    map((games) => games.map((game) => toGameWithId(game.id, game))),
    catchError((error) => {
      console.error(loadErrorMessage(error), error);
      return of([] as GameEntryWithId[]);
    }),
  );

/** The Firestore games stream. A token so tests can swap it without mocking the module. */
export const WATCH_GAMES = new InjectionToken<WatchGamesFn>('WATCH_GAMES', {
  providedIn: 'root',
  factory: () => watchUserGames,
});

@Service()
export class GameVaultCrudService {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);
  private readonly watch = inject(WATCH_GAMES);
  private readonly userId = inject(Authservice).userId;

  /** READ (list) for the signed-in user. `null` = user unknown or loading, `[]` = signed out or empty. */
  readonly games: Signal<GameEntryWithId[] | null> = toSignal(
    toObservable(this.userId).pipe(
      switchMap((uid) => gamesFor(uid, (id) => this.inContext(() => this.watch(this.firestore, id)))),
    ),
    { initialValue: null },
  );

  /** CREATE. Resolves with the new document id. Rejects when nobody is signed in. */
  async create(game: NewGameEntry, addedAt = Date.now()): Promise<string> {
    const uid = requireUserId(this.userId());
    const gamesRef = collection(this.firestore, ...userGamesPath(uid));
    const created = await this.inContext(() => addDoc(gamesRef, withAddedAt(game, addedAt)));
    return created.id;
  }

  /** READ (single). Resolves with `null` when the document does not exist. */
  async read(id: string): Promise<GameEntryWithId | null> {
    const uid = requireUserId(this.userId());
    assertId(id);
    const snapshot = await this.inContext(() => getDoc(this.gameDoc(uid, id)));
    if (!snapshot.exists()) return null;
    return toGameWithId(snapshot.id, snapshot.data());
  }

  /** UPDATE. Only the fields passed in `changes` are written. */
  async update(id: string, changes: GameEntryChanges): Promise<void> {
    const uid = requireUserId(this.userId());
    assertId(id);
    await this.inContext(() => updateDoc(this.gameDoc(uid, id), { ...changes }));
  }

  /** DELETE. */
  async delete(id: string): Promise<void> {
    const uid = requireUserId(this.userId());
    assertId(id);
    await this.inContext(() => deleteDoc(this.gameDoc(uid, id)));
  }

  // AngularFire expects its calls inside an injection context. Event handlers run outside one.
  private inContext<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }

  private gameDoc(uid: string, id: string) {
    return doc(this.firestore, ...gamePath(uid, id));
  }
}
