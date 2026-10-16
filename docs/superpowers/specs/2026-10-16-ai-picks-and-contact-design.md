# Ask the AI in your own words, AI says why, and Contact the dev

## Goal

1. **Ask in your own words.** In the suggestions section a user can type what they feel like
   ("something cozy for a rainy day") and get matching games. It works even with an empty vault.
2. **AI says why.** Every suggestion shows a one-line reason ("You loved Hades, and this has the same
   fast combat").
3. **Contact the dev.** A button on every page opens a small panel with the developer's email,
   LinkedIn and GitHub.

## Behaviour: ask in your own words

| Action | Result |
| --- | --- |
| Type a request and press **Ask** (or Enter) | Suggestions reload for that request; the heading becomes `Picks for "rainy day"`; the request is shown with a **Clear** link |
| Click an example chip (cozy, short sessions, multiplayer with friends, scary) | Same as typing it and pressing Ask |
| **Clear** | Back to suggestions based on the vault |
| **Refresh** | Asks again with the same request |
| Request is blank or only spaces | Same as Clear |
| Request longer than 200 characters | Cut to 200 |
| Empty vault, no request | "Add a few games to your vault, or describe what you feel like playing, to get suggestions." |
| Empty vault, with a request | Works: the AI answers from the request alone |
| Switch AI off | Section disappears and the request is cleared |
| Asking while suggestions are loading | The Ask button is disabled (this also limits quota use) |

Adding a suggested game still never re-asks the AI. Only the switch, a new request, Clear, a vault
going from empty to non-empty (when no request is set), or Refresh do.

The privacy note becomes: "While on, your vault's titles, genres, statuses and ratings, and anything
you type in the box, are sent to Google Gemini. Notes are never sent."

## Behaviour: AI says why

- The AI is asked for `[{"title": "...", "reason": "..."}]`. The reason must be one short sentence
  and, when the user has games, mention one specific game from their collection.
- The reason is shown under the card as `"reason" - AI's take`. It is labelled as the AI's opinion,
  not a fact.
- Reasons are plain text, cut to 160 characters, control characters removed.
- A reply that is just a list of titles (no reasons) still works: those cards simply show no reason.
- Games the AI suggests that RAWG cannot find, that are duplicates, or that the user already has
  are dropped, as before, and so are their reasons.

## Behaviour: Contact the dev

- A **Contact the dev** button sits in the top bar on every page, whether or not the user is signed in.
- Clicking it opens a small panel (click again, press Escape or use Close to hide it) with:
  - Email: mitch3012.jcm@gmail.com (a `mailto:` link)
  - LinkedIn: https://www.linkedin.com/in/mitch3012jcm/
  - GitHub: https://github.com/Mitch3012
- External links open in a new tab with `rel="noopener noreferrer"`.
- The LinkedIn address omits the `?isSelfProfile=true` part, which is only a view setting.

## Design

- `ai/suggestions-helpers.ts`: `parsePicks` replaces `parseTitles` (accepts objects or plain
  strings); `buildSuggestionPrompt` takes the request, asks for reasons and copes with an empty
  vault; `normalizeAsk`; `suggestionsTitle(name, asked)`.
- `SuggestionsService`: new `asked`, `reasons`, `ask(text)`, `clearAsk()`; the request now runs for
  an empty vault when something is asked; switching off clears the request.
- Facade pointers: `suggestionsAsked`, `suggestionsReasons`, `askSuggestions(text)`, `clearSuggestionsAsk()`.
- `SuggestionCard` (new, UI only): the game card plus its reason. This is the `@for` loop body of the
  suggestions list.
- `Suggestions`: the ask box, example chips, the active request with Clear, and the cards.
- `contact/contact-dev` (new, UI only) and `contact.constants.ts`; `App` shows it in the top bar.

## Testing (written first)

Prompt contents with and without a vault and request; every parse case (objects, strings, mixed,
fenced, prose-wrapped, bad reason types, long reasons); the service flows in the table above;
the card, the ask box and chips; the contact panel's links, attributes and open/close behaviour.

## Out of scope

Remembering past requests, a cooldown timer, conversation history, editing the developer details
from the UI.
