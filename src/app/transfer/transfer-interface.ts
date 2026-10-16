import { GameStatus, NewGameEntry } from '../game-vault-interface';

/** One game as written in an export file. */
export interface ExportedGame {
  rawgId: number;
  title: string;
  coverUrl: string;
  platforms: string[];
  genres: string[];
  releaseDate: string;
  status: GameStatus;
  rating: number | null;
  notes: string;
}

export interface VaultExport {
  app: string;
  version: number;
  exportedAt: string;
  owner: string;
  games: ExportedGame[];
}

export type ParseResult =
  | { ok: true; owner: string; games: ExportedGame[]; skipped: number }
  | { ok: false; error: string };

/** What importing a file would do. Shown to the user before anything is saved. */
export interface ImportPreview {
  owner: string;
  total: number;
  fresh: NewGameEntry[];
  alreadyOwned: number;
  skipped: number;
}
