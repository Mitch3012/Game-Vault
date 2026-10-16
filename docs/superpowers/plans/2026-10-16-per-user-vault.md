# Per-user Vaults Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the unbuilt parts of the per-user vault spec: each signed-in user gets a private vault at `users/{uid}/games`, vault pages need sign-in, and the title and login footer match the spec.

**Architecture:** `Authservice` exposes a `userId` signal and derives `signedIn` from it. `GameVaultCrudService` builds its Firestore paths from that uid (reactive `games`, guarded writes). The facade gets a `homeRoute` computed; a functional `signedInGuard` protects the vault routes; `App` links its heading to `homeRoute`. Pure logic goes in helper files.

**Tech Stack:** Angular 22 (signals, functional guards), `@angular/fire` (Auth, Firestore), RxJS, Vitest + jsdom.

**Spec:** `docs/superpowers/specs/2026-10-14-per-user-vault-design.md`

## Global Constraints

All paths are relative to the app root `game-vault/`. Run commands from there.

- Follow `../CLAUDE.md`: components UI only; pure functions; guard clauses; maps over else-if; files under 300 lines; functions 10 to 15 lines; shared constants in constants files; no `effect`, no `.subscribe` in app code; `toSignal` / `computed` / `toObservable`; `templateUrl`; Firebase imports only in services; `null` = loading and `[]` = empty.
- `userId` contract: `null` = Firebase has not answered, `''` = signed out, otherwise the uid.
- `games` contract: `null` while the user is unknown or loading, `[]` when signed out or empty.
- Exact copy from the spec: login footer is "New to Game Vault? Sign up here" linking to `/signup`.
- `homeRoute`: `/auth` when signed out or unknown, `/` when signed in.
- Out of scope (spec): moving or deleting the old shared `games` collection, sharing lists, search/RAWG changes, profile page, "remember me".
- Do not run `git commit` or `git push` unless the user asks. Each task's Commit step is the message to use when they do. End commit messages with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Run one spec with `npx ng test --watch=false --include <path>`; all with `npx ng test --watch=false`.

## Review Focus

1. A write (`create`, `read`, `update`, `delete`) while signed out or while sign-in is unknown must reject with a clear error and never touch Firestore. [Task 3]
2. Sign-out, or switching accounts, must clear the previous user's games from `games` at once and never show them to the next user. [Task 3]
3. Reloading `/game-list` or `/form/:id` while signed in must not bounce to `/auth` before Firebase has answered. [Task 5]
4. Logged-out visitors on the open routes (`/`, `/auth`, `/signup`) must not be redirected. [Task 5]
5. Existing flows (login, signup, logout, add-to-vault redirect, AI suggestions) must keep working unchanged. [Tasks 2, 3, 4]

---

### Task 1: Constants and pure helpers

**Files:**
- Modify: `src/app/auth/auth.constants.ts`
- Modify: `src/app/game-vault.constants.ts`
- Modify: `src/app/auth/auth-helpers.ts`
- Modify: `src/app/auth/auth-helpers.spec.ts`
- Create: `src/app/game-vault-crud-helpers.ts`
- Create: `src/app/game-vault-crud-helpers.spec.ts`

**Interfaces:**
- Produces:
  - `HOME_ROUTE = '/'` (in `auth.constants.ts`, next to `LOGIN_ROUTE`; `LOGIN_SUCCESS_ROUTE` becomes `HOME_ROUTE`)
  - `USERS_COLLECTION = 'users'`, `GAMES_SUBCOLLECTION = 'games'`, `NO_USER_ERROR` (in `game-vault.constants.ts`)
  - `signedInFrom(userId: string | null): boolean | null`
  - `homeRouteFor(signedIn: boolean | null): string`
  - `userGamesPath(uid: string): [string, string, string]`
  - `gamePath(uid: string, id: string): [string, string, string, string]`
  - `requireUserId(uid: string | null): string` (throws `NO_USER_ERROR` for `null` or `''`)
  - `gamesFor(uid: string | null, watch: (uid: string) => Observable<GameEntryWithId[]>): Observable<GameEntryWithId[] | null>`

- [ ] **Step 1: Write the failing tests**

Append to `src/app/auth/auth-helpers.spec.ts` (add `homeRouteFor, signedInFrom` to the existing `./auth-helpers` import, and `import { HOME_ROUTE, LOGIN_ROUTE } from './auth.constants';` if not present):

