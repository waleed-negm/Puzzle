import { Routes } from '@angular/router';

export const ordersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./order-list/order-list').then((m) => m.OrderList)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./order-form/order-form').then((m) => m.OrderForm)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./order-detail/order-detail').then((m) => m.OrderDetail)
  }
];
