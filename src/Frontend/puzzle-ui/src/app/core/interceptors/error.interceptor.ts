import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      switch (error.status) {
        case 401:
          localStorage.removeItem('token');
          router.navigate(['/login']);
          break;
        case 403:
          console.error('Access denied. You do not have permission to access this resource.');
          break;
        default:
          console.error('HTTP Error:', error.status, error.message);
          break;
      }

      return throwError(() => error);
    })
  );
};