```ts
describe('signedInFrom', () => {
  it('is null while the user is unknown', () => {
    expect(signedInFrom(null)).toBeNull();
  });

  it('is false when signed out', () => {
    expect(signedInFrom('')).toBe(false);
  });

  it('is true for a uid', () => {
    expect(signedInFrom('u1')).toBe(true);
  });
});

describe('homeRouteFor', () => {
  it('is home when signed in', () => {
    expect(homeRouteFor(true)).toBe(HOME_ROUTE);
  });

  it('is the login page when signed out', () => {
    expect(homeRouteFor(false)).toBe(LOGIN_ROUTE);
  });

  it('is the login page while it is unknown', () => {
    expect(homeRouteFor(null)).toBe(LOGIN_ROUTE);
  });
});
```

Create `src/app/game-vault-crud-helpers.spec.ts`:

```ts
import { firstValueFrom, of } from 'rxjs';

import { gamePath, gamesFor, requireUserId, userGamesPath } from './game-vault-crud-helpers';
import { GameEntryWithId } from './game-vault-interface';
import { NO_USER_ERROR } from './game-vault.constants';

const game = { id: 'g1', rawgId: 1, title: 'Hades' } as GameEntryWithId;

describe('userGamesPath', () => {
  it('puts the games under the user', () => {
    expect(userGamesPath('u1')).toEqual(['users', 'u1', 'games']);
  });
});

describe('gamePath', () => {
  it('points at one game under the user', () => {
    expect(gamePath('u1', 'g1')).toEqual(['users', 'u1', 'games', 'g1']);
  });
});

describe('requireUserId', () => {
  it('returns the uid', () => {
    expect(requireUserId('u1')).toBe('u1');
  });

  it('throws when the user is unknown', () => {
    expect(() => requireUserId(null)).toThrow(NO_USER_ERROR);
  });

  it('throws when signed out', () => {
    expect(() => requireUserId('')).toThrow(NO_USER_ERROR);
  });
});

describe('gamesFor', () => {
  const watch = vi.fn((uid: string) => of([{ ...game, id: uid }]));

  beforeEach(() => watch.mockClear());

  it('is null while the user is unknown, without watching anything', async () => {
    await expect(firstValueFrom(gamesFor(null, watch))).resolves.toBeNull();
    expect(watch).not.toHaveBeenCalled();
  });

  it('is empty when signed out, without watching anything', async () => {
    await expect(firstValueFrom(gamesFor('', watch))).resolves.toEqual([]);
    expect(watch).not.toHaveBeenCalled();
  });

  it('watches the signed-in user', async () => {
    await expect(firstValueFrom(gamesFor('u1', watch))).resolves.toEqual([{ ...game, id: 'u1' }]);
    expect(watch).toHaveBeenCalledExactlyOnceWith('u1');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx ng test --watch=false --include src/app/auth/auth-helpers.spec.ts --include src/app/game-vault-crud-helpers.spec.ts`
Expected: FAIL. `signedInFrom` / `homeRouteFor` not exported, and `Cannot find module './game-vault-crud-helpers'`.

- [ ] **Step 3: Write the minimal implementation**

In `src/app/auth/auth.constants.ts`, replace `export const LOGIN_SUCCESS_ROUTE = '/';` with:

```ts
export const HOME_ROUTE = '/';
export const LOGIN_SUCCESS_ROUTE = HOME_ROUTE;
```

In `src/app/game-vault.constants.ts`, replace the first line `export const GAMES_COLLECTION = 'games';` with (keep `GAMES_COLLECTION` until Task 7 removes it):

```ts
export const GAMES_COLLECTION = 'games';
export const USERS_COLLECTION = 'users';
export const GAMES_SUBCOLLECTION = 'games';
export const NO_USER_ERROR = 'GameVaultCrudService: no user is signed in';
```

Append to `src/app/auth/auth-helpers.ts` (and add `import { HOME_ROUTE, LOGIN_ROUTE } from './auth.constants';` merged into the existing constants import):

```ts

/** `null` = the user is not known yet, `''` = nobody is signed in, otherwise a uid. */
export const signedInFrom = (userId: string | null): boolean | null => (userId === null ? null : userId !== '');

/** Where the app title should go: home when signed in, the login page otherwise. */
export const homeRouteFor = (signedIn: boolean | null): string => (signedIn ? HOME_ROUTE : LOGIN_ROUTE);
```

Create `src/app/game-vault-crud-helpers.ts`:

