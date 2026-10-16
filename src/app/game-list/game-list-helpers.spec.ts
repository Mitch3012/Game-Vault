import { vaultTitle } from './game-list-helpers';

describe('vaultTitle', () => {
  it("uses the user's name", () => {
    expect(vaultTitle('Sam')).toBe("Sam's vault");
  });

  it('falls back to "Your vault" when there is no name', () => {
    expect(vaultTitle('')).toBe('Your vault');
  });
});
