import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { AccommodationComponent } from './pages/accommodation/accommodation.component';
import { ExcursionComponent } from './pages/excursion/excursion.component';

export const publicRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'accommodation',
        component: AccommodationComponent
      },
      {
        path: 'excursion',
        component: ExcursionComponent
      },
      {
        path: 'about-us',
        component: AboutUsComponent
      }
    ]
  }
];
