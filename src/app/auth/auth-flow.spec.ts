import { createAuthFlow } from './auth-flow';

describe('createAuthFlow', () => {
  const toMessage = () => 'friendly';

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('starts with no error and nothing pending', () => {
    const flow = createAuthFlow('test', toMessage);
    expect(flow.error()).toBe('');
    expect(flow.pending()).toBe(false);
  });

  it('resolves true on success', async () => {
    const flow = createAuthFlow('test', toMessage);
    await expect(flow.run(() => Promise.resolve())).resolves.toBe(true);
  });

  it('is pending only while the action is in flight', async () => {
    const flow = createAuthFlow('test', toMessage);
    let finish: (value?: unknown) => void = () => undefined;
    const attempt = flow.run(() => new Promise((resolve) => (finish = resolve)));
    expect(flow.pending()).toBe(true);
    finish();
    await attempt;
    expect(flow.pending()).toBe(false);
  });

  it('resolves false, sets the friendly error and does not reject on failure', async () => {
    const flow = createAuthFlow('test', toMessage);
    await expect(flow.run(() => Promise.reject(new Error('boom')))).resolves.toBe(false);
    expect(flow.error()).toBe('friendly');
    expect(flow.pending()).toBe(false);
  });

  it('clears an earlier error when the next attempt succeeds', async () => {
    const flow = createAuthFlow('test', toMessage);
    await flow.run(() => Promise.reject(new Error('boom')));
    await flow.run(() => Promise.resolve());
    expect(flow.error()).toBe('');
  });

  it('clears the error on request', async () => {
    const flow = createAuthFlow('test', toMessage);
    await flow.run(() => Promise.reject(new Error('boom')));
    flow.clearError();
    expect(flow.error()).toBe('');
  });
});
