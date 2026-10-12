import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Form } from './form/form';
import { GameList } from './game-list/game-list';
import { Auth } from './auth/login/login.component';
import { Signup } from './auth/signup/signup';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'form/:id', component: Form },
  { path: 'form', redirectTo: 'game-list', pathMatch: 'full' },
  { path: 'game-list', component: GameList },
  { path: 'auth', component: Auth },
  { path: 'signup', component: Signup },
  { path: '**', redirectTo: '' },
];
