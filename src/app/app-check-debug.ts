export const applyAppCheckDebugToken = (token: string, target: Record<string, unknown> = globalThis): void => {
  if (!token) return;
  target['FIREBASE_APPCHECK_DEBUG_TOKEN'] = token;
};
