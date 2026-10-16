# AI Game Suggestions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an AI on/off switch to the game list page that, when on, shows up to 6 Gemini-chosen game suggestions (real RAWG games) based on the user's vault.

**Architecture:** All logic lives in the `ai/` folder. A new `SuggestionsService` builds a prompt from the vault, calls the existing `AiService`, resolves each returned title through RAWG, and exposes signals driven by one Angular `resource`. `GameVaultService` only gets one-line pointers to it. Two dumb components (`AiToggle`, `Suggestions`) render the UI and `GameList` wires them to the facade.

**Tech Stack:** Angular 22 (signals, `resource`), `@angular/fire/ai` (Firebase AI Logic / Gemini), RAWG API, Tailwind 4, Vitest + jsdom.

**Spec:** `docs/superpowers/specs/2026-10-16-ai-suggestions-design.md`

## Global Constraints

All paths are relative to the app root `game-vault/`. Run commands from there.

- Follow `../CLAUDE.md` (the repo-root rules): components are UI only; pure functions first; guard clauses; maps over else-if; files under 300 lines; functions 10 to 15 lines max; shared constants in a constants file; no `effect`, no `.subscribe`, use `computed` / `toSignal` / `resource`; templates in separate `.html` files (`templateUrl`); `null` = loading and `[]` = empty; Firebase imports only in services.
- `SuggestionsService` must NOT inject `GameVaultService` (circular dependency). It reads the vault from `GameVaultCrudService.games`.
- `GameVaultService` stays a facade of one-line pointers only. Components talk only to the facade.
- Notes are never sent to the AI. Only title, genres, status and rating.
- Suggestions size: `SUGGESTION_COUNT = 6`. Switch is off by default and is not persisted.
- Do not run `git commit` or `git push` unless the user asks. Each task's Commit step gives the message to use when they do. End commit messages with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Run one spec with `npx ng test --watch=false --include <path>`; run everything with `npx ng test --watch=false`.

## Review Focus

Input classes and failure modes the spec implies. Each has a test in the task named in brackets.

1. The AI replies with prose, a fenced ```` ```json ```` block, or JSON that is not an array: no crash, empty or parsed result. [Task 1, Task 3]
2. The AI suggests a game already in the vault, the same game twice, or a title RAWG cannot find: it is dropped, never shown or shown twice. [Task 1, Task 2, Task 3]
3. The user clicks Add on a suggestion: the vault changes but the AI is not asked again. [Task 3]
4. The vault empties (signed out) or starts empty while the switch is on: no AI call, suggestions clear, hint shows. [Task 3, Task 6]
5. The AI call fails (AI Logic not enabled in the Firebase console, quota, offline): a visible failure message and a `console.error`, not a silent blank. [Task 3, Task 6]

---

### Task 1: Constants and pure helpers

**Files:**
- Create: `src/app/ai/suggestions.constants.ts`
- Create: `src/app/ai/suggestions-helpers.ts`
- Test: `src/app/ai/suggestions-helpers.spec.ts`

**Interfaces:**
- Consumes: `GameEntry`, `GameEntryWithId`, `NewGameEntry` from `src/app/game-vault-interface.ts`.
- Produces (used by Tasks 3 and 6):
  - constants: `SUGGESTION_COUNT`, `SUGGESTIONS_LOADING_TEXT`, `SUGGESTIONS_EMPTY_VAULT_TEXT`, `SUGGESTIONS_FAILED_TEXT`, `SUGGESTIONS_NONE_TEXT`, `AI_PRIVACY_NOTE`
  - `type VaultState = 'loading' | 'empty' | 'ready'`
  - `vaultStateOf(games: GameEntryWithId[] | null): VaultState`
  - `buildSuggestionPrompt(games: VaultGame[], count?: number): string`
  - `parseTitles(text: string): string[]`
  - `compact<T>(items: (T | undefined)[]): T[]`
  - `uniqueByRawgId(entries: NewGameEntry[]): NewGameEntry[]`
  - `excludeSaved(entries: NewGameEntry[], savedRawgIds: ReadonlySet<number>): NewGameEntry[]`
  - `suggestionsMessage(view: { games: NewGameEntry[] | null; failed: boolean; vaultEmpty: boolean }): string`

- [ ] **Step 1: Write the failing test**

Create `src/app/ai/suggestions-helpers.spec.ts`:

```ts
import { GameEntryWithId, NewGameEntry } from '../game-vault-interface';
import {
  buildSuggestionPrompt,
  compact,
  excludeSaved,
  parseTitles,
  suggestionsMessage,
  uniqueByRawgId,
  vaultStateOf,
} from './suggestions-helpers';
import {
  SUGGESTIONS_EMPTY_VAULT_TEXT,
  SUGGESTIONS_FAILED_TEXT,
  SUGGESTIONS_LOADING_TEXT,
  SUGGESTIONS_NONE_TEXT,
} from './suggestions.constants';

