import { Routes } from '@angular/router';
import { SeeInvoicesComponent } from './pages/see-invoices/see-invoices.component';
import { EditInvoiceComponent } from './pages/edit-invoice/edit-invoice.component';

export const invoicesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
      },
      {
        path: 'invoices',
        children: [
          {
            path: ':id/edit',
            component: EditInvoiceComponent
          },
          {
            path: 'list',
            component: SeeInvoicesComponent
          }
        ]
      }
    ]
  }
];