```ts
import { Observable, of } from 'rxjs';

import { GameEntryWithId } from './game-vault-interface';
import { GAMES_SUBCOLLECTION, NO_USER_ERROR, USERS_COLLECTION } from './game-vault.constants';

export const userGamesPath = (uid: string): [string, string, string] => [
  USERS_COLLECTION,
  uid,
  GAMES_SUBCOLLECTION,
];

export const gamePath = (uid: string, id: string): [string, string, string, string] => [
  ...userGamesPath(uid),
  id,
];

/** The signed-in uid, or throws when nobody is signed in or it is not known yet. */
export const requireUserId = (uid: string | null): string => {
  if (!uid) throw new Error(NO_USER_ERROR);
  return uid;
};

/** `null` = user unknown, `[]` = signed out, otherwise the user's own games. */
export const gamesFor = (
  uid: string | null,
  watch: (uid: string) => Observable<GameEntryWithId[]>,
): Observable<GameEntryWithId[] | null> => {
  if (uid === null) return of(null);
  if (!uid) return of([]);
  return watch(uid);
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx ng test --watch=false --include src/app/auth/auth-helpers.spec.ts --include src/app/game-vault-crud-helpers.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/auth src/app/game-vault.constants.ts src/app/game-vault-crud-helpers.ts src/app/game-vault-crud-helpers.spec.ts
git commit -m "feat: add per-user vault constants and helpers"
```

---

### Task 2: `Authservice.userId`

**Files:**
- Modify: `src/app/auth/auth-service.ts`
- Modify: `src/app/auth/auth-service.spec.ts`

**Interfaces:**
- Consumes: `signedInFrom` (Task 1).
- Produces: `Authservice.userId: Signal<string | null>`; `Authservice.signedIn: Signal<boolean | null>` now a `computed` over it (same values as before).

- [ ] **Step 1: Write the failing test**

In `src/app/auth/auth-service.spec.ts`, add this block directly before `describe('signedIn', ...)`:

