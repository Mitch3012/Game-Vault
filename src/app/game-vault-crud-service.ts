import { Injector, Service, Signal, inject, runInInjectionContext } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { catchError, map, of } from 'rxjs';

// DRAFT for review. Move these into game-vault-interface.ts / a constants file when approved.
export const GAMES_COLLECTION = 'games';

export type GameStatus = 'wishlist' | 'playing' | 'completed' | 'dropped';

export interface GameEntry {
  rawgId: number;
  title: string;
  coverUrl: string;
  platforms: string[];
  genres: string[];
  releaseDate: string;
  rating: number | null;
  status: GameStatus;
  notes: string;
  addedAt: number;
}

export interface GameEntryWithId extends GameEntry {
  id: string;
}

export type NewGameEntry = Omit<GameEntry, 'addedAt'>;
export type GameEntryChanges = Partial<Omit<GameEntry, 'addedAt'>>;

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

@Service()
export class GameVaultCrudService {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(Injector);
  private readonly gamesRef = collection(this.firestore, GAMES_COLLECTION);

  /** READ (list). `null` = still loading, `[]` = loaded but empty. */
  readonly games: Signal<GameEntryWithId[] | null> = toSignal(this.watchGames(), { initialValue: null });

  /** CREATE. Resolves with the new document id. */
  async create(game: NewGameEntry, addedAt = Date.now()): Promise<string> {
    const created = await this.inContext(() => addDoc(this.gamesRef, withAddedAt(game, addedAt)));
    return created.id;
  }

  /** READ (single). Resolves with `null` when the document does not exist. */
  async read(id: string): Promise<GameEntryWithId | null> {
    assertId(id);
    const snapshot = await this.inContext(() => getDoc(this.gameDoc(id)));
    if (!snapshot.exists()) return null;
    return toGameWithId(snapshot.id, snapshot.data());
  }

  /** UPDATE. Only the fields passed in `changes` are written. */
  async update(id: string, changes: GameEntryChanges): Promise<void> {
    assertId(id);
    await this.inContext(() => updateDoc(this.gameDoc(id), { ...changes }));
  }

  /** DELETE. */
  async delete(id: string): Promise<void> {
    assertId(id);
    await this.inContext(() => deleteDoc(this.gameDoc(id)));
  }

  // AngularFire expects its calls inside an injection context. Event handlers run outside one.
  private inContext<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }

  private gameDoc(id: string) {
    return doc(this.firestore, GAMES_COLLECTION, id);
  }

  private watchGames() {
    return collectionData(this.gamesRef as CollectionReference<GameEntryWithId>, { idField: 'id' }).pipe(
      map((games) => games.map((game) => toGameWithId(game.id, game))),
      catchError((error) => {
        console.error('[GameVaultCrudService] failed to load games', error);
        return of([] as GameEntryWithId[]);
      }),
    );
  }
}
