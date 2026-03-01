import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard)
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./features/categories/categories.routes').then(
            (m) => m.categoriesRoutes
          )
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.routes').then(
            (m) => m.productsRoutes
          )
      },
      {
        path: 'employees',
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadChildren: () =>
          import('./features/employees/employees.routes').then(
            (m) => m.employeesRoutes
          )
      },
      {
        path: 'clients',
        loadChildren: () =>
          import('./features/clients/clients.routes').then(
            (m) => m.clientsRoutes
          )
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./features/orders/orders.routes').then(
            (m) => m.ordersRoutes
          )
      },
      {
        path: 'suppliers',
        loadChildren: () =>
          import('./features/suppliers/suppliers.routes').then(
            (m) => m.suppliersRoutes
          )
      },
      {
        path: 'supplier-invoices',
        loadChildren: () =>
          import('./features/supplier-invoices/supplier-invoices.routes').then(
            (m) => m.supplierInvoicesRoutes
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
