import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { RawgGame } from './rawg-interface';
import { RawgService } from './rawg-service';

const hades = {
  id: 7,
  name: 'Hades',
  background_image: 'cover.jpg',
  released: '2020-09-17',
  genres: [{ name: 'Action' }],
  platforms: [],
} as RawgGame;

describe('RawgService.findByTitle', () => {
  let service: RawgService;
  let http: HttpTestingController;
  const isSearchFor = (term: string) => (request: { url: string }) =>
    request.url.includes(`search=${term}`) && request.url.includes('page_size=1');

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(RawgService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  it('resolves with the first match, mapped to our model', async () => {
    const result = service.findByTitle('Hades');
    http.expectOne(isSearchFor('Hades')).flush({ count: 1, results: [hades] });
    await expect(result).resolves.toMatchObject({ rawgId: 7, title: 'Hades', coverUrl: 'cover.jpg' });
  });

  it('resolves undefined when nothing matches', async () => {
    const result = service.findByTitle('Hades');
    http.expectOne(isSearchFor('Hades')).flush({ count: 0, results: [] });
    await expect(result).resolves.toBeUndefined();
  });

  it('resolves undefined, and does not reject, when the request fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const result = service.findByTitle('Hades');
    http.expectOne(isSearchFor('Hades')).flush('boom', { status: 500, statusText: 'Server Error' });
    await expect(result).resolves.toBeUndefined();
  });

  it('logs the error when the request fails, so a RAWG outage is not silent', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const result = service.findByTitle('Hades');
    http.expectOne(isSearchFor('Hades')).flush('boom', { status: 500, statusText: 'Server Error' });
    await result;
    expect(log).toHaveBeenCalledOnce();
  });

  it('makes no request for a blank title', async () => {
    await expect(service.findByTitle('   ')).resolves.toBeUndefined();
    http.expectNone(() => true);
  });
});
