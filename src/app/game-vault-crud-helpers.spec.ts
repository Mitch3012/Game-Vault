import { firstValueFrom, of, toArray } from 'rxjs';

import { gamePath, gamesFor, loadErrorMessage, requireUserId, userGamesPath } from './game-vault-crud-helpers';
import { GameEntryWithId } from './game-vault-interface';
import { LOAD_ERROR_MESSAGE, NO_USER_ERROR } from './game-vault.constants';

const game = { id: 'g1', rawgId: 1, title: 'Hades' } as GameEntryWithId;

describe('userGamesPath', () => {
  it('puts the games under the user', () => {
    expect(userGamesPath('u1')).toEqual(['users', 'u1', 'games']);
  });
});

describe('gamePath', () => {
  it('points at one game under the user', () => {
    expect(gamePath('u1', 'g1')).toEqual(['users', 'u1', 'games', 'g1']);
  });
});

describe('requireUserId', () => {
  it('returns the uid', () => {
    expect(requireUserId('u1')).toBe('u1');
  });

  it('throws when the user is unknown', () => {
    expect(() => requireUserId(null)).toThrow(NO_USER_ERROR);
  });

  it('throws when signed out', () => {
    expect(() => requireUserId('')).toThrow(NO_USER_ERROR);
  });
});

describe('gamesFor', () => {
  const watch = vi.fn((uid: string) => of([{ ...game, id: uid }]));

  beforeEach(() => watch.mockClear());

  it('is null while the user is unknown, without watching anything', async () => {
    await expect(firstValueFrom(gamesFor(null, watch))).resolves.toBeNull();
    expect(watch).not.toHaveBeenCalled();
  });

  it('is empty when signed out, without watching anything', async () => {
    await expect(firstValueFrom(gamesFor('', watch))).resolves.toEqual([]);
    expect(watch).not.toHaveBeenCalled();
  });

  it('watches the signed-in user, starting with null so the previous user\'s games are cleared', async () => {
    await expect(firstValueFrom(gamesFor('u1', watch).pipe(toArray()))).resolves.toEqual([
      null,
      [{ ...game, id: 'u1' }],
    ]);
    expect(watch).toHaveBeenCalledExactlyOnceWith('u1');
  });
});

describe('loadErrorMessage', () => {
  it.each([['permission-denied'], ['firestore/permission-denied']])(
    'tells the user to deploy the Firestore rules for %s',
    (code) => {
      expect(loadErrorMessage({ code })).toContain('firestore.rules');
    },
  );

  it.each([[{ code: 'unavailable' }], [new Error('boom')], [null], [undefined]])(
    'uses the generic message for other errors (%s)',
    (error) => {
      expect(loadErrorMessage(error)).toBe(LOAD_ERROR_MESSAGE);
    },
  );
});
