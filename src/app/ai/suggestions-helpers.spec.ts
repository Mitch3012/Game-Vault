import { GameEntryWithId, NewGameEntry } from '../game-vault-interface';
import {
  buildSuggestionPrompt,
  excludeSaved,
  normalizeAsk,
  parsePicks,
  suggestionsMessage,
  suggestionsTitle,
  toSuggested,
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

  it('asks for a short reason for each pick, tied to a game in the collection', () => {
    const prompt = buildSuggestionPrompt([saved()]);
    expect(prompt).toContain('"reason"');
    expect(prompt).toContain('one short sentence');
    expect(prompt).toContain('mention a specific game from my collection');
  });

  it("includes the user's request, and still lists the collection", () => {
    const prompt = buildSuggestionPrompt([saved()], 3, 'something cozy for a rainy day');
    expect(prompt).toContain('best match this request: "something cozy for a rainy day"');
    expect(prompt).toContain('- Hades (wishlist)');
    expect(prompt).toContain('do not repeat any game listed above');
  });

  it('works from the request alone when the vault is empty', () => {
    const prompt = buildSuggestionPrompt([], 3, 'something cozy');
    expect(prompt).toContain('I have no games saved yet.');
    expect(prompt).toContain('"something cozy"');
    expect(prompt).toContain('say how it fits the request');
    expect(prompt).not.toContain('listed above');
  });

  it('does not mention a request when none was made', () => {
    expect(buildSuggestionPrompt([saved()])).not.toContain('this request');
  });
});

describe('normalizeAsk', () => {
  it('trims and collapses spaces and line breaks', () => {
    expect(normalizeAsk('  something   cozy\n\nfor  rain ')).toBe('something cozy for rain');
  });

  it('removes control characters', () => {
    expect(normalizeAsk('cozy\u0007 game\u0000')).toBe('cozy game');
  });

  it('swaps double quotes for single quotes so the request cannot break out of its quotes', () => {
    expect(normalizeAsk('a "fun" game')).toBe("a 'fun' game");
  });

  it('cuts the request to 200 characters', () => {
    expect(normalizeAsk('a'.repeat(500))).toHaveLength(200);
  });

  it('is empty for blank text', () => {
    expect(normalizeAsk('   \n ')).toBe('');
  });
});

describe('parsePicks', () => {
  it('reads titles with reasons', () => {
    const text = '[{"title":"Celeste","reason":"Tight platforming like Hades."}]';
    expect(parsePicks(text)).toEqual([{ title: 'Celeste', reason: 'Tight platforming like Hades.' }]);
  });

  it('still accepts a plain list of titles, with no reasons', () => {
    expect(parsePicks('["Celeste","Hades"]')).toEqual([
      { title: 'Celeste', reason: '' },
      { title: 'Hades', reason: '' },
    ]);
  });

  it('accepts a mix of titles and objects', () => {
    expect(parsePicks('["Celeste", {"title":"Hades","reason":"Fast combat."}]')).toEqual([
      { title: 'Celeste', reason: '' },
      { title: 'Hades', reason: 'Fast combat.' },
    ]);
  });

  it('reads a list wrapped in a code fence', () => {
    expect(parsePicks('```json\n[{"title":"Celeste","reason":"Cozy."}]\n```')).toEqual([
      { title: 'Celeste', reason: 'Cozy.' },
    ]);
  });

  it('reads a list surrounded by prose and a differently-cased code fence', () => {
    expect(parsePicks('Here you go:\n```JSON\n["Celeste"]\n```\nEnjoy!')).toEqual([
      { title: 'Celeste', reason: '' },
    ]);
  });

  it('reads a list that follows a sentence', () => {
    expect(parsePicks('Sure! ["Celeste", "Hades"]').map((p) => p.title)).toEqual(['Celeste', 'Hades']);
  });

  it('trims titles and drops blanks, non-strings and objects without a title', () => {
    const text = '[" Celeste ", "", 5, null, {"reason":"x"}, {"title":7}, "Hades"]';
    expect(parsePicks(text).map((p) => p.title)).toEqual(['Celeste', 'Hades']);
  });

  it('ignores a reason that is not text', () => {
    expect(parsePicks('[{"title":"Celeste","reason":42}]')).toEqual([{ title: 'Celeste', reason: '' }]);
  });

  it('cuts a long reason to 160 characters and removes control characters', () => {
    const text = JSON.stringify([{ title: 'Celeste', reason: `${'r'.repeat(300)}\u0007` }]);
    const [pick] = parsePicks(text);
    expect(pick.reason).toHaveLength(160);
    expect(pick.reason).not.toContain('\u0007');
  });

  it('removes duplicate titles, keeping the first', () => {
    const text = '[{"title":"Celeste","reason":"a"},{"title":"Celeste","reason":"b"}]';
    expect(parsePicks(text)).toEqual([{ title: 'Celeste', reason: 'a' }]);
  });

  it('returns nothing for text that is not JSON', () => {
    expect(parsePicks('Sorry, I cannot help with that.')).toEqual([]);
  });

  it('returns nothing for JSON that is not an array', () => {
    expect(parsePicks('{"games":["Celeste"]}')).toEqual([]);
  });
});

describe('toSuggested', () => {
  const found = (rawgId: number, reason = '') => ({ game: entry(rawgId), reason });

  it('keeps each found game with its reason', () => {
    expect(toSuggested([found(1, 'a'), found(2, 'b')], new Set())).toEqual([found(1, 'a'), found(2, 'b')]);
  });

  it('drops picks that were not found', () => {
    expect(toSuggested([{ game: undefined, reason: 'x' }, found(2)], new Set())).toEqual([found(2)]);
  });

  it('keeps only the first of a game that appears twice, with its reason', () => {
    expect(toSuggested([found(1, 'first'), found(1, 'second')], new Set())).toEqual([found(1, 'first')]);
  });

  it('leaves out games the user already has', () => {
    expect(toSuggested([found(1), found(2)], new Set([1]))).toEqual([found(2)]);
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

describe('suggestionsTitle', () => {
  it("uses the user's name", () => {
    expect(suggestionsTitle('Sam')).toBe('Suggested for Sam');
  });

  it('falls back to "Suggested for you" when there is no name', () => {
    expect(suggestionsTitle('')).toBe('Suggested for you');
  });

  it('names the request when one was made', () => {
    expect(suggestionsTitle('Sam', 'rainy day')).toBe('Picks for "rainy day"');
  });

  it('names the request even when there is no user name', () => {
    expect(suggestionsTitle('', 'rainy day')).toBe('Picks for "rainy day"');
  });
});
