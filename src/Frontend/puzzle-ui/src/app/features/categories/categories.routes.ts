import { Routes } from '@angular/router';

export const categoriesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./category-list/category-list').then((m) => m.CategoryList)
  }
];
