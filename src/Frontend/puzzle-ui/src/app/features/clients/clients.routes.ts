import { Routes } from '@angular/router';

export const clientsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./client-list/client-list').then((m) => m.ClientList)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./client-detail/client-detail').then((m) => m.ClientDetail)
  }
];
