# AI game suggestions on the game list page

## Goal

The game list page (`/game-list`, your vault) has an AI on/off switch below the saved games. With it on, a "Suggested for you" section shows games chosen
by Gemini (through Firebase AI Logic) from what is already in the user's vault. Each suggestion is
a normal game card, so it can be added with one click. With the switch off, nothing changes and no
AI call is made.

## Behaviour

| State | Result |
| --- | --- |
| Switch off (default, every page load) | No suggestions section, no AI call |
| Switch on, vault still loading | "Finding games for you…" |
| Switch on, vault empty (or signed out) | "Add a few games to your vault to get suggestions." No AI call |
| Switch on, vault has games | AI is asked once; up to 6 suggestion cards appear |
| Suggestions loaded, user clicks **Add to vault** | Normal add. The card turns into Edit / Remove. The AI is **not** asked again |
| Suggestions loaded, user clicks **Refresh** | AI is asked again with the current vault |
| Vault goes from empty to having a game while the switch is on | AI is asked once |
| Vault goes to empty (signed out) while the switch is on | Suggestions clear, hint shows |
| AI call fails | "Could not get suggestions. Try Refresh." |
| AI replies but no title matches RAWG | "No suggestions found. Try Refresh." |
| Switch turned off | Section disappears |

A note under the switch says the vault's titles, genres, statuses and ratings are sent to Google
Gemini while the switch is on. Notes are never sent.

## Design

Approach: the AI folder owns all the logic. `GameVaultService` stays a facade made only of
one-line pointers. Components talk only to the facade.

1. **`SuggestionsService`** (`ai/suggestions-service.ts`). Injects `GameVaultCrudService` (for
   `games`), `AiService`, and `RawgService`. It must **not** inject `GameVaultService`, because the
   facade points to it and that would be a circular dependency.
   - `enabled`: a `signal(false)`. `refreshCount`: a `signal(0)`.
   - `vaultState`: a `computed` of `'loading' | 'empty' | 'ready'` from `games()`.
   - `request`: a `computed` that is `undefined` unless `enabled()` and the state is `'ready'`;
     otherwise `{ refresh: refreshCount(), games: untracked(games) }`. Reading `games` untracked is
     what stops an Add from re-asking the AI. Only the switch, `vaultState` changing, or Refresh does.
   - A `resource({ params: request, loader })`. The loader builds the prompt, calls
     `AiService.generate`, parses titles, looks each up in RAWG, drops misses, duplicates and games
     already saved, and resolves with up to 6 `NewGameEntry`.
   - `suggestions`: a `computed`. `[]` when off, `null` while the vault or the resource is loading,
     otherwise the resource value. `failed`: a `computed` from the resource error.
     `vaultEmpty`: a `computed` from `vaultState`.
   - No `effect`, no `.subscribe`. `setEnabled(on)` and `refresh()` are the only writers.
2. **Pure helpers** (`ai/suggestions-helpers.ts`).
   - `buildSuggestionPrompt(games, count)`: one line per game (title, genres, status, rating), a
     request for `count` new titles, "do not repeat any listed game", and "reply with only a JSON
     array of title strings".
   - `parseTitles(text)`: strips code fences, parses JSON, keeps non-empty strings, trims, removes
     duplicates, returns `[]` on any bad input.
   - `excludeSaved(entries, savedRawgIds)` and `uniqueByRawgId(entries)`.
3. **`RawgService.findByTitle(title)`**. Searches with page size 1, resolves with the mapped first
   result, or `undefined` for no match or any error (so one bad title never fails the batch).
4. **Facade pointers.** `GameVaultService` gets `aiEnabled`, `suggestions`, `suggestionsFailed`,
   `suggestionsVaultEmpty`, `setAiEnabled(on)` and `refreshSuggestions()`, each a single line.
5. **Components** (UI only, templates in `.html` files, in the AI folder).
   - `AiToggle`: a labelled switch plus the privacy note. Input `enabled`, output `toggle`.
   - `Suggestions`: input `games` (`NewGameEntry[] | null`), `failed`, `vaultEmpty`, `savedIds`;
     outputs `add`, `remove`, `refresh`. It renders the state messages and a grid of `GameCard`s.
     `GameCard` is already the loop body, so no new loop component is needed.
   - `GameList` adds both below the saved games and forwards their events to the facade. It gains
     an `onAdd` handler and reuses `savedIdByRawgId` from `home/home-helpers.ts`, so a suggestion
     that is already saved shows Edit / Remove instead of Add. An added suggestion also appears in
     the saved games above it straight away (live sync).
6. **Cleanup.** Remove `askAi` and `AI_ERROR_MESSAGE` from the first AI step: nothing uses them
   once suggestions exist. `AiService`, its token, and its tests stay.
7. **Constants** (`ai/suggestions.constants.ts`): `SUGGESTION_COUNT = 6`, the loading, empty-vault,
   failed and no-match messages, and the privacy note.
8. **Docs.** `PRODUCT.md` and `README.md` get a short entry for the feature and the AI folder.

## Testing

Tests are written first and watched failing.

- Helpers: prompt contents, fenced and malformed JSON, duplicates, saved-game exclusion.
- `SuggestionsService` with fake `GameVaultCrudService`, `AiService` and `RawgService`: off means no
  AI call; empty vault means no AI call; on with games calls the AI once; adding a game does not
  call it again; Refresh does; empty to non-empty triggers one call; AI failure sets `failed`;
  titles RAWG cannot find are dropped; saved games are not suggested.
- `RawgService.findByTitle`: match, no match, HTTP error.
- Facade pointers delegate to the service.
- `AiToggle` and `Suggestions`: each state renders, and events fire.

## Out of scope

Remembering the switch between visits, explaining why a game was suggested, suggestions on other
pages, and any change to Firestore data or security rules.
