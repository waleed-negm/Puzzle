import { Routes } from '@angular/router';

export const employeesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./employee-list/employee-list').then((m) => m.EmployeeList)
  }
];
