export type GameStatus = 'wishlist' | 'playing' | 'completed' | 'dropped';

export interface GameEntry {
  rawgId: number; // id from the RAWG API
  title: string;
  coverUrl: string;
  platforms: string[];
  genres: string[];
  releaseDate: string;
  rating: number | null; // your own score
  status: GameStatus;
  notes: string;
  addedAt: number; // timestamp
}

export interface GameEntryWithId extends GameEntry {
  id: string; // Firestore doc id
}

export type NewGameEntry = Omit<GameEntry, 'addedAt'>;
export type GameEntryChanges = Partial<Omit<GameEntry, 'addedAt'>>;
