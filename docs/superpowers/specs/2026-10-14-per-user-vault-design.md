# Per-user vaults and logged-out browsing

## Goal

Anyone can search and browse games without an account. Saving a game needs an account, and every
signed-in user has their own separate list of saved games.

## Behaviour

| Who / action | Result |
| --- | --- |
| Logged out: search and browse on `/` | Works, no login needed |
| Logged out: click **Add to vault** | Shows a "Welcome to Game Vault! You haven't logged in yet. Click here to log in" notice linking to the login page (`/auth`); nothing is saved. (Changed 2026-10-16: was an immediate redirect.) |
| Logged out: open `/game-list` or `/form/:id` | Redirected to `/auth` |
| Logged out: click the **Game Vault** title | Goes to `/auth` |
| Signed in: click the **Game Vault** title | Goes to `/` |
| Signed in: **Add to vault**, list, edit, remove | Works on that user's own games only |
| Signed in: click **Log out** | Signed out, sent to `/auth` |
| Login page footer | "New to Game Vault? Sign up here", linking to `/signup` |

Sign-in state still unknown (Firebase is checking): **Add to vault** does nothing, and the route
guard waits for the answer instead of redirecting.

## Design

1. **Who is signed in.** `Authservice` exposes `userId: Signal<string | null>`: `null` = Firebase has
   not answered yet, `''` = signed out, otherwise the user's uid. `signedIn` becomes a `computed`
   over `userId`, so the existing add-to-vault redirect is unchanged. `Authservice` also gets
   `logout()`, using the same injectable-token pattern as `SIGN_IN` so tests do not mock the module.
2. **Per-user storage.** Games live at `users/{uid}/games`. `GameVaultCrudService` builds that
   path from `userId`; `games` is built with `toObservable` + `switchMap` + `toSignal`, so it follows
   the signed-in user. `null` while loading (or while the user is unknown), `[]` when signed out or
   empty. `create`, `read`, `update`, `delete` act on the signed-in user's collection and reject
   with a clear error if nobody is signed in. All Firebase imports stay in services.
3. **Facade.** `GameVaultService` adds `logout()` and `homeRoute` (a `computed`: `/auth` when
   signed out or unknown, `/` when signed in). Components keep talking only to the facade.
4. **Route guard.** A functional `CanActivateFn` (`signedInGuard`) on `/game-list` and `/form/:id`.
   It waits until `signedIn` is not `null`, then allows signed-in users and redirects others to
   `/auth`. The wait is built from `toObservable(signedIn)`; there is no `.subscribe`.
5. **Title link.** `App` turns the heading into a link to `homeRoute`. A **Log out** button shows
   only while signed in.
6. **Login footer.** Text becomes "New to Game Vault? Sign up here"; link target unchanged.
7. **Constants.** `HOME_ROUTE`, `USERS_COLLECTION`, `GAMES_SUBCOLLECTION` and the "no user" error
   message go in the constants files; `GAMES_COLLECTION` is removed when nothing uses it.

## Firestore rules (manual step)

The project has no rules file; the rules live in the Firebase console. Until they allow the new
path, reads and writes under `users/{uid}/games` will be denied and the vault will not load.
This work adds `firestore.rules` to the repo for the user to paste into the console (it cannot be
deployed from here):

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

The old shared `games` collection is left untouched in Firestore and no longer read by the app.

## Out of scope

Moving or deleting the old shared games; sharing lists between users; changes to search or RAWG;
a profile page; "remember me" options.

## Testing

- `Authservice`: `userId` is `null` then the uid then `''`; `signedIn` follows it; `logout` calls Firebase
  inside an injection context.
- `GameVaultCrudService`: collection path uses the uid; `games` is `null` while unknown, `[]` when
  signed out, and re-queries when the user changes; writes reject when signed out.
- `signedInGuard`: waits while unknown, allows when signed in, redirects to `/auth` when signed out.
- `GameVaultService`: `homeRoute` for each state; `logout` delegates and goes to `/auth`.
- `App`: title links to `homeRoute`; Log out button only when signed in and calls the facade.
- Login page: footer text and `/signup` link.
- Existing specs updated for the new `Authservice` shape.
