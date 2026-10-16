import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { GameVaultCrudService } from '../game-vault-crud-service';
import { GameEntryWithId } from '../game-vault-interface';
import { RawgService } from '../rawg-service';
import { AiService } from './ai-service';
import { SuggestionsService } from './suggestions-service';
import { entry, saved } from './suggestions-test-data';

/** The reasons and "ask in your own words" parts of SuggestionsService. */
describe('SuggestionsService asking and reasons', () => {
  const games = signal<GameEntryWithId[] | null>([]);
  const ai = { generate: vi.fn() };
  const rawg = { findByTitle: vi.fn() };
  let service: SuggestionsService;

  const flush = () => TestBed.tick();
  const titles = () => service.suggestions()?.map((game) => game.title);
  const lastPrompt = () => ai.generate.mock.calls.at(-1)?.[0] as string;
  const settled = () =>
    vi.waitFor(() => {
      flush();
      expect(service.suggestions()).not.toBeNull();
    });
  const turnOn = async () => {
    service.setEnabled(true);
    await settled();
  };
  const waitForCalls = (count: number) =>
    vi.waitFor(() => {
      flush();
      expect(ai.generate).toHaveBeenCalledTimes(count);
    });

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

  describe('reasons', () => {
    const withReasons = JSON.stringify([
      { title: 'Hades', reason: 'Fast combat like Hollow Knight.' },
      { title: 'Celeste', reason: 'Tight platforming.' },
    ]);

    it('pairs each suggestion with the AI reason, by RAWG id', async () => {
      ai.generate.mockResolvedValue(withReasons);
      await turnOn();
      expect(service.reasons().get(2)).toBe('Fast combat like Hollow Knight.');
      expect(service.reasons().get(3)).toBe('Tight platforming.');
    });

    it('has no reasons when the AI only gave titles', async () => {
      await turnOn();
      expect(service.reasons().get(2)).toBe('');
    });

    it('drops the reason of a game that was dropped', async () => {
      ai.generate.mockResolvedValue(withReasons);
      rawg.findByTitle.mockImplementation((title: string) =>
        Promise.resolve(title === 'Hades' ? entry(2, 'Hades') : undefined),
      );
      await turnOn();
      expect([...service.reasons().keys()]).toEqual([2]);
    });

    it('has no reasons while off', () => {
      expect(service.reasons().size).toBe(0);
    });
  });

  describe('asking in your own words', () => {
    it('asks the AI for that request, along with the vault', async () => {
      await turnOn();
      service.ask('something cozy for a rainy day');
      await waitForCalls(2);
      expect(lastPrompt()).toContain('"something cozy for a rainy day"');
      expect(lastPrompt()).toContain('Hollow Knight');
      expect(service.asked()).toBe('something cozy for a rainy day');
    });

    it('cleans the request before using it', async () => {
      await turnOn();
      service.ask('  a   "fun"\n game ');
      expect(service.asked()).toBe("a 'fun' game");
    });

    it('works with an empty vault, from the request alone', async () => {
      games.set([]);
      service.setEnabled(true);
      service.ask('something scary');
      await settled();
      expect(ai.generate).toHaveBeenCalledOnce();
      expect(lastPrompt()).toContain('I have no games saved yet.');
      expect(titles()).toEqual(['Hades', 'Celeste']);
    });

    it('still says nothing can be suggested for an empty vault with no request', () => {
      games.set([]);
      service.setEnabled(true);
      flush();
      expect(service.vaultEmpty()).toBe(true);
      expect(ai.generate).not.toHaveBeenCalled();
    });

    it('does not call the vault empty once something is asked', () => {
      games.set([]);
      service.setEnabled(true);
      service.ask('cozy');
      expect(service.vaultEmpty()).toBe(false);
    });

    it('waits for the vault to load before asking', () => {
      games.set(null);
      service.setEnabled(true);
      service.ask('cozy');
      flush();
      expect(service.suggestions()).toBeNull();
      expect(ai.generate).not.toHaveBeenCalled();
    });

    it('asks again when the same request is made twice', async () => {
      await turnOn();
      service.ask('cozy');
      await waitForCalls(2);
      await settled();
      service.ask('cozy');
      await waitForCalls(3);
    });

    it('goes back to the vault when the request is cleared', async () => {
      await turnOn();
      service.ask('cozy');
      await waitForCalls(2);
      service.clearAsk();
      await waitForCalls(3);
      expect(service.asked()).toBe('');
      expect(lastPrompt()).not.toContain('this request');
    });

    it('treats a blank request as clearing it', async () => {
      await turnOn();
      service.ask('cozy');
      service.ask('   ');
      expect(service.asked()).toBe('');
    });

    it('forgets the request when the AI is switched off', async () => {
      await turnOn();
      service.ask('cozy');
      service.setEnabled(false);
      expect(service.asked()).toBe('');
    });

    it('does not ask again when a game is added while a request is active', async () => {
      await turnOn();
      service.ask('cozy');
      await waitForCalls(2);
      await settled();
      games.update((current) => [...(current ?? []), saved(9, 'Another')]);
      flush();
      await Promise.resolve();
      expect(ai.generate).toHaveBeenCalledTimes(2);
    });
  });
});
