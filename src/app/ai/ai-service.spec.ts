import { TestBed } from '@angular/core/testing';
import { AI, GoogleAIBackend } from '@angular/fire/ai';

import { AiService, CREATE_MODEL, buildAiOptions } from './ai-service';
import { AI_MODEL_NAME } from './ai.constants';

const fakeAi = {} as AI;

describe('buildAiOptions', () => {
  it('asks for one-time App Check tokens, which AI Logic needs when replay protection is on', () => {
    expect(buildAiOptions().useLimitedUseAppCheckTokens).toBe(true);
  });

  it('uses the Gemini Developer API backend', () => {
    expect(buildAiOptions().backend).toBeInstanceOf(GoogleAIBackend);
  });
});

describe('AiService', () => {
  const generateContent = vi.fn();
  const createModel = vi.fn();
  let service: AiService;

  beforeEach(() => {
    generateContent.mockReset();
    createModel.mockReset().mockReturnValue({ generateContent });
    TestBed.configureTestingModule({
      providers: [
        { provide: AI, useValue: fakeAi },
        { provide: CREATE_MODEL, useValue: createModel },
      ],
    });
    service = TestBed.inject(AiService);
  });

  it('creates the model with the configured model name', () => {
    expect(createModel).toHaveBeenCalledExactlyOnceWith(fakeAi, { model: AI_MODEL_NAME });
  });

  it('does not use a deprecated Gemini 2.x model', () => {
    expect(AI_MODEL_NAME).not.toMatch(/^gemini-2\./);
  });

  it('sends the built prompt and resolves with the cleaned text', async () => {
    generateContent.mockResolvedValue({ response: { text: () => '  a reply \n' } });
    await expect(service.generate('Suggest a game')).resolves.toBe('a reply');
    expect(generateContent).toHaveBeenCalledOnce();
    expect(generateContent.mock.calls[0][0]).toContain('Suggest a game');
  });

  it('rejects when the model call fails', async () => {
    generateContent.mockRejectedValue(new Error('quota'));
    await expect(service.generate('Suggest a game')).rejects.toThrow('quota');
  });
});
