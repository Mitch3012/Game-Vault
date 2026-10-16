export const SUGGESTION_COUNT = 6;

/** Longest request a user can send to the AI, and longest reason we show for a pick. */
export const MAX_ASK_CHARS = 200;
export const MAX_REASON_CHARS = 160;

export const SUGGESTIONS_LOADING_TEXT = 'Finding games for you…';
export const SUGGESTIONS_EMPTY_VAULT_TEXT =
  'Add a few games to your vault, or describe what you feel like playing, to get suggestions.';
export const SUGGESTIONS_FAILED_TEXT = 'Could not get suggestions. Try Refresh.';
export const SUGGESTIONS_NONE_TEXT = 'No suggestions found. Try Refresh.';
export const SUGGESTIONS_TITLE_FALLBACK = 'Suggested for you';

export const ASK_PLACEHOLDER = 'e.g. something cozy for a rainy day';
export const ASK_EXAMPLES: readonly string[] = ['cozy', 'short sessions', 'multiplayer with friends', 'something scary'];

export const AI_PRIVACY_NOTE =
  'While on, your vault’s titles, genres, statuses and ratings, and anything you type in the box, are sent to Google Gemini. Notes are never sent.';
