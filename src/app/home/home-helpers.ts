import { GameEntryWithId } from '../game-vault-interface';

/** Maps a RAWG id to the Firestore document id of the saved game. */
export const savedIdByRawgId = (games: GameEntryWithId[] | null): Map<number, string> =>
  new Map((games ?? []).map((game) => [game.rawgId, game.id]));
