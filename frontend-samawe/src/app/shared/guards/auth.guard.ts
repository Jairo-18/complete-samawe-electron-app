import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { LocalStorageService } from '../services/localStorage.service';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const authGuard: CanActivateFn = (route, state) => {
  const authService: AuthService = inject(AuthService);
  const localStorageService: LocalStorageService = inject(LocalStorageService);
  const router: Router = inject(Router);

  return authService.isAuthenticatedToGuard().pipe(
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        router.navigate(['/auth/login']);
        return false;
      }
      const userData = localStorageService.getUserData();
      const roleName = userData?.roleType?.name?.toLowerCase();
      const currentRoute = state.url;

      if (
        roleName === 'administrador' ||
        roleName === 'recepcionista' ||
        roleName === 'Cliente' ||
        roleName === 'ADMINISTRADOR' ||
        roleName === 'RECEPCIONISTA' ||
        roleName === 'CLIENTE'
      ) {
        return true;
      }
      return false;
    })
  );
};
