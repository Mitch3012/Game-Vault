import {
  chunk,
  firstFile,
  importedMessage,
  importedNote,
  planImport,
  previewSummary,
} from './transfer-helpers';
import { file, parsedGames, wire } from './transfer-test-data';

describe('importedNote', () => {
  it('labels the friend, their rating and their notes', () => {
    expect(importedNote('Sam', 5, 'Best open world.')).toBe('From Sam (5/5): Best open world.');
  });

  it('leaves out the rating when there is none', () => {
    expect(importedNote('Sam', null, 'Good.')).toBe('From Sam: Good.');
  });

  it('leaves out the notes when there are none', () => {
    expect(importedNote('Sam', 4, '')).toBe('From Sam (4/5)');
  });

  it('calls an unnamed owner "a friend"', () => {
    expect(importedNote('', null, '')).toBe('From a friend');
  });
});

describe('planImport', () => {
  const parsed = (games: ReturnType<typeof wire>[], owner = 'Sam', skipped = 0) => {
    const result = parsedGames(file(games, { owner }));
    return { ...result, skipped: result.skipped + skipped };
  };

  it('imports games the user does not have, as Wishlist with a labelled note and no rating', () => {
    const plan = planImport(parsed([wire({ rating: 5, status: 'completed', notes: 'Great.' })]), new Set());
    expect(plan.fresh).toEqual([
      expect.objectContaining({ rawgId: 1, status: 'wishlist', rating: null, notes: 'From Sam (5/5): Great.' }),
    ]);
  });

  it('leaves out games the user already has, and counts them', () => {
    const plan = planImport(parsed([wire({ rawgId: 1 }), wire({ rawgId: 2 })]), new Set([1]));
    expect(plan.fresh.map((g) => g.rawgId)).toEqual([2]);
    expect(plan.alreadyOwned).toBe(1);
  });

  it('counts a game listed twice in the file only once, and the repeat as skipped', () => {
    const plan = planImport(parsed([wire({ rawgId: 1 }), wire({ rawgId: 1 })]), new Set());
    expect(plan.fresh).toHaveLength(1);
    expect(plan.skipped).toBe(1);
  });

  it('adds the invalid entries it was given to the skipped count and the total', () => {
    const plan = planImport(parsed([wire()], 'Sam', 2), new Set());
    expect(plan.skipped).toBe(2);
    expect(plan.total).toBe(3);
  });

  it('carries the owner name', () => {
    expect(planImport(parsed([wire()], 'Sam'), new Set()).owner).toBe('Sam');
  });
});

describe('previewSummary', () => {
  it('describes what would happen', () => {
    const preview = { owner: 'Sam', total: 24, fresh: new Array(10), alreadyOwned: 14, skipped: 0 };
    expect(previewSummary(preview as never)).toBe(
      "Sam's vault: 24 games. 10 new, 14 already in your vault, 0 skipped.",
    );
  });

  it('calls an unnamed owner a friend', () => {
    const preview = { owner: '', total: 1, fresh: new Array(1), alreadyOwned: 0, skipped: 0 };
    expect(previewSummary(preview as never)).toBe("A friend's vault: 1 game. 1 new, 0 already in your vault, 0 skipped.");
  });
});

describe('importedMessage', () => {
  it('says how many games were imported', () => {
    expect(importedMessage(10)).toBe('Imported 10 games as Wishlist.');
  });

  it('uses the singular for one game', () => {
    expect(importedMessage(1)).toBe('Imported 1 game as Wishlist.');
  });
});

describe('chunk', () => {
  it('splits a list into groups of at most the given size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('gives no groups for an empty list', () => {
    expect(chunk([], 3)).toEqual([]);
  });

  it('treats a size below one as one', () => {
    expect(chunk([1, 2], 0)).toEqual([[1], [2]]);
  });
});

describe('firstFile', () => {
  it('is null when nothing was chosen', () => {
    expect(firstFile(null)).toBeNull();
    expect(firstFile([] as unknown as FileList)).toBeNull();
  });

  it('is the first file chosen', () => {
    const first = new File(['a'], 'a.json');
    const second = new File(['b'], 'b.json');
    expect(firstFile([first, second] as unknown as FileList)).toBe(first);
  });
});
