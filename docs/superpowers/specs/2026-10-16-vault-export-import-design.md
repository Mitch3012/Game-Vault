# Export and import a vault

## Goal

A signed-in user can export their vault to a small file, send it to a friend (Discord, email, any
way), and the friend can import it into their own vault. No server is involved: the file is
created and read in the browser.

## Decisions (from the user)

- Imported games arrive with status **Wishlist**.
- The export **includes notes** (and ratings, status and game details).

## Behaviour

| Who / action | Result |
| --- | --- |
| Click **Export vault** (vault has games) | Downloads `game-vault-<name>-<yyyy-mm-dd>.json` |
| Click **Export vault** (vault empty or still loading) | Button is disabled |
| Click **Import vault** and pick a file | The file is checked and a preview shows. Nothing is saved yet |
| Preview | "Sam's vault: 24 games. 10 new, 14 already in your vault, 0 skipped." with **Import 10 as Wishlist** and **Cancel** |
| Click **Import N as Wishlist** | The new games are saved to the user's own vault as Wishlist; "Imported 10 games as Wishlist." |
| Click **Cancel** | Preview closes, nothing saved |
| File is not a Game Vault export, wrong version, not JSON, or over the size limit | "That file is not a Game Vault export." (or "too large"); nothing saved |
| Some entries in an otherwise valid file are invalid | They are skipped and counted in the preview |
| Every game in the file is already owned | "Nothing new to import: you already have all of these games." |
| Saving fails part-way | "Could not import those games. Please try again." |

Import only ever **adds**: it never replaces, edits or deletes existing games. Games are matched by
RAWG id, so importing the same file twice adds nothing the second time.

## File format (version 1)

```json
{
  "app": "game-vault",
  "version": 1,
  "exportedAt": "2026-10-16T12:00:00.000Z",
  "owner": "Sam",
  "games": [
    {
      "rawgId": 3328,
      "title": "The Witcher 3: Wild Hunt",
      "coverUrl": "https://media.rawg.io/media/games/…jpg",
      "platforms": ["PC"],
      "genres": ["RPG"],
      "releaseDate": "2015-05-18",
      "status": "completed",
      "rating": 5,
      "notes": "Best open world."
    }
  ]
}
```

## Importing is untrusted input

A friend's file could be hand-edited or malicious, so it is validated, never trusted:

- Must be JSON, `app === "game-vault"`, `version === 1`, `games` an array.
- Limits: file at most 1 MB, at most 500 games, title at most 200 characters, notes at most 1000,
  owner at most 40, at most 20 genres and 20 platforms of at most 60 characters each.
- `rawgId` must be a positive integer; `status` one of the four known values; `rating` a whole
  number 1 to 5 or `null`.
- `coverUrl` must be empty or start with `https://media.rawg.io/`. Anything else is dropped, so a
  file cannot point the app at an arbitrary (tracking) URL.
- Only known fields are read. Everything else in the file is ignored.
- An invalid game is skipped (and counted), not fatal. The file is rejected only when its overall
  shape is wrong.
- Owner and notes are shown as text only (Angular escapes them). They are never sent to the AI.

## What an imported game looks like

- `status`: `wishlist`; `rating`: `null`; `addedAt`: now.
- `notes`: the friend's notes with a clear label, so the user can tell they are not their own:
  `From Sam (5/5): Best open world.` Without a rating: `From Sam: …`. With no notes:
  `From Sam (5/5)`. Without an owner name: `From a friend`.
- Cover, platforms, genres and release date come from the file (already validated).

## Design

Everything lives in `src/app/transfer/`. Rules from `CLAUDE.md` apply.

1. **`transfer.constants.ts`**: format name and version, limits, allowed cover prefix, messages.
2. **`transfer-helpers.ts`** (pure): `buildExport`, `serializeExport`, `exportFileName`,
   `parseExport`, `planImport`, `importedNote`, `importedMessage`.
3. **`file-service.ts`**: the only code that touches the browser file APIs:
   `download(fileName, text)` and `readText(file)`.
4. **`transfer-service.ts`**: reads games from `GameVaultCrudService` (never the facade, to avoid a
   circular dependency) and the user name from `Authservice`. Signals: `preview`
   (`ImportPreview | null`), `busy`, `message`. Methods: `exportVault()`, `chooseFile(file)`,
   `confirmImport()`, `cancelImport()`. Saves with `crud.create` in small batches.
5. **Facade pointers**: `GameVaultService` gets one-line pointers: `transferPreview`,
   `transferBusy`, `transferMessage`, `exportVault()`, `chooseImportFile(file)`, `confirmImport()`,
   `cancelImport()`.
6. **`TransferPanel` component** (UI only): Export and Import buttons, a hidden file input, the
   preview with Import / Cancel, and the status message (`role="status"`).
7. **`GameList`** shows the panel under the "<name>'s vault" heading.

## Testing (written first)

- Helpers: export contents and file name; every validation rule above; duplicates; skipped
  entries; the note wording; the result messages.
- `FileService`: download builds a file and clicks a link; `readText` returns the text.
- `TransferService`: export of an empty or loading vault; a valid file makes a preview; a bad file
  sets a message and no preview; confirm saves only new games as Wishlist; importing twice adds
  nothing; a save failure sets the error message; cancel clears the preview.
- `TransferPanel` and `GameList`: each state renders and events fire.

## Out of scope

Sharing by link or code, merging ratings, replacing a vault, importing from other apps, encryption.
