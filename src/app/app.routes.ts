import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Form } from './form/form';
import { GameList } from './game-list/game-list';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'form/:id', component: Form },
  { path: 'form', redirectTo: 'game-list', pathMatch: 'full' },
  { path: 'game-list', component: GameList },
  { path: '**', redirectTo: '' },
];
