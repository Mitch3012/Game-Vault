import { Page } from '@playwright/test';

/** Two games in the shape RAWG's search returns. */
export const RAWG_GAMES = [
  {
    id: 1001,
    name: 'Hades',
    background_image: null,
    released: '2020-09-17',
    genres: [{ name: 'Action' }, { name: 'Roguelike' }],
    platforms: [{ platform: { name: 'PC' } }],
  },
  {
    id: 1002,
    name: 'Celeste',
    background_image: null,
    released: '2018-01-25',
    genres: [{ name: 'Platformer' }],
    platforms: [{ platform: { name: 'PC' } }],
  },
];

/** Answers every RAWG request with the two games above, so tests never touch the real API. */
export const mockRawg = async (page: Page): Promise<void> => {
  await page.route('https://api.rawg.io/**', (route) =>
    route.fulfill({ json: { count: RAWG_GAMES.length, results: RAWG_GAMES } }),
  );
};
