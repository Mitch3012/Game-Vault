import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Form } from './form/form';
import { GameList } from './game-list/game-list';
import { LoginComponent } from './auth/login/login.component';
import { Signup } from './auth/signup/signup';
import { signedInGuard } from './auth/signed-in-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'form/:id', component: Form, canActivate: [signedInGuard] },
  { path: 'form', redirectTo: 'game-list', pathMatch: 'full' },
  { path: 'game-list', component: GameList, canActivate: [signedInGuard] },
  { path: 'auth', component: LoginComponent },
  { path: 'signup', component: Signup },
  { path: '**', redirectTo: '' },
];
