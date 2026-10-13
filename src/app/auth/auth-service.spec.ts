import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Auth, UserCredential } from '@angular/fire/auth';

import { Authservice, SIGN_IN } from './auth-service';

const fakeAuth = {} as Auth;
const credential = { user: { uid: 'u1' } } as UserCredential;

describe('Authservice', () => {
  const signIn = vi.fn();
  let service: Authservice;

  beforeEach(() => {
    signIn.mockReset();
    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: fakeAuth },
        { provide: SIGN_IN, useValue: signIn },
      ],
    });
    service = TestBed.inject(Authservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('signs in with the Auth instance and the given credentials', async () => {
    signIn.mockResolvedValue(credential);
    await expect(service.login('a@b.com', 'secret')).resolves.toBe(credential);
    expect(signIn).toHaveBeenCalledExactlyOnceWith(fakeAuth, 'a@b.com', 'secret');
  });

  it('calls Firebase inside an injection context, which AngularFire requires', async () => {
    signIn.mockImplementation(() => {
      inject(Auth);
      return Promise.resolve(credential);
    });
    await expect(service.login('a@b.com', 'secret')).resolves.toBe(credential);
  });

  it('rejects with the Firebase error when sign-in fails', async () => {
    const failure = { code: 'auth/invalid-credential' };
    signIn.mockRejectedValue(failure);
    await expect(service.login('a@b.com', 'wrong')).rejects.toBe(failure);
  });
});
