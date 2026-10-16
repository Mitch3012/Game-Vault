# Game Vault

A personal video game tracker. Search for any game, add it to your vault, and track what you want to play, what you're playing, what you've finished, and what you dropped, with a rating and notes for each.

See [PRODUCT.md](PRODUCT.md) for what the app does and why.

## Features

- Search games by title using the [RAWG](https://rawg.io/apidocs) database
- Add a game to your vault in one click (cover art, platforms, genres and release date are saved for you)
- Track each game's status: wishlist, playing, completed or dropped
- Rate games from 1 to 5 and keep your own notes
- Live updates: changes saved to Firestore show up immediately
- Optional AI suggestions: switch them on from the game list page to get games picked from your vault, each with a one-line reason, or describe what you feel like ("something cozy for a rainy day") and get matching games, even with an empty vault (Gemini through Firebase AI Logic)
- Share a vault: export it to a file, send it to a friend, and import theirs. New games arrive on your Wishlist with their notes labelled
- A "Contact the dev" button on every page with email, LinkedIn and GitHub links

## Tech stack

| Area      | Choice                                                     |
| --------- | ---------------------------------------------------------- |
| Framework | Angular 22 (standalone components, signals, signal forms)  |
| Data      | Firebase Firestore via `@angular/fire`, with App Check     |
| Game data | RAWG API, loaded with `httpResource`                       |
| AI        | Gemini through Firebase AI Logic (`@angular/fire/ai`)      |
| Styling   | Tailwind CSS 4                                             |
| Tests     | Vitest + jsdom, run through `ng test`                      |

## Getting started

### Prerequisites

- Node.js and npm (the project pins `npm@11.13.0`)
- A Firebase project with Firestore enabled
- A free RAWG API key from <https://rawg.io/apidocs>
- For AI suggestions: enable **Firebase AI Logic** (Gemini Developer API) for your project in the Firebase console

### Install

```bash
npm install
```

> `.npmrc` sets `legacy-peer-deps` because `@angular/fire` 21 declares a peer dependency on Angular 21 while this app uses Angular 22. Remove it once AngularFire supports Angular 22.

### Configure

The app reads its keys from `src/environments/environment.ts` (and `environment.development.ts` for dev builds). Neither file is in the repo, so create them by copying [`src/environments/environment.example.ts`](src/environments/environment.example.ts) twice and filling in your own values:

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
  recaptchaSiteKey: '<reCAPTCHA Enterprise site key for App Check>',
  appCheckDebugToken: '', // only needed for local development
};
```

> Do not commit real keys to a public repository. Firebase web keys are designed to be public but must be locked down with Firestore security rules and App Check. Your RAWG key is a secret, so keep it out of public source control.

### Firestore rules

Paste [firestore.rules](firestore.rules) into the Firebase console (Firestore, Rules). Until you do, the vault cannot read or write `users/{uid}/games` and will look empty.

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
| `npm run e2e`   | End-to-end tests with Playwright              |
| `npm run e2e:ui` | Playwright in its interactive UI mode        |
| `npm run e2e:report` | Open the last Playwright HTML report     |

## Routes

| Path            | Page                                            |
| --------------- | ----------------------------------------------- |
| `/`             | Home: search RAWG and add games                 |
| `/game-list`    | Your vault: every saved game (sign-in required) |
| `/form/:id`     | Edit a saved game (sign-in required)            |

## Project structure

```text
src/app/
  home/                 Search page
  game-list/            Saved games page
  form/                 Edit-details page
  game-card/            Card used by both lists
  status-picker/        Status selector
  state-message/        Loading and empty-state text
  ai/                   AI suggestions: service, helpers, switch and suggestions components
  transfer/             Export and import a vault as a file: helpers, services and the panel
  contact/              The "Contact the dev" button and the developer details
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

Each user's games are stored in the Firestore subcollection `users/{uid}/games`:

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

### End-to-end tests

Playwright drives a real browser against the running app. One-time setup:

```bash
npx playwright install chromium
```

Then run `npm run e2e`. It reuses `npm start` if the app is already running on port 4200, and starts it otherwise. The tests are in [`e2e/`](e2e) and cover what a visitor can do without an account (search, the login notice, route protection, the Contact the dev panel). RAWG is faked, so they need no API quota. Failed runs keep a screenshot, a video and a trace in `test-results/`.

Flows that need a signed-in user (the vault, export and import, AI suggestions) are covered by the unit tests. Running them end to end would need the Firebase emulators.
