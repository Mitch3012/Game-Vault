import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NewGameEntry } from '../../game-vault-interface';
import {
  SUGGESTIONS_EMPTY_VAULT_TEXT,
  SUGGESTIONS_FAILED_TEXT,
  SUGGESTIONS_LOADING_TEXT,
  SUGGESTIONS_NONE_TEXT,
} from '../suggestions.constants';
import { Suggestions } from './suggestions';

const entry = (rawgId: number): NewGameEntry => ({
  rawgId,
  title: `Game ${rawgId}`,
  coverUrl: '',
  platforms: [],
  genres: [],
  releaseDate: '',
  rating: null,
  status: 'wishlist',
  notes: '',
});

describe('Suggestions', () => {
  let fixture: ComponentFixture<Suggestions>;
  const html = () => fixture.nativeElement as HTMLElement;
  const refreshButton = () =>
    [...html().querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent?.includes('Refresh'))!;

  const render = async (inputs: Partial<{ games: NewGameEntry[] | null; failed: boolean; vaultEmpty: boolean }> = {}) => {
    const values = { games: [entry(1)], failed: false, vaultEmpty: false, ...inputs };
    fixture.componentRef.setInput('games', values.games);
    fixture.componentRef.setInput('failed', values.failed);
    fixture.componentRef.setInput('vaultEmpty', values.vaultEmpty);
    fixture.componentRef.setInput('savedIds', new Map<number, string>());
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Suggestions],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(Suggestions);
  });

  it('has a heading', async () => {
    await render();
    expect(html().textContent).toContain('Suggested for you');
  });

  it('shows a card per suggestion', async () => {
    await render({ games: [entry(1), entry(2)] });
    expect(html().querySelectorAll('app-game-card').length).toBe(2);
  });

  it('shows the loading message while suggestions load', async () => {
    await render({ games: null });
    expect(html().textContent).toContain(SUGGESTIONS_LOADING_TEXT);
    expect(html().querySelector('app-game-card')).toBeNull();
  });

  it('asks the user to add games when the vault is empty', async () => {
    await render({ games: [], vaultEmpty: true });
    expect(html().textContent).toContain(SUGGESTIONS_EMPTY_VAULT_TEXT);
  });

  it('shows the failure message', async () => {
    await render({ games: [], failed: true });
    expect(html().textContent).toContain(SUGGESTIONS_FAILED_TEXT);
  });

  it('says when nothing was found', async () => {
    await render({ games: [] });
    expect(html().textContent).toContain(SUGGESTIONS_NONE_TEXT);
  });

  it('emits the RAWG id when a card is added', async () => {
    await render({ games: [entry(7)] });
    const added: number[] = [];
    fixture.componentInstance.add.subscribe((id) => added.push(id));
    html().querySelector<HTMLButtonElement>('app-game-card button')?.click();
    expect(added).toEqual([7]);
  });

  it('emits refresh when Refresh is clicked', async () => {
    await render();
    let refreshed = 0;
    fixture.componentInstance.refresh.subscribe(() => refreshed++);
    refreshButton().click();
    expect(refreshed).toBe(1);
  });

  it('disables Refresh while loading', async () => {
    await render({ games: null });
    expect(refreshButton().disabled).toBe(true);
  });

  it('disables Refresh when the vault is empty', async () => {
    await render({ games: [], vaultEmpty: true });
    expect(refreshButton().disabled).toBe(true);
  });
});
