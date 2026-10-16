import { Injector, InjectionToken, Service, Signal, computed, inject, runInInjectionContext, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Auth,
  User,
  UserCredential,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

import { signedInFrom, userIdOf, userNameOf } from './auth-helpers';

export type SignInFn = (auth: Auth, email: string, password: string) => Promise<UserCredential>;
export type UpdateProfileFn = (user: User, profile: { displayName: string }) => Promise<void>;
export type AuthStateFn = (auth: Auth) => Observable<User | null>;
export type SignOutFn = (auth: Auth) => Promise<void>;

/** The Firebase sign-out call. A token so tests can swap it without mocking the module. */
export const SIGN_OUT = new InjectionToken<SignOutFn>('SIGN_OUT', {
  providedIn: 'root',
  factory: () => signOut,
});

/** The Firebase auth-state stream. A token so tests can swap it without mocking the module. */
export const AUTH_STATE = new InjectionToken<AuthStateFn>('AUTH_STATE', {
  providedIn: 'root',
  factory: () => authState,
});

/** The Firebase sign-in call. A token so tests can swap it without mocking the module. */
export const SIGN_IN = new InjectionToken<SignInFn>('SIGN_IN', {
  providedIn: 'root',
  factory: () => signInWithEmailAndPassword,
});

/** The Firebase create-account call. A token so tests can swap it without mocking the module. */
export const CREATE_USER = new InjectionToken<SignInFn>('CREATE_USER', {
  providedIn: 'root',
  factory: () => createUserWithEmailAndPassword,
});

/** The Firebase profile update call. A token so tests can swap it without mocking the module. */
export const UPDATE_PROFILE = new InjectionToken<UpdateProfileFn>('UPDATE_PROFILE', {
  providedIn: 'root',
  factory: () => updateProfile,
});

@Service()
export class Authservice {
  private readonly auth = inject(Auth);
  private readonly injector = inject(Injector);
  private readonly signIn = inject(SIGN_IN);
  private readonly createUser = inject(CREATE_USER);
  private readonly updateUserProfile = inject(UPDATE_PROFILE);
  private readonly authState = inject(AUTH_STATE);
  private readonly signOutOfFirebase = inject(SIGN_OUT);

  // `undefined` = Firebase has not said yet, `null` = nobody is signed in.
  private readonly user: Signal<User | null | undefined> = toSignal(this.authState(this.auth), {
    initialValue: undefined,
  });

  // Firebase does not announce a profile change (the name saved at signup), so signup bumps this.
  private readonly profileChanges = signal(0);

  /** The signed-in user's uid. `null` = Firebase has not said yet, `''` = nobody is signed in. */
  readonly userId: Signal<string | null> = computed(() => userIdOf(this.user()));

  /** The signed-in user's display name. `''` when nobody is signed in or there is no name. */
  readonly userName: Signal<string> = computed(() => {
    this.profileChanges();
    return userNameOf(this.user());
  });

  /** Whether a user is signed in. `null` = Firebase has not said yet. */
  readonly signedIn: Signal<boolean | null> = computed(() => signedInFrom(this.userId()));

  login(email: string, password: string): Promise<UserCredential> {
    return this.inContext(() => this.signIn(this.auth, email, password));
  }

  logout(): Promise<void> {
    return this.inContext(() => this.signOutOfFirebase(this.auth));
  }

  /** Creates the account, then saves the user name as its display name. */
  async signup(userName: string, email: string, password: string): Promise<UserCredential> {
    const credential = await this.inContext(() => this.createUser(this.auth, email, password));
    await this.inContext(() => this.updateUserProfile(credential.user, { displayName: userName }));
    this.profileChanges.update((count) => count + 1);
    return credential;
  }

  // AngularFire expects its calls inside an injection context. Event handlers run outside one.
  private inContext<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }
}
