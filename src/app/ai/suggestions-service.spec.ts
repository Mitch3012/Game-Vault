import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { GameVaultCrudService } from '../game-vault-crud-service';
import { GameEntryWithId, NewGameEntry } from '../game-vault-interface';
import { RawgService } from '../rawg-service';
import { AiService } from './ai-service';
import { SuggestionsService } from './suggestions-service';

const entry = (rawgId: number, title = `Game ${rawgId}`): NewGameEntry => ({
  rawgId,
  title,
  coverUrl: '',
  platforms: [],
  genres: [],
  releaseDate: '',
  rating: null,
  status: 'wishlist',
  notes: '',
});

const saved = (rawgId: number, title: string): GameEntryWithId => ({
  ...entry(rawgId, title),
  id: `doc${rawgId}`,
  addedAt: 0,
});

describe('SuggestionsService', () => {
  const games = signal<GameEntryWithId[] | null>([]);
  const ai = { generate: vi.fn() };
  const rawg = { findByTitle: vi.fn() };
  let service: SuggestionsService;

  const flush = () => TestBed.tick();
  const titles = () => service.suggestions()?.map((game) => game.title);
  const settled = () =>
    vi.waitFor(() => {
      flush();
      expect(service.suggestions()).not.toBeNull();
    });
  const turnOn = async () => {
    service.setEnabled(true);
    await settled();
  };

  beforeEach(() => {
    games.set([saved(1, 'Hollow Knight')]);
    ai.generate.mockReset().mockResolvedValue('["Hades","Celeste"]');
    rawg.findByTitle
      .mockReset()
      .mockImplementation((title: string) => Promise.resolve(title === 'Hades' ? entry(2, 'Hades') : entry(3, 'Celeste')));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: GameVaultCrudService, useValue: { games } },
        { provide: AiService, useValue: ai },
        { provide: RawgService, useValue: rawg },
      ],
    });
    service = TestBed.inject(SuggestionsService);
  });

  it('is off, empty, and makes no AI call by default', async () => {
    flush();
    expect(service.enabled()).toBe(false);
    expect(service.suggestions()).toEqual([]);
    expect(ai.generate).not.toHaveBeenCalled();
  });

  it('is loading, with no AI call, while the vault is still loading', () => {
    games.set(null);
    service.setEnabled(true);
    flush();
    expect(service.suggestions()).toBeNull();
    expect(ai.generate).not.toHaveBeenCalled();
  });

  it('makes no AI call for an empty vault and says the vault is empty', () => {
    games.set([]);
    service.setEnabled(true);
    flush();
    expect(service.suggestions()).toEqual([]);
    expect(service.vaultEmpty()).toBe(true);
    expect(ai.generate).not.toHaveBeenCalled();
  });

  it('asks the AI once, with the vault in the prompt, and resolves the titles through RAWG', async () => {
    await turnOn();
    expect(titles()).toEqual(['Hades', 'Celeste']);
    expect(ai.generate).toHaveBeenCalledOnce();
    expect(ai.generate.mock.calls[0][0]).toContain('Hollow Knight');
  });

  it('is loading while the AI is working', async () => {
    let reply: (text: string) => void = () => undefined;
    ai.generate.mockReturnValue(new Promise<string>((resolve) => (reply = resolve)));
    service.setEnabled(true);
    flush();
    expect(service.suggestions()).toBeNull();
    reply('["Hades"]');
    await settled();
    expect(titles()).toEqual(['Hades']);
  });

  it('does not ask the AI again when a game is added to the vault', async () => {
    await turnOn();
    games.update((current) => [...(current ?? []), saved(9, 'Another')]);
    flush();
    await Promise.resolve();
    expect(ai.generate).toHaveBeenCalledOnce();
    expect(titles()).toEqual(['Hades', 'Celeste']);
  });

  it('asks the AI again on refresh', async () => {
    await turnOn();
    service.refresh();
    await vi.waitFor(() => {
      flush();
      expect(ai.generate).toHaveBeenCalledTimes(2);
    });
  });

  it('asks the AI once when the vault goes from empty to having a game', async () => {
    games.set([]);
    service.setEnabled(true);
    flush();
    games.set([saved(1, 'Hollow Knight')]);
    await vi.waitFor(() => {
      flush();
      expect(ai.generate).toHaveBeenCalledOnce();
    });
  });

  it('clears the suggestions when the vault empties', async () => {
    await turnOn();
    games.set([]);
    flush();
    expect(service.suggestions()).toEqual([]);
    expect(service.vaultEmpty()).toBe(true);
  });

  it('clears the suggestions when switched off', async () => {
    await turnOn();
    service.setEnabled(false);
    expect(service.suggestions()).toEqual([]);
  });

  it('sets failed, logs the error, and does not throw when the AI call fails', async () => {
    ai.generate.mockRejectedValue(new Error('AI Logic not enabled'));
    service.setEnabled(true);
    await vi.waitFor(() => {
      flush();
      expect(service.failed()).toBe(true);
    });
    expect(service.suggestions()).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it('shows nothing, and is not failed, when the AI reply is not JSON', async () => {
    ai.generate.mockResolvedValue('Sorry, I cannot help with that.');
    await turnOn();
    expect(service.suggestions()).toEqual([]);
    expect(service.failed()).toBe(false);
  });

  it('drops titles that RAWG cannot find', async () => {
    rawg.findByTitle.mockImplementation((title: string) =>
      Promise.resolve(title === 'Hades' ? entry(2, 'Hades') : undefined),
    );
    await turnOn();
    expect(titles()).toEqual(['Hades']);
  });

  it('never suggests a game already in the vault', async () => {
    rawg.findByTitle.mockImplementation((title: string) =>
      Promise.resolve(title === 'Hades' ? entry(1, 'Hollow Knight') : entry(3, 'Celeste')),
    );
    await turnOn();
    expect(titles()).toEqual(['Celeste']);
  });

  it('shows a game once when two titles resolve to the same RAWG game', async () => {
    rawg.findByTitle.mockResolvedValue(entry(2, 'Hades'));
    await turnOn();
    expect(titles()).toEqual(['Hades']);
  });

  it('looks up at most six titles', async () => {
    ai.generate.mockResolvedValue(JSON.stringify(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']));
    rawg.findByTitle.mockImplementation((title: string) => Promise.resolve(entry(title.charCodeAt(0), title)));
    await turnOn();
    expect(rawg.findByTitle).toHaveBeenCalledTimes(6);
  });
});
