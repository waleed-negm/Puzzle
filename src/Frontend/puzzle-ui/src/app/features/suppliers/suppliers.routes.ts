import { Routes } from '@angular/router';

export const suppliersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./supplier-list/supplier-list').then((m) => m.SupplierList)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./supplier-detail/supplier-detail').then((m) => m.SupplierDetail)
  }
];
