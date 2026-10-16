import { buildPrompt, cleanResponse } from './ai-helpers';

describe('buildPrompt', () => {
  it('puts the instructions before the request', () => {
    expect(buildPrompt('Suggest a game', 'You are a game expert.')).toBe(
      'You are a game expert.\n\nSuggest a game',
    );
  });

  it('trims the request', () => {
    expect(buildPrompt('  Suggest a game  ', 'Rules.')).toBe('Rules.\n\nSuggest a game');
  });

  it('returns only the request when there are no instructions', () => {
    expect(buildPrompt('Suggest a game', '')).toBe('Suggest a game');
  });
});

describe('cleanResponse', () => {
  it('trims surrounding whitespace', () => {
    expect(cleanResponse('  hello \n')).toBe('hello');
  });
});