const entry = (rawgId: number): NewGameEntry => ({
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

const saved = (overrides: Partial<GameEntryWithId> = {}): GameEntryWithId => ({
  ...entry(1),
  id: 'doc1',
  title: 'Hades',
  addedAt: 0,
  ...overrides,
});

describe('vaultStateOf', () => {
  it('is loading until the vault has loaded', () => {
    expect(vaultStateOf(null)).toBe('loading');
  });

  it('is empty for a vault with no games', () => {
    expect(vaultStateOf([])).toBe('empty');
  });

  it('is ready for a vault with games', () => {
    expect(vaultStateOf([saved()])).toBe('ready');
  });
});

describe('buildSuggestionPrompt', () => {
  it('lists each game with its genres, status and rating', () => {
    const game = saved({ genres: ['Action', 'Roguelike'], status: 'completed', rating: 5 });
    expect(buildSuggestionPrompt([game])).toContain('- Hades (Action, Roguelike; completed; 5/5)');
  });

  it('leaves out the rating and genres when there are none', () => {
    expect(buildSuggestionPrompt([saved()])).toContain('- Hades (wishlist)');
  });

  it('asks for the given number of titles as a JSON array and not to repeat games', () => {
    const prompt = buildSuggestionPrompt([saved()], 3);
    expect(prompt).toContain('Suggest 3 other');
    expect(prompt).toContain('JSON array');
    expect(prompt).toContain('Do not repeat');
  });

  it('never includes the notes', () => {
    expect(buildSuggestionPrompt([saved({ notes: 'secret plan' })])).not.toContain('secret plan');
  });
});

describe('parseTitles', () => {
  it('reads a plain JSON array', () => {
    expect(parseTitles('["Celeste","Hades"]')).toEqual(['Celeste', 'Hades']);
  });

  it('reads a JSON array wrapped in a code fence', () => {
    expect(parseTitles('```json\n["Celeste"]\n```')).toEqual(['Celeste']);
  });

  it('trims titles and drops blanks and non-strings', () => {
    expect(parseTitles('[" Celeste ", "", 5, null, "Hades"]')).toEqual(['Celeste', 'Hades']);
  });

  it('removes duplicate titles', () => {
    expect(parseTitles('["Celeste","Celeste"]')).toEqual(['Celeste']);
  });

  it('returns nothing for text that is not JSON', () => {
    expect(parseTitles('Sorry, I cannot help with that.')).toEqual([]);
  });

  it('returns nothing for JSON that is not an array', () => {
    expect(parseTitles('{"games":["Celeste"]}')).toEqual([]);
  });
});

describe('compact', () => {
  it('removes undefined values', () => {
    expect(compact([1, undefined, 2])).toEqual([1, 2]);
  });
});

describe('uniqueByRawgId', () => {
  it('keeps the first entry for each RAWG id', () => {
    expect(uniqueByRawgId([entry(1), entry(2), entry(1)]).map((e) => e.rawgId)).toEqual([1, 2]);
  });
});

describe('excludeSaved', () => {
  it('removes games whose RAWG id is already saved', () => {
    expect(excludeSaved([entry(1), entry(2)], new Set([1])).map((e) => e.rawgId)).toEqual([2]);
  });
});

describe('suggestionsMessage', () => {
  const view = { games: [entry(1)] as NewGameEntry[] | null, failed: false, vaultEmpty: false };

  it('says the vault is empty, even when there are no games to show', () => {
    expect(suggestionsMessage({ ...view, games: [], vaultEmpty: true })).toBe(SUGGESTIONS_EMPTY_VAULT_TEXT);
  });

  it('says it failed', () => {
    expect(suggestionsMessage({ ...view, games: [], failed: true })).toBe(SUGGESTIONS_FAILED_TEXT);
  });

  it('says it is loading', () => {
    expect(suggestionsMessage({ ...view, games: null })).toBe(SUGGESTIONS_LOADING_TEXT);
  });

  it('says nothing was found', () => {
    expect(suggestionsMessage({ ...view, games: [] })).toBe(SUGGESTIONS_NONE_TEXT);
  });

  it('has no message when there are games to show', () => {
    expect(suggestionsMessage(view)).toBe('');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --include src/app/ai/suggestions-helpers.spec.ts`
Expected: FAIL with `Cannot find module './suggestions-helpers'` and `'./suggestions.constants'`.

- [ ] **Step 3: Write the minimal implementation**

Create `src/app/ai/suggestions.constants.ts`:

```ts
export const SUGGESTION_COUNT = 6;

export const SUGGESTIONS_LOADING_TEXT = 'Finding games for you…';
export const SUGGESTIONS_EMPTY_VAULT_TEXT = 'Add a few games to your vault to get suggestions.';
export const SUGGESTIONS_FAILED_TEXT = 'Could not get suggestions. Try Refresh.';
export const SUGGESTIONS_NONE_TEXT = 'No suggestions found. Try Refresh.';

export const AI_PRIVACY_NOTE =
  'While on, your vault’s titles, genres, statuses and ratings are sent to Google Gemini. Notes are never sent.';
```

Create `src/app/ai/suggestions-helpers.ts`:

```ts
import { GameEntry, GameEntryWithId, NewGameEntry } from '../game-vault-interface';
import {
  SUGGESTIONS_EMPTY_VAULT_TEXT,
  SUGGESTIONS_FAILED_TEXT,
  SUGGESTIONS_LOADING_TEXT,
  SUGGESTIONS_NONE_TEXT,
  SUGGESTION_COUNT,
} from './suggestions.constants';

export type VaultState = 'loading' | 'empty' | 'ready';
export type VaultGame = Pick<GameEntry, 'title' | 'genres' | 'status' | 'rating'>;

export interface SuggestionsView {
  games: NewGameEntry[] | null;
  failed: boolean;
  vaultEmpty: boolean;
}

const CODE_FENCE = /^```(?:json)?\s*|\s*```$/g;

export const vaultStateOf = (games: GameEntryWithId[] | null): VaultState => {
  if (games === null) return 'loading';
  return games.length ? 'ready' : 'empty';
};

const describeGame = (game: VaultGame): string => {
  const details = [game.genres.join(', '), game.status, game.rating ? `${game.rating}/5` : ''];
  return `- ${game.title} (${details.filter(Boolean).join('; ')})`;
};

/** Sends only title, genres, status and rating. Notes are never included. */
export const buildSuggestionPrompt = (games: VaultGame[], count = SUGGESTION_COUNT): string =>
  [
    'Here are the video games in my collection:',
    ...games.map(describeGame),
    `Suggest ${count} other video games I would enjoy. Do not repeat any game listed above.`,
    'Reply with only a JSON array of game title strings, nothing else.',
  ].join('\n');

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text.trim().replace(CODE_FENCE, ''));
  } catch {
    return [];
  }
};

/** Reads the AI's reply into clean, unique titles. Anything unexpected gives `[]`. */
export const parseTitles = (text: string): string[] => {
  const parsed = parseJson(text);
  if (!Array.isArray(parsed)) return [];
  const titles = parsed.filter((item): item is string => typeof item === 'string');
  return [...new Set(titles.map((title) => title.trim()).filter(Boolean))];
};

export const compact = <T>(items: (T | undefined)[]): T[] =>
  items.filter((item): item is T => item !== undefined);

export const uniqueByRawgId = (entries: NewGameEntry[]): NewGameEntry[] =>
  entries.filter((entry, index) => entries.findIndex((other) => other.rawgId === entry.rawgId) === index);

export const excludeSaved = (entries: NewGameEntry[], savedRawgIds: ReadonlySet<number>): NewGameEntry[] =>
  entries.filter((entry) => !savedRawgIds.has(entry.rawgId));

/** The one line of status text to show instead of cards. `''` = there are cards to show. */
export const suggestionsMessage = (view: SuggestionsView): string => {
  if (view.vaultEmpty) return SUGGESTIONS_EMPTY_VAULT_TEXT;
  if (view.failed) return SUGGESTIONS_FAILED_TEXT;
  if (view.games === null) return SUGGESTIONS_LOADING_TEXT;
  if (view.games.length === 0) return SUGGESTIONS_NONE_TEXT;
  return '';
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx ng test --watch=false --include src/app/ai/suggestions-helpers.spec.ts`
Expected: PASS, all tests in the file green.

- [ ] **Step 5: Commit**

```bash
git add src/app/ai/suggestions.constants.ts src/app/ai/suggestions-helpers.ts src/app/ai/suggestions-helpers.spec.ts
git commit -m "feat: add suggestion prompt and parsing helpers"
```

---

### Task 2: RAWG single-title lookup

**Files:**
- Modify: `src/app/rawg-service.ts` (add one method after `getGame`, around line 43)
- Create: `src/app/rawg-service.spec.ts`

**Interfaces:**
- Consumes: `buildSearchUrl(term, pageSize)` and `toNewGameEntries` (already imported in `rawg-service.ts`), `RawgListResponse`.
- Produces: `RawgService.findByTitle(title: string): Promise<NewGameEntry | undefined>`. Resolves `undefined` for a blank title, no match, or any error. Never rejects.

- [ ] **Step 1: Write the failing test**

Create `src/app/rawg-service.spec.ts`:

```ts
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { RawgGame } from './rawg-interface';
import { RawgService } from './rawg-service';

const hades = {
  id: 7,
  name: 'Hades',
  background_image: 'cover.jpg',
  released: '2020-09-17',
  genres: [{ name: 'Action' }],
  platforms: [],
} as RawgGame;

describe('RawgService.findByTitle', () => {
  let service: RawgService;
  let http: HttpTestingController;
  const isSearchFor = (term: string) => (request: { url: string }) =>
    request.url.includes(`search=${term}`) && request.url.includes('page_size=1');

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(RawgService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('resolves with the first match, mapped to our model', async () => {
    const result = service.findByTitle('Hades');
    http.expectOne(isSearchFor('Hades')).flush({ count: 1, results: [hades] });
    await expect(result).resolves.toMatchObject({ rawgId: 7, title: 'Hades', coverUrl: 'cover.jpg' });
  });

  it('resolves undefined when nothing matches', async () => {
    const result = service.findByTitle('Hades');
    http.expectOne(isSearchFor('Hades')).flush({ count: 0, results: [] });
    await expect(result).resolves.toBeUndefined();
  });

  it('resolves undefined, and does not reject, when the request fails', async () => {
    const result = service.findByTitle('Hades');
    http.expectOne(isSearchFor('Hades')).flush('boom', { status: 500, statusText: 'Server Error' });
    await expect(result).resolves.toBeUndefined();
  });

  it('makes no request for a blank title', async () => {
    await expect(service.findByTitle('   ')).resolves.toBeUndefined();
    http.expectNone(() => true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --include src/app/rawg-service.spec.ts`
Expected: FAIL, `service.findByTitle is not a function` (or a TypeScript error that the property does not exist).

- [ ] **Step 3: Write the minimal implementation**

In `src/app/rawg-service.ts`, add this method directly after `getGame` (before the `searchRequest` comment):

```ts
  /** LOOKUP. Resolves with the best match for a title, or `undefined` for a blank title, no match or any error. */
  async findByTitle(title: string): Promise<NewGameEntry | undefined> {
    const trimmed = title.trim();
    if (!trimmed) return undefined;
    try {
      const response = await firstValueFrom(this.http.get<RawgListResponse>(buildSearchUrl(trimmed, 1)));
      return toNewGameEntries(response.results)[0];
    } catch {
      return undefined;
    }
  }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx ng test --watch=false --include src/app/rawg-service.spec.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/app/rawg-service.ts src/app/rawg-service.spec.ts
git commit -m "feat: add single-title RAWG lookup"
```

---

### Task 3: SuggestionsService

**Files:**
- Create: `src/app/ai/suggestions-service.ts`
- Test: `src/app/ai/suggestions-service.spec.ts`

**Interfaces:**
- Consumes: `GameVaultCrudService.games` (`Signal<GameEntryWithId[] | null>`), `AiService.generate(request: string): Promise<string>`, `RawgService.findByTitle(title): Promise<NewGameEntry | undefined>`, and the Task 1 helpers and `SUGGESTION_COUNT`.
- Produces (used by Task 4):
  - `SuggestionsService.enabled: Signal<boolean>`
  - `SuggestionsService.suggestions: Signal<NewGameEntry[] | null>` (`[]` when off, `null` while loading)
  - `SuggestionsService.failed: Signal<boolean>`
  - `SuggestionsService.vaultEmpty: Signal<boolean>`
  - `SuggestionsService.setEnabled(on: boolean): void`
  - `SuggestionsService.refresh(): void`

- [ ] **Step 1: Write the failing test**

Create `src/app/ai/suggestions-service.spec.ts`:

```ts
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { GameVaultCrudService } from '../game-vault-crud-service';
import { GameEntryWithId, NewGameEntry } from '../game-vault-interface';
import { RawgService } from '../rawg-service';
import { AiService } from './ai-service';
import { SuggestionsService } from './suggestions-service';

const entry = (rawgId: number, title = `Game ${rawgId}`): NewGameEntry => ({
  rawgId,
  title,
  coverUrl: '',
  platforms: [],
  genres: [],
  releaseDate: '',
  rating: null,
  status: 'wishlist',
  notes: '',
});

const saved = (rawgId: number, title: string): GameEntryWithId => ({
  ...entry(rawgId, title),
  id: `doc${rawgId}`,
  addedAt: 0,
});

describe('SuggestionsService', () => {
  const games = signal<GameEntryWithId[] | null>([]);
  const ai = { generate: vi.fn() };
  const rawg = { findByTitle: vi.fn() };
  let service: SuggestionsService;

  const flush = () => TestBed.tick();
  const titles = () => service.suggestions()?.map((game) => game.title);
  const settled = () =>
    vi.waitFor(() => {
      flush();
      expect(service.suggestions()).not.toBeNull();
    });
  const turnOn = async () => {
    service.setEnabled(true);
    await settled();
  };

  beforeEach(() => {
    games.set([saved(1, 'Hollow Knight')]);
    ai.generate.mockReset().mockResolvedValue('["Hades","Celeste"]');
    rawg.findByTitle
      .mockReset()
      .mockImplementation((title: string) => Promise.resolve(title === 'Hades' ? entry(2, 'Hades') : entry(3, 'Celeste')));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: GameVaultCrudService, useValue: { games } },
        { provide: AiService, useValue: ai },
        { provide: RawgService, useValue: rawg },
      ],
    });
    service = TestBed.inject(SuggestionsService);
  });

  it('is off, empty, and makes no AI call by default', async () => {
    flush();
    expect(service.enabled()).toBe(false);
    expect(service.suggestions()).toEqual([]);
    expect(ai.generate).not.toHaveBeenCalled();
  });

  it('is loading, with no AI call, while the vault is still loading', () => {
    games.set(null);
    service.setEnabled(true);
    flush();
    expect(service.suggestions()).toBeNull();
    expect(ai.generate).not.toHaveBeenCalled();
  });

  it('makes no AI call for an empty vault and says the vault is empty', () => {
    games.set([]);
    service.setEnabled(true);
    flush();
    expect(service.suggestions()).toEqual([]);
    expect(service.vaultEmpty()).toBe(true);
    expect(ai.generate).not.toHaveBeenCalled();
  });

  it('asks the AI once, with the vault in the prompt, and resolves the titles through RAWG', async () => {
    await turnOn();
    expect(titles()).toEqual(['Hades', 'Celeste']);
    expect(ai.generate).toHaveBeenCalledOnce();
    expect(ai.generate.mock.calls[0][0]).toContain('Hollow Knight');
  });

  it('is loading while the AI is working', async () => {
    let reply: (text: string) => void = () => undefined;
    ai.generate.mockReturnValue(new Promise<string>((resolve) => (reply = resolve)));
    service.setEnabled(true);
    flush();
    expect(service.suggestions()).toBeNull();
    reply('["Hades"]');
    await settled();
    expect(titles()).toEqual(['Hades']);
  });

  it('does not ask the AI again when a game is added to the vault', async () => {
    await turnOn();
    games.update((current) => [...(current ?? []), saved(9, 'Another')]);
    flush();
    await Promise.resolve();
    expect(ai.generate).toHaveBeenCalledOnce();
    expect(titles()).toEqual(['Hades', 'Celeste']);
  });

  it('asks the AI again on refresh', async () => {
    await turnOn();
    service.refresh();
    await vi.waitFor(() => {
      flush();
      expect(ai.generate).toHaveBeenCalledTimes(2);
    });
  });

  it('asks the AI once when the vault goes from empty to having a game', async () => {
    games.set([]);
    service.setEnabled(true);
    flush();
    games.set([saved(1, 'Hollow Knight')]);
    await vi.waitFor(() => {
      flush();
      expect(ai.generate).toHaveBeenCalledOnce();
    });
  });

  it('clears the suggestions when the vault empties', async () => {
    await turnOn();
    games.set([]);
    flush();
    expect(service.suggestions()).toEqual([]);
    expect(service.vaultEmpty()).toBe(true);
  });

  it('clears the suggestions when switched off', async () => {
    await turnOn();
    service.setEnabled(false);
    expect(service.suggestions()).toEqual([]);
  });

  it('sets failed, logs the error, and does not throw when the AI call fails', async () => {
    ai.generate.mockRejectedValue(new Error('AI Logic not enabled'));
    service.setEnabled(true);
    await vi.waitFor(() => {
      flush();
      expect(service.failed()).toBe(true);
    });
    expect(service.suggestions()).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it('shows nothing, and is not failed, when the AI reply is not JSON', async () => {
    ai.generate.mockResolvedValue('Sorry, I cannot help with that.');
    await turnOn();
    expect(service.suggestions()).toEqual([]);
    expect(service.failed()).toBe(false);
  });

  it('drops titles that RAWG cannot find', async () => {
    rawg.findByTitle.mockImplementation((title: string) =>
      Promise.resolve(title === 'Hades' ? entry(2, 'Hades') : undefined),
    );
    await turnOn();
    expect(titles()).toEqual(['Hades']);
  });

  it('never suggests a game already in the vault', async () => {
    rawg.findByTitle.mockImplementation((title: string) =>
      Promise.resolve(title === 'Hades' ? entry(1, 'Hollow Knight') : entry(3, 'Celeste')),
    );
    await turnOn();
    expect(titles()).toEqual(['Celeste']);
  });

  it('shows a game once when two titles resolve to the same RAWG game', async () => {
    rawg.findByTitle.mockResolvedValue(entry(2, 'Hades'));
    await turnOn();
    expect(titles()).toEqual(['Hades']);
  });

  it('looks up at most six titles', async () => {
    ai.generate.mockResolvedValue(JSON.stringify(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']));
    rawg.findByTitle.mockImplementation((title: string) => Promise.resolve(entry(title.charCodeAt(0), title)));
    await turnOn();
    expect(rawg.findByTitle).toHaveBeenCalledTimes(6);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --include src/app/ai/suggestions-service.spec.ts`
Expected: FAIL with `Cannot find module './suggestions-service'`.

- [ ] **Step 3: Write the minimal implementation**

Create `src/app/ai/suggestions-service.ts`:

```ts
import { Service, Signal, computed, inject, resource, signal, untracked } from '@angular/core';

import { GameVaultCrudService } from '../game-vault-crud-service';
import { GameEntryWithId, NewGameEntry } from '../game-vault-interface';
import { RawgService } from '../rawg-service';
import { AiService } from './ai-service';
import {
  buildSuggestionPrompt,
  compact,
  excludeSaved,
  parseTitles,
  uniqueByRawgId,
  vaultStateOf,
} from './suggestions-helpers';
import { SUGGESTION_COUNT } from './suggestions.constants';

/**
 * Suggests games from the vault. Reads the vault from the CRUD service, not the facade
 * (the facade points to this service, so injecting it here would be circular).
 */
@Service()
export class SuggestionsService {
  private readonly crud = inject(GameVaultCrudService);
  private readonly ai = inject(AiService);
  private readonly rawg = inject(RawgService);
  private readonly isOn = signal(false);
  private readonly refreshCount = signal(0);
  private readonly vaultState = computed(() => vaultStateOf(this.crud.games()));

  // The vault is read untracked: adding a game must not ask the AI again.
  // Only the switch, the vault going empty / non-empty, or a refresh does.
  private readonly request = computed(() => {
    if (!this.isOn() || this.vaultState() !== 'ready') return undefined;
    return { refresh: this.refreshCount(), games: untracked(this.crud.games) ?? [] };
  });

  private readonly resolved = resource({
    params: () => this.request(),
    loader: ({ params }) => this.load(params.games),
  });

  readonly enabled = this.isOn.asReadonly();

  /** Suggested games. `null` = loading, `[]` = nothing to show (off, empty vault, failed or none found). */
  readonly suggestions: Signal<NewGameEntry[] | null> = computed(() => {
    if (!this.isOn()) return [];
    if (this.vaultState() === 'loading' || this.resolved.isLoading()) return null;
    if (this.resolved.error()) return [];
    return this.resolved.value() ?? [];
  });

  /** `true` when the last AI request failed. */
  readonly failed = computed(() => this.isOn() && !!this.resolved.error());

  /** `true` when the vault has no games, so there is nothing to base suggestions on. */
  readonly vaultEmpty = computed(() => this.vaultState() === 'empty');

  setEnabled(on: boolean): void {
    this.isOn.set(on);
  }

  refresh(): void {
    this.refreshCount.update((count) => count + 1);
  }

  private async load(games: GameEntryWithId[]): Promise<NewGameEntry[]> {
    try {
      const reply = await this.ai.generate(buildSuggestionPrompt(games));
      return await this.resolveTitles(parseTitles(reply).slice(0, SUGGESTION_COUNT), games);
    } catch (error) {
      console.error('[SuggestionsService]', error);
      throw error;
    }
  }

  private async resolveTitles(titles: string[], games: GameEntryWithId[]): Promise<NewGameEntry[]> {
    const found = await Promise.all(titles.map((title) => this.rawg.findByTitle(title)));
    return excludeSaved(uniqueByRawgId(compact(found)), new Set(games.map((game) => game.rawgId)));
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx ng test --watch=false --include src/app/ai/suggestions-service.spec.ts`
Expected: PASS, 16 tests.

If a "loading" test fails because the resource has not yet reported `loading`, keep the `computed` logic and check that `TestBed.tick()` is being called before the assertion; do not add an `effect`. If `resource` reports `error()` but `value()` throws in some state, the `error()` guard above must stay before `value()`.

- [ ] **Step 5: Commit**

```bash
git add src/app/ai/suggestions-service.ts src/app/ai/suggestions-service.spec.ts
git commit -m "feat: add SuggestionsService"
```

---

### Task 4: Facade pointers and cleanup of the first AI step

**Files:**
- Modify: `src/app/game-vault-service.ts`
- Modify: `src/app/game-vault-service.spec.ts`
- Modify: `src/app/ai/ai.constants.ts` (remove `AI_ERROR_MESSAGE`)

**Interfaces:**
- Consumes: `SuggestionsService` from Task 3.
- Produces (used by Task 7) on `GameVaultService`:
  - `aiEnabled: Signal<boolean>`
  - `suggestions: Signal<NewGameEntry[] | null>`
  - `suggestionsFailed: Signal<boolean>`
  - `suggestionsVaultEmpty: Signal<boolean>`
  - `setAiEnabled(on: boolean): void`
  - `refreshSuggestions(): void`
- Removes: `askAi`, the `AiService` injection in the facade, and `AI_ERROR_MESSAGE`.

- [ ] **Step 1: Write the failing test**

In `src/app/game-vault-service.spec.ts`:

a. Replace the two AI imports

```ts
import { AiService } from './ai/ai-service';
import { AI_ERROR_MESSAGE } from './ai/ai.constants';
```

with

```ts
import { SuggestionsService } from './ai/suggestions-service';
```

b. Change the interface import to include `NewGameEntry`:

```ts
import { GameEntryWithId, NewGameEntry } from './game-vault-interface';
```

c. Replace `const ai = { generate: vi.fn() };` with

```ts
  const suggestions = {
    enabled: signal(false),
    suggestions: signal<NewGameEntry[] | null>([]),
    failed: signal(false),
    vaultEmpty: signal(false),
    setEnabled: vi.fn(),
    refresh: vi.fn(),
  };
```

d. Replace `ai.generate.mockReset();` (first line of `beforeEach`) with

```ts
    suggestions.setEnabled.mockReset();
    suggestions.refresh.mockReset();
```

e. Replace `{ provide: AiService, useValue: ai },` with

```ts
        { provide: SuggestionsService, useValue: suggestions },
```

f. Replace the whole `describe('askAi', ...)` block with

```ts
  describe('AI suggestions', () => {
    it('exposes the suggestions state from the suggestions service', () => {
      expect(service.aiEnabled).toBe(suggestions.enabled);
      expect(service.suggestions).toBe(suggestions.suggestions);
      expect(service.suggestionsFailed).toBe(suggestions.failed);
      expect(service.suggestionsVaultEmpty).toBe(suggestions.vaultEmpty);
    });

    it('turns the AI on and off through the suggestions service', () => {
      service.setAiEnabled(true);
      expect(suggestions.setEnabled).toHaveBeenCalledExactlyOnceWith(true);
    });

    it('refreshes through the suggestions service', () => {
      service.refreshSuggestions();
      expect(suggestions.refresh).toHaveBeenCalledOnce();
    });
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --include src/app/game-vault-service.spec.ts`
Expected: FAIL. TypeScript errors that `aiEnabled`, `suggestions`, `suggestionsFailed`, `suggestionsVaultEmpty`, `setAiEnabled` and `refreshSuggestions` do not exist on `GameVaultService`.

- [ ] **Step 3: Write the minimal implementation**

In `src/app/game-vault-service.ts`:

a. Replace the two AI imports

```ts
import { AiService } from './ai/ai-service';
import { AI_ERROR_MESSAGE } from './ai/ai.constants';
```

with

```ts
import { SuggestionsService } from './ai/suggestions-service';
```

b. Replace `private readonly ai = inject(AiService);` with

```ts
  private readonly suggestionsService = inject(SuggestionsService);
```

c. Directly after the `signupPending` field (`readonly signupPending = this.signupFlow.pending;`) add:

```ts

  /** Whether AI suggestions are switched on. */
  readonly aiEnabled = this.suggestionsService.enabled;

  /** Suggested games. `null` = loading, `[]` = nothing to show. */
  readonly suggestions = this.suggestionsService.suggestions;

  /** `true` when the last AI request failed. */
  readonly suggestionsFailed = this.suggestionsService.failed;

  /** `true` when the vault has no games to base suggestions on. */
  readonly suggestionsVaultEmpty = this.suggestionsService.vaultEmpty;
```

d. Replace the whole `askAi` method (its doc comment and body) with

```ts
  setAiEnabled(on: boolean): void {
    this.suggestionsService.setEnabled(on);
  }

  refreshSuggestions(): void {
    this.suggestionsService.refresh();
  }
```

In `src/app/ai/ai.constants.ts`, delete the line

```ts
export const AI_ERROR_MESSAGE = 'Could not get a reply from the AI. Please try again.';
```

(and the blank line before it, so the file ends after `AI_SYSTEM_INSTRUCTIONS`).

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx ng test --watch=false`
Expected: PASS for the whole suite. Also confirm nothing else referenced `askAi` or `AI_ERROR_MESSAGE`: run `npx ng build` and expect exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/app/game-vault-service.ts src/app/game-vault-service.spec.ts src/app/ai/ai.constants.ts
git commit -m "feat: point the facade at SuggestionsService and drop askAi"
```

---

### Task 5: AiToggle component

**Files:**
- Create: `src/app/ai/ai-toggle/ai-toggle.ts`
- Create: `src/app/ai/ai-toggle/ai-toggle.html`
- Create: `src/app/ai/ai-toggle/ai-toggle.css` (empty file, like the other components)
- Test: `src/app/ai/ai-toggle/ai-toggle.spec.ts`

**Interfaces:**
- Consumes: `AI_PRIVACY_NOTE` from Task 1.
- Produces: `AiToggle` component, selector `app-ai-toggle`. Input `enabled: boolean` (required). Output `toggle: boolean` (the new value the user asked for).

- [ ] **Step 1: Write the failing test**

Create `src/app/ai/ai-toggle/ai-toggle.spec.ts`:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AI_PRIVACY_NOTE } from '../suggestions.constants';
import { AiToggle } from './ai-toggle';

describe('AiToggle', () => {
  let fixture: ComponentFixture<AiToggle>;
  const html = () => fixture.nativeElement as HTMLElement;
  const switchButton = () => html().querySelector<HTMLButtonElement>('[role="switch"]')!;

  const render = async (enabled: boolean) => {
    fixture.componentRef.setInput('enabled', enabled);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AiToggle] }).compileComponents();
    fixture = TestBed.createComponent(AiToggle);
  });

  it('shows an off switch', async () => {
    await render(false);
    expect(switchButton().getAttribute('aria-checked')).toBe('false');
  });

  it('shows an on switch', async () => {
    await render(true);
    expect(switchButton().getAttribute('aria-checked')).toBe('true');
  });

  it('asks to turn on when clicked while off', async () => {
    await render(false);
    const toggled: boolean[] = [];
    fixture.componentInstance.toggle.subscribe((value) => toggled.push(value));
    switchButton().click();
    expect(toggled).toEqual([true]);
  });

  it('asks to turn off when clicked while on', async () => {
    await render(true);
    const toggled: boolean[] = [];
    fixture.componentInstance.toggle.subscribe((value) => toggled.push(value));
    switchButton().click();
    expect(toggled).toEqual([false]);
  });

  it('is labelled', async () => {
    await render(false);
    expect(html().textContent).toContain('AI suggestions');
  });

  it('tells the user what is sent to Gemini', async () => {
    await render(false);
    expect(html().textContent).toContain(AI_PRIVACY_NOTE);
  });
});
```

(`.subscribe` on an `OutputRef` in a spec is fine; the no-`.subscribe` rule covers app code.)

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --include src/app/ai/ai-toggle/ai-toggle.spec.ts`
Expected: FAIL with `Cannot find module './ai-toggle'`.

- [ ] **Step 3: Write the minimal implementation**

Create the empty stylesheet:

```bash
: > src/app/ai/ai-toggle/ai-toggle.css
```

Create `src/app/ai/ai-toggle/ai-toggle.ts`:

```ts
import { Component, input, output } from '@angular/core';

import { AI_PRIVACY_NOTE } from '../suggestions.constants';

/** UI only. An on/off switch for AI suggestions; the parent decides what toggling does. */
@Component({
  imports: [],
  selector: 'app-ai-toggle',
  styleUrl: './ai-toggle.css',
  templateUrl: './ai-toggle.html',
})
export class AiToggle {
  readonly enabled = input.required<boolean>();
  /** The value the user asked for: `true` to turn AI on, `false` to turn it off. */
  readonly toggle = output<boolean>();

  protected readonly privacyNote = AI_PRIVACY_NOTE;

  protected onToggle(): void {
    this.toggle.emit(!this.enabled());
  }
}
```

Create `src/app/ai/ai-toggle/ai-toggle.html`:

```html
<div class="flex flex-col gap-1">
  <div class="flex items-center gap-3">
    <button
      class="relative h-6 w-11 cursor-pointer rounded-full border border-slate-600 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400"
      [class.bg-lime-400]="enabled()"
      [class.bg-slate-700]="!enabled()"
      type="button"
      role="switch"
      aria-labelledby="ai-toggle-label"
      [attr.aria-checked]="enabled()"
      (click)="onToggle()"
    >
      <span
        class="absolute top-0.5 left-0.5 size-4.5 rounded-full bg-slate-100 transition-transform"
        [class.translate-x-5]="enabled()"
      ></span>
    </button>
    <span id="ai-toggle-label" class="text-slate-200">AI suggestions</span>
  </div>
  <p class="text-xs text-slate-500">{{ privacyNote }}</p>
</div>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx ng test --watch=false --include src/app/ai/ai-toggle/ai-toggle.spec.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/app/ai/ai-toggle
git commit -m "feat: add AiToggle switch component"
```

---

### Task 6: Suggestions component

**Files:**
- Create: `src/app/ai/suggestions/suggestions.ts`
- Create: `src/app/ai/suggestions/suggestions.html`
- Create: `src/app/ai/suggestions/suggestions.css` (empty file)
- Test: `src/app/ai/suggestions/suggestions.spec.ts`

**Interfaces:**
- Consumes: `suggestionsMessage` and the constants from Task 1; existing `GameCard` (`[game]`, `[savedId]`, `(add)`, `(remove)`) and `StateMessage` (`[text]`).
- Produces: `Suggestions` component, selector `app-suggestions`. Inputs (all required): `games: NewGameEntry[] | null`, `failed: boolean`, `vaultEmpty: boolean`, `savedIds: Map<number, string>`. Outputs: `add: number` (RAWG id), `remove: string` (document id), `refresh: void`.

- [ ] **Step 1: Write the failing test**

Create `src/app/ai/suggestions/suggestions.spec.ts`:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NewGameEntry } from '../../game-vault-interface';
import {
  SUGGESTIONS_EMPTY_VAULT_TEXT,
  SUGGESTIONS_FAILED_TEXT,
  SUGGESTIONS_LOADING_TEXT,
  SUGGESTIONS_NONE_TEXT,
} from '../suggestions.constants';
import { Suggestions } from './suggestions';

const entry = (rawgId: number): NewGameEntry => ({
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

describe('Suggestions', () => {
  let fixture: ComponentFixture<Suggestions>;
  const html = () => fixture.nativeElement as HTMLElement;
  const refreshButton = () =>
    [...html().querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent?.includes('Refresh'))!;

  const render = async (inputs: Partial<{ games: NewGameEntry[] | null; failed: boolean; vaultEmpty: boolean }> = {}) => {
    const values = { games: [entry(1)], failed: false, vaultEmpty: false, ...inputs };
    fixture.componentRef.setInput('games', values.games);
    fixture.componentRef.setInput('failed', values.failed);
    fixture.componentRef.setInput('vaultEmpty', values.vaultEmpty);
    fixture.componentRef.setInput('savedIds', new Map<number, string>());
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Suggestions],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(Suggestions);
  });

  it('has a heading', async () => {
    await render();
    expect(html().textContent).toContain('Suggested for you');
  });

  it('shows a card per suggestion', async () => {
    await render({ games: [entry(1), entry(2)] });
    expect(html().querySelectorAll('app-game-card').length).toBe(2);
  });

  it('shows the loading message while suggestions load', async () => {
    await render({ games: null });
    expect(html().textContent).toContain(SUGGESTIONS_LOADING_TEXT);
    expect(html().querySelector('app-game-card')).toBeNull();
  });

  it('asks the user to add games when the vault is empty', async () => {
    await render({ games: [], vaultEmpty: true });
    expect(html().textContent).toContain(SUGGESTIONS_EMPTY_VAULT_TEXT);
  });

  it('shows the failure message', async () => {
    await render({ games: [], failed: true });
    expect(html().textContent).toContain(SUGGESTIONS_FAILED_TEXT);
  });

  it('says when nothing was found', async () => {
    await render({ games: [] });
    expect(html().textContent).toContain(SUGGESTIONS_NONE_TEXT);
  });

  it('emits the RAWG id when a card is added', async () => {
    await render({ games: [entry(7)] });
    const added: number[] = [];
    fixture.componentInstance.add.subscribe((id) => added.push(id));
    html().querySelector<HTMLButtonElement>('app-game-card button')?.click();
    expect(added).toEqual([7]);
  });

  it('emits refresh when Refresh is clicked', async () => {
    await render();
    let refreshed = 0;
    fixture.componentInstance.refresh.subscribe(() => refreshed++);
    refreshButton().click();
    expect(refreshed).toBe(1);
  });

  it('disables Refresh while loading', async () => {
    await render({ games: null });
    expect(refreshButton().disabled).toBe(true);
  });

  it('disables Refresh when the vault is empty', async () => {
    await render({ games: [], vaultEmpty: true });
    expect(refreshButton().disabled).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --include src/app/ai/suggestions/suggestions.spec.ts`
Expected: FAIL with `Cannot find module './suggestions'`.

- [ ] **Step 3: Write the minimal implementation**

Create the empty stylesheet:

```bash
: > src/app/ai/suggestions/suggestions.css
```

Create `src/app/ai/suggestions/suggestions.ts`:

```ts
import { Component, computed, input, output } from '@angular/core';

import { GameCard } from '../../game-card/game-card';
import { NewGameEntry } from '../../game-vault-interface';
import { StateMessage } from '../../state-message/state-message';
import { suggestionsMessage } from '../suggestions-helpers';

/** UI only. Shows suggested games, or a status message; the parent decides what Add, Remove and Refresh do. */
@Component({
  imports: [GameCard, StateMessage],
  selector: 'app-suggestions',
  styleUrl: './suggestions.css',
  templateUrl: './suggestions.html',
})
export class Suggestions {
  /** `null` = loading, `[]` = nothing to show. */
  readonly games = input.required<NewGameEntry[] | null>();
  readonly failed = input.required<boolean>();
  readonly vaultEmpty = input.required<boolean>();
  /** RAWG id to Firestore document id, for games already in the vault. */
  readonly savedIds = input.required<Map<number, string>>();

  readonly add = output<number>();
  readonly remove = output<string>();
  readonly refresh = output<void>();

  protected readonly message = computed(() =>
    suggestionsMessage({ games: this.games(), failed: this.failed(), vaultEmpty: this.vaultEmpty() }),
  );
  protected readonly canRefresh = computed(() => this.games() !== null && !this.vaultEmpty());
}
```

Create `src/app/ai/suggestions/suggestions.html`:

```html
<section class="flex flex-col gap-4" aria-labelledby="suggestions-heading">
  <div class="flex items-center justify-between gap-3">
    <h2 id="suggestions-heading" class="text-lg font-bold text-slate-100">Suggested for you</h2>
    <button class="vault-btn" type="button" [disabled]="!canRefresh()" (click)="refresh.emit()">Refresh</button>
  </div>

  @if (message()) {
    <app-state-message [text]="message()" />
  } @else {
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      @for (entry of games() ?? []; track entry.rawgId) {
        <app-game-card
          [game]="entry"
          [savedId]="savedIds().get(entry.rawgId) ?? null"
          (add)="add.emit($event)"
          (remove)="remove.emit($event)"
        />
      }
    </div>
  }
</section>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx ng test --watch=false --include src/app/ai/suggestions/suggestions.spec.ts`
Expected: PASS, 10 tests.

- [ ] **Step 5: Commit**

```bash
git add src/app/ai/suggestions
git commit -m "feat: add Suggestions component"
```

---

### Task 7: Wire into the game list page, update docs, verify

**Files:**
- Modify: `src/app/game-list/game-list.ts`
- Modify: `src/app/game-list/game-list.html`
- Modify: `src/app/game-list/game-list.spec.ts`
- Modify: `PRODUCT.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: `GameVaultService` pointers from Task 4 (`aiEnabled`, `suggestions`, `suggestionsFailed`, `suggestionsVaultEmpty`, `setAiEnabled`, `refreshSuggestions`) plus the existing `addToVault(rawgId)`, `removeGame(id)` and `games`; `AiToggle` (Task 5); `Suggestions` (Task 6); and the existing `savedIdByRawgId` from `src/app/home/home-helpers.ts`.
- Produces: the finished feature on `/game-list`.

- [ ] **Step 1: Write the failing test**

In `src/app/game-list/game-list.spec.ts`:

a. Change the interface import to include `NewGameEntry`:

```ts
import { GameEntryWithId, NewGameEntry } from '../game-vault-interface';
```

b. After the `saved` constant add a factory for suggestions:

```ts
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
```

c. Add to the `vault` fake, after `removeGame: ...,`:

```ts
    addToVault: vi.fn(() => Promise.resolve('doc2')),
    aiEnabled: signal(false),
    suggestions: signal<NewGameEntry[] | null>([]),
    suggestionsFailed: signal(false),
    suggestionsVaultEmpty: signal(false),
    setAiEnabled: vi.fn(),
    refreshSuggestions: vi.fn(),
```

d. In `beforeEach`, after `vault.removeGame.mockClear();` add:

```ts
    vault.addToVault.mockClear();
    vault.aiEnabled.set(false);
    vault.suggestions.set([]);
    vault.suggestionsFailed.set(false);
    vault.suggestionsVaultEmpty.set(false);
    vault.setAiEnabled.mockClear();
    vault.refreshSuggestions.mockClear();
```

e. Add these tests before the final `clears the action error when the page is left` test:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false --include src/app/game-list/game-list.spec.ts`
Expected: FAIL on the six new tests (no `[role="switch"]` on the page yet).

- [ ] **Step 3: Write the minimal implementation**

In `src/app/game-list/game-list.ts`:

a. Change the first import to `import { Component, DestroyRef, computed, inject } from '@angular/core';` and add, in path order with the others:

```ts
import { AiToggle } from '../ai/ai-toggle/ai-toggle';
import { Suggestions } from '../ai/suggestions/suggestions';
```

and, after the `StateMessage` import:

```ts
import { savedIdByRawgId } from '../home/home-helpers';
```

b. Change the component `imports` to `[AiToggle, ErrorBanner, GameCard, StateMessage, Suggestions]`.

c. After the `actionError` field add:

```ts
  protected readonly savedIds = computed(() => savedIdByRawgId(this.games()));
  protected readonly aiEnabled = this.vault.aiEnabled;
  protected readonly suggestions = this.vault.suggestions;
  protected readonly suggestionsFailed = this.vault.suggestionsFailed;
  protected readonly suggestionsVaultEmpty = this.vault.suggestionsVaultEmpty;
```

d. After `onRemove` add:

```ts

  protected onAdd(rawgId: number): void {
    void this.vault.addToVault(rawgId);
  }

  protected onToggleAi(on: boolean): void {
    this.vault.setAiEnabled(on);
  }

  protected onRefreshSuggestions(): void {
    this.vault.refreshSuggestions();
  }
```

In `src/app/game-list/game-list.html`, directly before the closing `</section>`, after the saved-games `@if ... }` block, add:

```html

  <app-ai-toggle [enabled]="aiEnabled()" (toggle)="onToggleAi($event)" />

  @if (aiEnabled()) {
    <app-suggestions
      [games]="suggestions()"
      [failed]="suggestionsFailed()"
      [vaultEmpty]="suggestionsVaultEmpty()"
      [savedIds]="savedIds()"
      (add)="onAdd($event)"
      (remove)="onRemove($event)"
      (refresh)="onRefreshSuggestions()"
    />
  }
```

In `PRODUCT.md`, add this row to the "Current features (built)" table, after the "Error feedback" row:

```md
| AI suggestions  | An optional switch on the game list page. When on, Gemini suggests games based on your vault, and each can be added in one click |
```

In `README.md`:

a. In "Features", after the "Live updates" bullet add:

```md
- Optional AI suggestions: switch them on from the game list page to get games picked from your vault (Gemini through Firebase AI Logic)
```

b. In the tech stack table, add a row:

```md
| AI        | Gemini through Firebase AI Logic (`@angular/fire/ai`)      |
```

c. In "Getting started", after the Prerequisites list, add the bullet:

```md
- For AI suggestions: enable **Firebase AI Logic** (Gemini Developer API) for your project in the Firebase console
```

d. In the project structure block, add above the `game-vault-service.ts` line:

```text
  ai/                   AI suggestions: service, helpers, switch and suggestions components
```

- [ ] **Step 4: Run the full suite, build and rule checks**

Run: `npx ng test --watch=false`
Expected: all test files pass (0 failures).

Run: `npx ng build`
Expected: exit 0.

Run the rule checks:

```bash
find src -name "*.ts" -o -name "*.html" | xargs wc -l | awk '$1>300 && $2!="total"'
grep -rnE "\.subscribe\(|\beffect\(" src --include=*.ts --exclude=*.spec.ts
grep -rn "template:" src --include=*.ts --exclude=*.spec.ts
```

Expected: all three print nothing.

- [ ] **Step 5: Check it in the real app**

Before this works live, **Firebase AI Logic must be enabled** in the Firebase console (Build, AI Logic, Gemini Developer API). Then:

Run: `npm start`, open `http://localhost:4200/game-list`, sign in, and make sure the vault has a few games.

Check by hand:
1. The switch is off and no suggestions section shows.
2. Turn it on: "Finding games for you…", then up to 6 cards.
3. Add one: it flips to Edit / Remove, it appears in "Your vault" above, and the suggestions do not reload.
4. Press Refresh: the list reloads.
5. Turn it off: the section disappears.
6. If it says "Could not get suggestions", open the browser console. The `[SuggestionsService]` error says why (usually AI Logic not enabled, or a quota or App Check problem).

- [ ] **Step 6: Commit**

```bash
git add src/app/game-list PRODUCT.md README.md
git commit -m "feat: show AI suggestions on the game list page"
```
