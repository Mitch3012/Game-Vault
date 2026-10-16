import { signedInGuard } from './auth/signed-in-guard';
import { routes } from './app.routes';

const routeFor = (path: string) => routes.find((route) => route.path === path);

describe('routes', () => {
  it.each(['game-list', 'form/:id'])('requires sign-in for %s', (path) => {
    expect(routeFor(path)?.canActivate).toEqual([signedInGuard]);
  });

  it.each(['', 'auth', 'signup'])('leaves "%s" open to everyone', (path) => {
    expect(routeFor(path)?.canActivate).toBeUndefined();
  });
});
