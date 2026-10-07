// Only the RAWG fields we use. RAWG returns many more.
export interface RawgNamed {
  name: string;
}

export interface RawgPlatform {
  platform: RawgNamed;
}

export interface RawgGame {
  id: number;
  name: string;
  background_image: string | null;
  released: string | null;
  genres?: RawgNamed[];
  platforms?: RawgPlatform[] | null;
}

export interface RawgListResponse {
  count: number;
  results: RawgGame[];
}
