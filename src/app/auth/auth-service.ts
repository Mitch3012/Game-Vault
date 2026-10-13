import { Injector, InjectionToken, Service, inject, runInInjectionContext } from '@angular/core';
import { Auth, UserCredential, signInWithEmailAndPassword } from '@angular/fire/auth';

export type SignInFn = (auth: Auth, email: string, password: string) => Promise<UserCredential>;

/** The Firebase sign-in call. A token so tests can swap it without mocking the module. */
export const SIGN_IN = new InjectionToken<SignInFn>('SIGN_IN', {
  providedIn: 'root',
  factory: () => signInWithEmailAndPassword,
});

@Service()
export class Authservice {
  private readonly auth = inject(Auth);
  private readonly injector = inject(Injector);
  private readonly signIn = inject(SIGN_IN);

  login(email: string, password: string): Promise<UserCredential> {
    return this.inContext(() => this.signIn(this.auth, email, password));
  }

  // AngularFire expects its calls inside an injection context. Event handlers run outside one.
  private inContext<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }
}
