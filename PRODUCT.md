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

## User flows

**Add a game:** Home, type a title, see results, click "Add to vault". The card switches to Edit and Remove.

**Update a game:** Vault, Edit, change the status, rating or notes, Save. The app returns to the vault.

**Remove a game:** Click Remove on any saved game, from the search results or the vault.

## Scope

**In scope:** one shared vault, search through RAWG, status, rating and notes.

**Out of scope for now:**

- User accounts and per-user vaults
- Social features, sharing, reviews
- Playtime tracking and achievements
- Store or purchase integrations

## Known gaps

- No sign-in, so the vault is shared by everyone who uses the app.
- Failed add and remove actions give no feedback to the user. Only saving the edit form shows an error.
- No way to filter or sort the vault.

## Proposed next steps

These are suggestions, not commitments.

1. Show an error message when add or remove fails.
2. Filter and sort the vault by status, rating and date added.
3. Change status directly from the card.
4. Add authentication so each user has a private vault, with matching Firestore security rules.
5. Add a detail view per game.

## Success measures

- Time to add a game: under 10 seconds from landing on the page.
- A saved change shows up in the vault immediately, without a refresh.
- Unit tests pass and the production build succeeds.

## Technology

Angular 22, Firebase Firestore with App Check, the RAWG API and Tailwind CSS. See [README.md](README.md) for setup and structure.
