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

  it('reads a JSON array surrounded by prose and a differently-cased code fence', () => {
    expect(parseTitles('Here you go:\n```JSON\n["Celeste"]\n```\nEnjoy!')).toEqual(['Celeste']);
  });

  it('reads a JSON array that follows a sentence', () => {
    expect(parseTitles('Sure! ["Celeste", "Hades"]')).toEqual(['Celeste', 'Hades']);
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
