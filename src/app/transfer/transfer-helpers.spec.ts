import { buildExport, exportFileName, parseExport, serializeExport } from './transfer-helpers';
import { file, parsedGames, saved, wire } from './transfer-test-data';
import {
  EXPORT_APP,
  EXPORT_VERSION,
  INVALID_FILE_MESSAGE,
  MAX_FILE_CHARS,
  MAX_GAMES,
  TOO_BIG_MESSAGE,
  TOO_MANY_MESSAGE,
} from './transfer.constants';

describe('buildExport', () => {
  const now = new Date('2026-10-16T12:00:00.000Z');

  it('labels the file and records who and when', () => {
    expect(buildExport([saved()], 'Sam', now)).toMatchObject({
      app: EXPORT_APP,
      version: EXPORT_VERSION,
      exportedAt: '2026-10-16T12:00:00.000Z',
      owner: 'Sam',
    });
  });

  it('includes notes, rating, status and game details, but not ids or dates added', () => {
    expect(buildExport([saved()], 'Sam', now).games).toEqual([
      {
        rawgId: 3328,
        title: 'The Witcher 3',
        coverUrl: 'https://media.rawg.io/media/games/w3.jpg',
        platforms: ['PC'],
        genres: ['RPG'],
        releaseDate: '2015-05-18',
        status: 'completed',
        rating: 5,
        notes: 'Best open world.',
      },
    ]);
  });

  it('writes empty notes for games saved before notes existed', () => {
    const old = saved({ notes: undefined as unknown as string });
    expect(buildExport([old], 'Sam', now).games[0].notes).toBe('');
  });
});

describe('exportFileName', () => {
  const now = new Date('2026-10-16T12:00:00.000Z');

  it('includes the owner and the date', () => {
    expect(exportFileName('Sam', now)).toBe('game-vault-sam-2026-10-16.json');
  });

  it('makes an awkward name safe for a file', () => {
    expect(exportFileName('Sam O\'Neil / 99!', now)).toBe('game-vault-sam-o-neil-99-2026-10-16.json');
  });

  it('leaves the name out when there is none', () => {
    expect(exportFileName('', now)).toBe('game-vault-2026-10-16.json');
  });
});

describe('parseExport', () => {
  it('reads back what was exported', () => {
    const text = serializeExport(buildExport([saved()], 'Sam', new Date()));
    const result = parsedGames(text);
    expect(result.owner).toBe('Sam');
    expect(result.skipped).toBe(0);
    expect(result.games).toEqual([
      expect.objectContaining({ rawgId: 3328, title: 'The Witcher 3', rating: 5, notes: 'Best open world.' }),
    ]);
  });

  it.each([['not json at all'], ['[]'], ['null'], ['42'], ['"text"']])('rejects %s', (text) => {
    expect(parseExport(text)).toEqual({ ok: false, error: INVALID_FILE_MESSAGE });
  });

  it('rejects a file from another app', () => {
    expect(parseExport(file([], { app: 'other' }))).toEqual({ ok: false, error: INVALID_FILE_MESSAGE });
  });

  it('rejects a version it does not know', () => {
    expect(parseExport(file([], { version: 2 }))).toEqual({ ok: false, error: INVALID_FILE_MESSAGE });
  });

  it('rejects a file whose games are not a list', () => {
    expect(parseExport(file([], { games: 'x' }))).toEqual({ ok: false, error: INVALID_FILE_MESSAGE });
  });

  it('rejects a file that is too big', () => {
    expect(parseExport(' '.repeat(MAX_FILE_CHARS + 1))).toEqual({ ok: false, error: TOO_BIG_MESSAGE });
  });

  it('rejects a file with too many games', () => {
    const games = Array.from({ length: MAX_GAMES + 1 }, (_, i) => wire({ rawgId: i + 1 }));
    expect(parseExport(file(games))).toEqual({ ok: false, error: TOO_MANY_MESSAGE });
  });

  it.each([
    ['a missing RAWG id', { rawgId: undefined }],
    ['a RAWG id of zero', { rawgId: 0 }],
    ['a fractional RAWG id', { rawgId: 1.5 }],
    ['a RAWG id that is text', { rawgId: '1' }],
    ['no title', { title: '   ' }],
    ['an unknown status', { status: 'abandoned' }],
    ['a rating of 6', { rating: 6 }],
    ['a fractional rating', { rating: 2.5 }],
  ])('skips a game with %s, and counts it', (_label, overrides) => {
    const result = parsedGames(file([wire(), wire({ rawgId: 2, ...overrides })]));
    expect(result.games).toHaveLength(1);
    expect(result.skipped).toBe(1);
  });

  it('skips entries that are not objects', () => {
    const result = parsedGames(file([wire(), 'x', null, 7, ['a']]));
    expect(result.games).toHaveLength(1);
    expect(result.skipped).toBe(4);
  });

  it('keeps a RAWG cover but drops one from anywhere else, keeping the game', () => {
    const result = parsedGames(
      file([
        wire({ rawgId: 1, coverUrl: 'https://media.rawg.io/media/a.jpg' }),
        wire({ rawgId: 2, coverUrl: 'https://tracker.example/pixel.gif' }),
        wire({ rawgId: 3, coverUrl: 'javascript:alert(1)' }),
      ]),
    );
    expect(result.games.map((g) => g.coverUrl)).toEqual(['https://media.rawg.io/media/a.jpg', '', '']);
  });

  it('cuts overlong text and lists to the limits', () => {
    const result = parsedGames(
      file([
        wire({
          title: 'T'.repeat(500),
          notes: 'n'.repeat(5000),
          genres: Array.from({ length: 50 }, () => 'g'.repeat(100)),
        }),
      ]),
    );
    const [game] = result.games;
    expect(game.title).toHaveLength(200);
    expect(game.notes).toHaveLength(1000);
    expect(game.genres).toHaveLength(20);
    expect(game.genres[0]).toHaveLength(60);
  });

  it('strips control characters from the owner, but keeps line breaks in notes', () => {
    const result = parsedGames(
      file([wire({ notes: 'line one\nline two\u0007' })], { owner: 'Sa\u0000m\u001b' }),
    );
    expect(result.owner).toBe('Sam');
    expect(result.games[0].notes).toBe('line one\nline two');
  });

  it('ignores fields it does not know', () => {
    const result = parsedGames(file([wire({ addedAt: 1, id: 'x', evil: '<script>' })]));
    expect(Object.keys(result.games[0]).sort()).toEqual(
      ['coverUrl', 'genres', 'notes', 'platforms', 'rating', 'rawgId', 'releaseDate', 'status', 'title'],
    );
  });

  it('copes with a missing owner', () => {
    expect(parsedGames(file([], { owner: undefined })).owner).toBe('');
  });
});