```ts
  describe('userId', () => {
    it('is null until Firebase reports the auth state', () => {
      expect(service.userId()).toBeNull();
    });

    it('is the uid once a user is signed in', () => {
      authState.next({ uid: 'u1' } as User);
      expect(service.userId()).toBe('u1');
    });

    it('is an empty string when nobody is signed in', () => {
      authState.next(null);
      expect(service.userId()).toBe('');
    });

    it('follows the user when they change', () => {
      authState.next({ uid: 'u1' } as User);
      authState.next({ uid: 'u2' } as User);
      expect(service.userId()).toBe('u2');
    });
  });

```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --include src/app/auth/auth-service.spec.ts`
Expected: FAIL, `service.userId` does not exist (TypeScript error).

- [ ] **Step 3: Write the minimal implementation**

In `src/app/auth/auth-service.ts`:

a. Change the first import to
`import { Injector, InjectionToken, Service, Signal, computed, inject, runInInjectionContext } from '@angular/core';`
and add `import { signedInFrom } from './auth-helpers';` after the rxjs import.

b. Replace the `signedIn` field (its doc comment and the whole `toSignal(...)` expression) with:

```ts
  /** The signed-in user's uid. `null` = Firebase has not said yet, `''` = nobody is signed in. */
  readonly userId: Signal<string | null> = toSignal(
    this.authState(this.auth).pipe(map((user) => user?.uid ?? '')),
    { initialValue: null },
  );

  /** Whether a user is signed in. `null` = Firebase has not said yet. */
  readonly signedIn: Signal<boolean | null> = computed(() => signedInFrom(this.userId()));
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx ng test --watch=false --include src/app/auth/auth-service.spec.ts`
Expected: PASS, including the existing `signedIn` tests.

- [ ] **Step 5: Commit**

```bash
git add src/app/auth/auth-service.ts src/app/auth/auth-service.spec.ts
git commit -m "feat: expose userId from Authservice"
```

---

### Task 3: Per-user storage in `GameVaultCrudService`

**Files:**
- Modify: `src/app/game-vault-crud-service.ts`
- Create: `src/app/game-vault-crud-service.spec.ts`

**Interfaces:**
- Consumes: `Authservice.userId` (Task 2); `gamesFor`, `gamePath`, `userGamesPath`, `requireUserId` (Task 1).
- Produces: `WATCH_GAMES` token (`InjectionToken<WatchGamesFn>`), `WatchGamesFn = (firestore: Firestore, uid: string) => Observable<GameEntryWithId[]>`, `watchUserGames`; `GameVaultCrudService.games` now per-user; all writes reject with `NO_USER_ERROR` when `userId` is `null` or `''`.

- [ ] **Step 1: Write the failing test**

Create `src/app/game-vault-crud-service.spec.ts`:

```ts
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

    it('is null until the signed-in user\'s games arrive, then shows them', () => {
      userId.set('u1');
      TestBed.tick();
      expect(watch).toHaveBeenCalledExactlyOnceWith(fakeFirestore, 'u1');
      expect(service.games()).toBeNull();
      streams.get('u1')!.next([saved('g1')]);
      expect(service.games()).toEqual([expect.objectContaining({ id: 'g1' })]);
    });

    it('switches to the new user\'s games, and never shows the previous user\'s', () => {
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --include src/app/game-vault-crud-service.spec.ts`
Expected: FAIL, `WATCH_GAMES` is not exported.

- [ ] **Step 3: Write the minimal implementation**

Replace the entire contents of `src/app/game-vault-crud-service.ts` with:

```ts
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
import { gamePath, gamesFor, requireUserId, userGamesPath } from './game-vault-crud-helpers';
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
      console.error('[GameVaultCrudService] failed to load games', error);
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx ng test --watch=false`
Expected: PASS for the whole suite. If another spec fails because it provides `GameVaultCrudService` indirectly and now needs `Authservice.userId`, update that spec's `Authservice` fake to include `userId: signal<string | null>(null)`.

- [ ] **Step 5: Commit**

```bash
git add src/app/game-vault-crud-service.ts src/app/game-vault-crud-service.spec.ts
git commit -m "feat: store each user's games under users/{uid}/games"
```

---

### Task 4: Facade `homeRoute`

**Files:**
- Modify: `src/app/game-vault-service.ts`
- Modify: `src/app/game-vault-service.spec.ts`

**Interfaces:**
- Consumes: `homeRouteFor` (Task 1), `Authservice.signedIn`.
- Produces: `GameVaultService.homeRoute: Signal<string>`.

- [ ] **Step 1: Write the failing test**

In `src/app/game-vault-service.spec.ts`, add before `describe('logout', ...)`:

```ts
  describe('homeRoute', () => {
    it('is home when signed in', () => {
      auth.signedIn.set(true);
      expect(service.homeRoute()).toBe('/');
    });

    it('is the login page when signed out', () => {
      auth.signedIn.set(false);
      expect(service.homeRoute()).toBe('/auth');
    });

    it('is the login page while it is unknown', () => {
      auth.signedIn.set(null);
      expect(service.homeRoute()).toBe('/auth');
    });
  });

```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --include src/app/game-vault-service.spec.ts`
Expected: FAIL, `service.homeRoute` does not exist.

- [ ] **Step 3: Write the minimal implementation**

In `src/app/game-vault-service.ts`:

a. Change `import { Service, inject, signal } from '@angular/core';` to `import { Service, computed, inject, signal } from '@angular/core';`.

b. Change `import { loginErrorMessage, signupErrorMessage } from './auth/auth-helpers';` to `import { homeRouteFor, loginErrorMessage, signupErrorMessage } from './auth/auth-helpers';`.

c. Directly after the `signedIn` field (`readonly signedIn = this.auth.signedIn;`) add:

```ts

  /** Where the app title links: home when signed in, the login page otherwise. */
  readonly homeRoute = computed(() => homeRouteFor(this.auth.signedIn()));
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx ng test --watch=false --include src/app/game-vault-service.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/game-vault-service.ts src/app/game-vault-service.spec.ts
git commit -m "feat: add homeRoute to the facade"
```

---

### Task 5: `signedInGuard` and protected routes

**Files:**
- Create: `src/app/auth/signed-in-guard.ts`
- Create: `src/app/auth/signed-in-guard.spec.ts`
- Modify: `src/app/app.routes.ts`
- Create: `src/app/app.routes.spec.ts`

**Interfaces:**
- Consumes: `GameVaultService.signedIn`, `LOGIN_ROUTE` (`auth.constants.ts`).
- Produces: `signedInGuard: CanActivateFn`.

- [ ] **Step 1: Write the failing tests**

Create `src/app/auth/signed-in-guard.spec.ts`:

```ts
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { Observable } from 'rxjs';

import { GameVaultService } from '../game-vault-service';
import { signedInGuard } from './signed-in-guard';

describe('signedInGuard', () => {
  const vault = { signedIn: signal<boolean | null>(null) };
  let results: (boolean | UrlTree)[];

  const run = () => {
    const outcome = TestBed.runInInjectionContext(() =>
      signedInGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as Observable<boolean | UrlTree>;
    outcome.subscribe((result) => results.push(result));
    TestBed.tick();
  };

  beforeEach(() => {
    vault.signedIn.set(null);
    results = [];
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: GameVaultService, useValue: vault }],
    });
  });

  it('waits while it is unknown whether anyone is signed in', () => {
    run();
    expect(results).toEqual([]);
  });

  it('allows a signed-in user straight away', () => {
    vault.signedIn.set(true);
    run();
    expect(results).toEqual([true]);
  });

  it('redirects a signed-out user to the login page', () => {
    vault.signedIn.set(false);
    run();
    expect(results).toHaveLength(1);
    expect((results[0] as UrlTree).toString()).toBe('/auth');
  });

  it('allows the user once Firebase says they are signed in', () => {
    run();
    vault.signedIn.set(true);
    TestBed.tick();
    expect(results).toEqual([true]);
  });

  it('redirects once Firebase says nobody is signed in', () => {
    run();
    vault.signedIn.set(false);
    TestBed.tick();
    expect((results[0] as UrlTree).toString()).toBe('/auth');
  });

  it('decides only once', () => {
    vault.signedIn.set(true);
    run();
    vault.signedIn.set(false);
    TestBed.tick();
    expect(results).toEqual([true]);
  });
});
```

Create `src/app/app.routes.spec.ts`:

```ts
import { signedInGuard } from './auth/signed-in-guard';
import { routes } from './app.routes';

const routeFor = (path: string) => routes.find((route) => route.path === path);

describe('routes', () => {
  it.each(['game-list', 'form/:id'])('requires sign-in for %s', (path) => {
    expect(routeFor(path)?.canActivate).toEqual([signedInGuard]);
  });

  it.each(['', 'auth', 'signup'])('leaves "%s" open to everyone', (path) => {
    expect(routeFor(path)?.canActivate).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx ng test --watch=false --include src/app/auth/signed-in-guard.spec.ts --include src/app/app.routes.spec.ts`
Expected: FAIL, `Cannot find module './signed-in-guard'`.

- [ ] **Step 3: Write the minimal implementation**

Create `src/app/auth/signed-in-guard.ts`:

```ts
import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';

import { GameVaultService } from '../game-vault-service';
import { LOGIN_ROUTE } from './auth.constants';

/** Waits until Firebase has answered, then lets signed-in users through and sends everyone else to login. */
export const signedInGuard: CanActivateFn = () => {
  const signedIn = inject(GameVaultService).signedIn;
  const router = inject(Router);
  return toObservable(signedIn).pipe(
    filter((value) => value !== null),
    take(1),
    map((value) => value || router.createUrlTree([LOGIN_ROUTE])),
  );
};
```

In `src/app/app.routes.ts`:

a. Add `import { signedInGuard } from './auth/signed-in-guard';` after the `Signup` import.

b. Replace the `form/:id` and `game-list` route lines with:

```ts
  { path: 'form/:id', component: Form, canActivate: [signedInGuard] },
  { path: 'form', redirectTo: 'game-list', pathMatch: 'full' },
  { path: 'game-list', component: GameList, canActivate: [signedInGuard] },
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx ng test --watch=false --include src/app/auth/signed-in-guard.spec.ts --include src/app/app.routes.spec.ts`
Expected: PASS, 6 guard tests and 5 route tests.

- [ ] **Step 5: Commit**

```bash
git add src/app/auth/signed-in-guard.ts src/app/auth/signed-in-guard.spec.ts src/app/app.routes.ts src/app/app.routes.spec.ts
git commit -m "feat: require sign-in for the vault pages"
```

---

### Task 6: App title links to `homeRoute`

**Files:**
- Modify: `src/app/app.ts`
- Modify: `src/app/app.html`
- Modify: `src/app/app.spec.ts`

**Interfaces:**
- Consumes: `GameVaultService.homeRoute` (Task 4).

- [ ] **Step 1: Write the failing test**

In `src/app/app.spec.ts`:

a. Change the `vault` fake to
`const vault = { signedIn: signal<boolean | null>(false), homeRoute: signal('/auth'), logout: vi.fn() };`

b. In `beforeEach`, after `vault.signedIn.set(false);` add `vault.homeRoute.set('/auth');`.

c. Add these tests before `it('should create the app', ...)`:

```ts
  it('links the title to the login page when signed out', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const link = (fixture.nativeElement as HTMLElement).querySelector('h1 a');
    expect(link?.getAttribute('href')).toBe('/auth');
    expect(link?.textContent).toContain('Game Vault');
  });

  it('links the title to home when signed in', async () => {
    vault.homeRoute.set('/');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('h1 a')?.getAttribute('href')).toBe('/');
  });

```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --include src/app/app.spec.ts`
Expected: FAIL, `h1 a` not found (2 failures); the rest pass.

- [ ] **Step 3: Write the minimal implementation**

In `src/app/app.ts`:

a. Change the router import to `import { RouterLink, RouterOutlet } from '@angular/router';` and `imports: [RouterOutlet]` to `imports: [RouterLink, RouterOutlet]`.

b. After `protected readonly signedIn = this.vault.signedIn;` add:

```ts
  protected readonly homeRoute = this.vault.homeRoute;
```

In `src/app/app.html`, replace the text line `  Welcome to the Game Vault` with:

```html
  <a class="text-inherit no-underline" [routerLink]="homeRoute()">Welcome to the Game Vault</a>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx ng test --watch=false --include src/app/app.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/app.ts src/app/app.html src/app/app.spec.ts
git commit -m "feat: link the app title to the right home page"
```

---

### Task 7: Login footer, Firestore rules, cleanup, docs, verify

**Files:**
- Modify: `src/app/auth/login/login.html`
- Modify: `src/app/auth/login/login.spec.ts`
- Create: `firestore.rules`
- Modify: `src/app/game-vault.constants.ts` (remove `GAMES_COLLECTION`)
- Modify: `README.md`, `PRODUCT.md`

**Interfaces:**
- Consumes: nothing new. This task closes the spec.

- [ ] **Step 1: Write the failing test**

In `src/app/auth/login/login.spec.ts`, in the test `invites new users to sign up at the bottom of the form`, change

```ts
    expect(footer?.querySelector('a')?.textContent).toContain('Sign up');
```

to

```ts
    expect(footer?.querySelector('a')?.textContent).toContain('Sign up here');
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --include src/app/auth/login/login.spec.ts`
Expected: FAIL, the link text is "Sign up".

- [ ] **Step 3: Write the minimal implementation**

In `src/app/auth/login/login.html`, change `>Sign up</a>` to `>Sign up here</a>`.

Create `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/games/{gameId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Confirm nothing else uses the old constant, then remove it:

Run: `grep -rn "GAMES_COLLECTION" src`
Expected: only the definition in `src/app/game-vault.constants.ts`. Delete the line `export const GAMES_COLLECTION = 'games';`.

Docs:

a. `README.md` Routes table: replace
`| \`/game-list\`    | Your vault: every saved game                    |` with
`| \`/game-list\`    | Your vault: every saved game (sign-in required) |` and
`| \`/form/:id\`     | Edit a saved game's status, rating and notes    |` with
`| \`/form/:id\`     | Edit a saved game (sign-in required)            |`.

b. `README.md` Data model: replace the sentence `Games are stored in the Firestore \`games\` collection:` with
`Each user's games are stored in the Firestore subcollection \`users/{uid}/games\`:`.

c. `README.md` Configure section: after the paragraph ending `...keep it out of public source control.`, add:

```md

### Firestore rules

Paste [firestore.rules](firestore.rules) into the Firebase console (Firestore, Rules). Until you do, the vault cannot read or write `users/{uid}/games` and will look empty.
```

d. `PRODUCT.md`: replace `- User accounts and per-user vaults` (Out of scope) with `- Sharing vaults between users`; delete the Known gaps line `- No sign-in, so the vault is shared by everyone who uses the app.`; and delete the Proposed next steps item `4. Add authentication so each user has a private vault, with matching Firestore security rules.` (renumber the next item to 4).

- [ ] **Step 4: Run the full suite, build and rule checks**

Run: `npx ng test --watch=false`
Expected: all files pass, 0 failures.

Run: `npx ng build`
Expected: exit 0.

Run:

```bash
find src -name "*.ts" -o -name "*.html" | xargs wc -l | awk '$1>300 && $2!="total"'
grep -rnE "\.subscribe\(|\beffect\(" src --include=*.ts --exclude=*.spec.ts
grep -rn "template:" src --include=*.ts --exclude=*.spec.ts
```

Expected: all three print nothing.

- [ ] **Step 5: Commit**

```bash
git add src firestore.rules README.md PRODUCT.md
git commit -m "feat: finish per-user vaults (rules, login footer, docs)"
```
