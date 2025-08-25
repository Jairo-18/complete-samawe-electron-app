import { Routes } from '@angular/router';

export const serviceAndProductRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'general',
        loadComponent: () =>
          import('./pages/general/general.component').then(
            (m) => m.GeneralComponent
          )
      }
    ]
  }
];
