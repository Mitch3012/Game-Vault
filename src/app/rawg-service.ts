import { HttpClient, httpResource } from '@angular/common/http';
import { Service, Signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../environments/environment';
import { NewGameEntry } from './game-vault-crud-service';
import { RawgGame, RawgListResponse } from './rawg-interface';
import { toNewGameEntries, toNewGameEntry } from './rawg-mapper';
import { RAWG_BASE_URL, RAWG_GAMES_PATH, RAWG_SEARCH_PAGE_SIZE } from './rawg.constants';

export const buildRawgUrl = (
  path: string,
  params: Record<string, string> = {},
  apiKey = environment.rawgApiKey,
): string => {
  const query = new URLSearchParams({ ...params, key: apiKey });
  return `${RAWG_BASE_URL}${path}?${query}`;
};

export const buildSearchUrl = (term: string, pageSize = RAWG_SEARCH_PAGE_SIZE): string =>
  buildRawgUrl(RAWG_GAMES_PATH, { search: term, page_size: String(pageSize) });

export const buildGameUrl = (rawgId: number): string => buildRawgUrl(`${RAWG_GAMES_PATH}/${rawgId}`);

@Service()
export class RawgService {
  private readonly http = inject(HttpClient);

  /**
   * SEARCH. Pass a signal/getter for the search term.
   * `null` = loading, `[]` = nothing to show (empty term, no matches, or an error).
   * Must be called from an injection context (e.g. a field initializer).
   */
  search(term: () => string): Signal<NewGameEntry[] | null> {
    const response = httpResource<RawgListResponse>(() => this.searchRequest(term()));
    return computed(() => (response.isLoading() ? null : toNewGameEntries(response.value()?.results)));
  }

  /** DETAILS. Resolves with one game mapped to our model, ready for the CRUD service. */
  async getGame(rawgId: number): Promise<NewGameEntry> {
    const game = await firstValueFrom(this.http.get<RawgGame>(buildGameUrl(rawgId)));
    return toNewGameEntry(game);
  }

  // Returning undefined tells httpResource to stay idle (no request for an empty term).
  private searchRequest(term: string): string | undefined {
    const trimmed = term.trim();
    if (!trimmed) return undefined;
    return buildSearchUrl(trimmed);
  }
}
