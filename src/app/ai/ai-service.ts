import { InjectionToken, Service, inject } from '@angular/core';
import { AI, AIOptions, GenerativeModel, GoogleAIBackend, ModelParams, getGenerativeModel } from '@angular/fire/ai';

import { buildPrompt, cleanResponse } from './ai-helpers';
import { AI_MODEL_NAME } from './ai.constants';

export type CreateModelFn = (ai: AI, params: ModelParams) => Pick<GenerativeModel, 'generateContent'>;

/**
 * Options for `getAI`. With replay protection on in App Check, AI Logic rejects ordinary tokens
 * ("App Check token is invalid"), so ask the SDK for one-time tokens.
 */
export const buildAiOptions = (): AIOptions => ({
  backend: new GoogleAIBackend(),
  useLimitedUseAppCheckTokens: true,
});

/** The Firebase AI model factory. A token so tests can swap it without mocking the module. */
export const CREATE_MODEL = new InjectionToken<CreateModelFn>('CREATE_MODEL', {
  providedIn: 'root',
  factory: () => getGenerativeModel,
});

/** Talks to Gemini through Firebase AI Logic. The only file that imports the AI SDK. */
@Service()
export class AiService {
  private readonly model = inject(CREATE_MODEL)(inject(AI), { model: AI_MODEL_NAME });

  /** Resolves with the model's reply. Rejects if the call fails. */
  async generate(request: string): Promise<string> {
    const result = await this.model.generateContent(buildPrompt(request));
    return cleanResponse(result.response.text());
  }
}
