import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const requiredRole = route.data['role'] as string;

  const token = localStorage.getItem('token');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role;

    if (userRole === requiredRole) {
      return true;
    }

    router.navigate(['/']);
    return false;
  } catch {
    router.navigate(['/login']);
    return false;
  }
};
