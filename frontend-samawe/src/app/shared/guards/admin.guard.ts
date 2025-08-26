import { CanActivateFn, Router } from '@angular/router';
import { LocalStorageService } from '../services/localStorage.service';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const localStorageService = inject(LocalStorageService);
  const router = inject(Router);

  const userData = localStorageService.getUserData();
  const roleName = userData?.roleType?.name?.toLowerCase();

  if (roleName !== 'administrador' && roleName !== 'recepcionista') {
    router.navigate(['/']);
    return false;
  }

  return true;
};
