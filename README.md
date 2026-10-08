# Game Vault

A personal video game tracker. Search for any game, add it to your vault, and track what you want to play, what you're playing, what you've finished, and what you dropped, with a rating and notes for each.

See [PRODUCT.md](PRODUCT.md) for what the app does and why.

## Features

- Search games by title using the [RAWG](https://rawg.io/apidocs) database
- Add a game to your vault in one click (cover art, platforms, genres and release date are saved for you)
- Track each game's status: wishlist, playing, completed or dropped
- Rate games from 1 to 5 and keep your own notes
- Live updates: changes saved to Firestore show up immediately

## Tech stack

| Area      | Choice                                                     |
| --------- | ---------------------------------------------------------- |
| Framework | Angular 22 (standalone components, signals, signal forms)  |
| Data      | Firebase Firestore via `@angular/fire`, with App Check     |
| Game data | RAWG API, loaded with `httpResource`                       |
| Styling   | Tailwind CSS 4                                             |
| Tests     | Vitest + jsdom, run through `ng test`                      |

## Getting started

### Prerequisites

- Node.js and npm (the project pins `npm@11.13.0`)
- A Firebase project with Firestore enabled
- A free RAWG API key from <https://rawg.io/apidocs>

### Install

```bash
npm install
```

### Configure

The app reads its keys from `src/environments/environment.ts` (and `environment.development.ts` for dev builds). Fill in your own values:

```ts
export const environment = {
  apiKey: '<firebase web api key>',
  authDomain: '<project>.firebaseapp.com',
  projectId: '<project id>',
  storageBucket: '<project>.firebasestorage.app',
  messagingSenderId: '<sender id>',
  appId: '<app id>',
  measurementId: '<measurement id>',
  rawgApiKey: '<rawg api key>',
  recaptchaSiteKey: '<reCAPTCHA v3 site key for App Check>',
  appCheckDebugToken: '', // only needed for local development
};
```

> Do not commit real keys to a public repository. Firebase web keys are designed to be public but must be locked down with Firestore security rules and App Check. Your RAWG key is a secret, so keep it out of public source control.

### Run

```bash
npm start
```

Open <http://localhost:4200/>. The app reloads when you change a source file.

## Scripts

| Command         | What it does                                  |
| --------------- | --------------------------------------------- |
| `npm start`     | Dev server on port 4200                       |
| `npm run build` | Production build into `dist/`                 |
| `npm run watch` | Development build that rebuilds on change     |
| `npm test`      | Unit tests with Vitest                        |

## Routes

| Path            | Page                                            |
| --------------- | ----------------------------------------------- |
| `/`             | Home: search RAWG and add games                 |
| `/game-list`    | Your vault: every saved game                    |
| `/form/:id`     | Edit a saved game's status, rating and notes    |

## Project structure

```text
src/app/
  home/                 Search page
  game-list/            Saved games page
  form/                 Edit-details page
  game-card/            Card used by both lists
  status-picker/        Status selector
  state-message/        Loading and empty-state text
  game-vault-service.ts       Facade: the only service components use
  game-vault-crud-service.ts  Firestore reads and writes
  rawg-service.ts             RAWG search and details
  rawg-mapper.ts              RAWG response -> our game model
```

## Architecture rules

The code follows the rules in [CLAUDE.md](../CLAUDE.md). The main ones:

- Components are UI only. Logic lives in service facades and helper files.
- Firebase is only imported inside services.
- State uses signals (`toSignal`, `computed`), not manual subscriptions.
- Async collections have three states: `null` means loading, `[]` means empty.
- Templates live in their own `.html` files, and files stay under 300 lines.

## Data model

Games are stored in the Firestore `games` collection:

| Field         | Type                                                    |
| ------------- | ------------------------------------------------------- |
| `rawgId`      | number, the game's ID in RAWG                           |
| `title`       | string                                                  |
| `coverUrl`    | string                                                  |
| `platforms`   | string[]                                                |
| `genres`      | string[]                                                |
| `releaseDate` | string                                                  |
| `rating`      | number or null (1 to 5)                                 |
| `status`      | `'wishlist'`, `'playing'`, `'completed'` or `'dropped'` |
| `notes`       | string                                                  |
| `addedAt`     | number, a timestamp in ms                               |

## Testing

```bash
npm test
```

Specs sit next to the code they cover (`*.spec.ts`).
