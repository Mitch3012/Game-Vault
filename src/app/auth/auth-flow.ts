import { Signal, signal } from '@angular/core';

export interface AuthFlow {
  /** Message for the last failure. `''` = no error. */
  readonly error: Signal<string>;
  /** `true` while an attempt is in flight. */
  readonly pending: Signal<boolean>;
  clearError(): void;
  /** Runs the action. Never rejects: resolves `true` on success, `false` (and sets `error`) on failure. */
  run(action: () => Promise<unknown>): Promise<boolean>;
}

/** Factory for the error + pending state shared by the login and signup flows. */
export const createAuthFlow = (label: string, toMessage: (error: unknown) => string): AuthFlow => {
  const error = signal('');
  const pending = signal(false);

  const attempt = async (action: () => Promise<unknown>): Promise<boolean> => {
    try {
      await action();
      error.set('');
      return true;
    } catch (failure) {
      console.error(`[GameVaultService] ${label} failed`, failure);
      error.set(toMessage(failure));
      return false;
    }
  };

  const run = async (action: () => Promise<unknown>): Promise<boolean> => {
    pending.set(true);
    const succeeded = await attempt(action);
    pending.set(false);
    return succeeded;
  };

  return {
    error: error.asReadonly(),
    pending: pending.asReadonly(),
    clearError: () => error.set(''),
    run,
  };
};
