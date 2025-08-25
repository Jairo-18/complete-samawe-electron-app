import { Routes } from '@angular/router';

export const salesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'earnings-sumary',
        loadComponent: () =>
          import('./pages/earnings-sumary/earnings-sumary.component').then(
            (m) => m.EarningsSumaryComponent
          )
      }
    ]
  }
];
