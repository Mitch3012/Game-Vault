export interface GameVaultInterface {
  id: string; // Firestore doc id
  rawgId: number; // id from the RAWG API
  title: string;
  coverUrl: string;
  platforms: string[];
  genres: string[];
  releaseDate: string;
  rating: number | null; // your own score
  status: 'wishlist' | 'playing' | 'completed' | 'dropped';
  addedAt: number; // timestamp
}
