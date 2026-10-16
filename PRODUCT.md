# Game Vault: Product Overview

## Summary

Game Vault is a personal video game tracker. It gives a player one place to keep the games they own, want, are playing and have finished, so nothing gets lost in a long backlog.

## Problem

Players juggle several stores and platforms. Wishlists live in one place, a half-finished game in another, and impressions of finished games nowhere. People forget what they meant to play, buy games they already own, and lose their opinions of games they finished.

## Target user

A solo gamer who:

- has a backlog across more than one platform
- wants a simple list, not a social network
- wants to record a quick rating and some notes on each game

## Product goals

1. Adding a game takes seconds: search, click, done.
2. The vault always shows each game's current status.
3. The app stays fast and simple to use.

## Current features (built)

| Feature         | Description                                                                              |
| --------------- | ---------------------------------------------------------------------------------------- |
| Game search     | Find games by title using the RAWG database                                              |
| One-click add   | Saves the game with cover art, platforms, genres and release date. Duplicates are ignored |
| Vault list      | All saved games as cards, with loading and empty states                                  |
| Status tracking | Wishlist, Playing, Completed, Dropped                                                    |
| Rating          | Optional 1 to 5 stars. Click a star to set it, click it again to clear                   |
| Notes           | Free-text notes per game                                                                 |
| Edit and remove | Edit details from the vault or remove a game from search or the list                     |
| Live sync       | Changes appear straight away because the vault reads from Firestore in real time         |
| Error feedback  | A failed add or remove shows a dismissible message on the page                           |
| AI suggestions  | An optional switch on the game list page. When on, Gemini suggests games based on your vault, each with a short reason, and each can be added in one click. You can also type what you feel like ("something cozy for a rainy day") to get matching games, even with an empty vault |
| Share a vault   | Export your vault to a file (notes included) and import a friend's. New games are added to your Wishlist, with their notes labelled and the file checked first |
| Contact the dev | A button on every page that opens the developer's email, LinkedIn and GitHub |

## User flows

**Add a game:** Home, type a title, see results, click "Add to vault". The card switches to Edit and Remove. If you are not logged in, a notice with a link to the login page appears instead and nothing is saved.

**Update a game:** Vault, Edit, change the status, rating or notes, Save. The app returns to the vault.

**Remove a game:** Click Remove on any saved game, from the search results or the vault.

**Share a vault:** Game list, Export vault, send the file to a friend. They open their Game list, Import vault, pick the file, check the preview, and confirm. Nothing is saved until they confirm.

## Scope

**In scope:** a private vault for each signed-in user, search through RAWG, status, rating and notes.

**Out of scope for now:**

- Sharing vaults between users
- Social features, sharing, reviews
- Playtime tracking and achievements
- Store or purchase integrations

## Known gaps

- The "Adding…" button state resets on a timer, not on the real result of the add.
- No way to filter or sort the vault.

## Proposed next steps

These are suggestions, not commitments.

1. Filter and sort the vault by status, rating and date added.
2. Show the star rating on the cards.
3. Change status directly from the card.
4. Add a detail view per game.

## Success measures

- Time to add a game: under 10 seconds from landing on the page.
- A saved change shows up in the vault immediately, without a refresh.
- Unit tests pass and the production build succeeds.

## Technology

Angular 22, Firebase Firestore with App Check, the RAWG API and Tailwind CSS. See [README.md](README.md) for setup and structure.
