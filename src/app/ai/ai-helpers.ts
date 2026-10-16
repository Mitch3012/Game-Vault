import { AI_SYSTEM_INSTRUCTIONS } from './ai.constants';

/** Joins the instructions and the request into one prompt. Empty instructions are left out. */
export const buildPrompt = (request: string, instructions = AI_SYSTEM_INSTRUCTIONS): string =>
  [instructions, request.trim()].filter(Boolean).join('\n\n');

export const cleanResponse = (text: string): string => text.trim();
