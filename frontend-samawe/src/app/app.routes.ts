import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './default-layout/pages/default-layout/default-layout.component';
import { organizationalRoutes } from './organizational/organizational.routes';
import { adminGuard } from './shared/guards/admin.guard';
import { authGuard } from './shared/guards/auth.guard';
import { invoicesRoutes } from './invoices/invoices.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./public/public.routes').then((m) => m.publicRoutes)
      },
      {
        path: 'auth',
        loadChildren: () =>
          import('./auth/auth.routes').then((m) => m.authRoutes)
      },
      {
        canActivate: [authGuard, adminGuard],
        path: 'organizational',
        children: organizationalRoutes
      },
      {
        canActivate: [authGuard, adminGuard],
        path: 'service-and-product',
        loadChildren: () =>
          import('./service-and-product/service-and-product.routes').then(
            (m) => m.serviceAndProductRoutes
          )
      },
      {
        canActivate: [authGuard, adminGuard],
        path: 'invoice',
        children: invoicesRoutes
      },
      {
        canActivate: [authGuard, adminGuard],
        path: 'sales',
        loadChildren: () =>
          import('./sales/sales.routes').then((m) => m.salesRoutes)
      },
      {
        path: 'auth/:userId/change-password',
        loadComponent: () =>
          import('./auth/pages/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent
          )
      }
    ]
  },

  {
    path: '**',
    redirectTo: '/home'
  }
];
