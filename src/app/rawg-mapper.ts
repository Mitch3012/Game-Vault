import { GameStatus, NewGameEntry } from './game-vault-interface';
import { RawgGame, RawgNamed } from './rawg-interface';

export const namesOf = (items: RawgNamed[] = []): string[] => items.map((item) => item.name);

export const platformNamesOf = (game: RawgGame): string[] =>
  namesOf((game.platforms ?? []).map((entry) => entry.platform));

export const toNewGameEntry = (game: RawgGame, status: GameStatus = 'wishlist'): NewGameEntry => ({
  rawgId: game.id,
  title: game.name,
  coverUrl: game.background_image ?? '',
  platforms: platformNamesOf(game),
  genres: namesOf(game.genres),
  releaseDate: game.released ?? '',
  rating: null,
  status,
  notes: '',
});

export const toNewGameEntries = (games: RawgGame[] = [], status: GameStatus = 'wishlist'): NewGameEntry[] =>
  games.map((game) => toNewGameEntry(game, status));
