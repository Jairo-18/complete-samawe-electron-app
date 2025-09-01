import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  ProductSummary,
  InvoiceBalance,
  TotalInventory,
  InvoiceSummaryGroupedResponse,
  DashboardStateSummary
} from '../interface/earning.interface';

@Injectable({
  providedIn: 'root'
})
export class EarningService {
  private readonly _httpClient: HttpClient = inject(HttpClient);

  getGeneragetProductSummary(): Observable<ProductSummary> {
    return this._httpClient.get<ProductSummary>(
      `${environment.apiUrl}balance/product-summary`
    );
  }

  getInvoiceBalance(): Observable<InvoiceBalance> {
    return this._httpClient.get<InvoiceBalance>(
      `${environment.apiUrl}balance/invoice-summary`
    );
  }

  getTotalInventory(): Observable<TotalInventory> {
    return this._httpClient.get<TotalInventory>(
      `${environment.apiUrl}balance/total-stock`
    );
  }

  getGroupedInvoices(): Observable<InvoiceSummaryGroupedResponse> {
    return this._httpClient.get<InvoiceSummaryGroupedResponse>(
      `${environment.apiUrl}balance/invoice-chart-list`
    );
  }

  getDashboardGeneralSummary(): Observable<DashboardStateSummary> {
    return this._httpClient.get<DashboardStateSummary>(
      `${environment.apiUrl}balance/general`
    );
  }

  // 🔹 Método corregido para descargar Excel de tipos de pago
  downloadPayReport(): void {
    this._httpClient
      .get(`${environment.apiUrl}reports/payment-types/excel`, {
        responseType: 'blob',
        observe: 'response'
      })
      .subscribe({
        next: (response) => {
          const blob = response.body;
          if (blob) {
            // Obtener el nombre del archivo del header Content-Disposition
            const contentDisposition = response.headers.get(
              'Content-Disposition'
            );
            let filename = 'payment-types-report.xlsx'; // nombre por defecto

            if (contentDisposition) {
              const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
                contentDisposition
              );
              if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
              }
            }

            // Crear el enlace de descarga
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();

            // Limpiar el URL creado
            window.URL.revokeObjectURL(url);
          }
        },
        error: (error) => {
          console.error('Error al descargar reporte de pagos:', error);
        }
      });
  }

  // 🔹 Método corregido para descargar Excel de detalles de ventas
  downloadDetailsReport(): void {
    this._httpClient
      .get(
        `${environment.apiUrl}reports/sales-by-category/with-details/excel`,
        {
          responseType: 'blob',
          observe: 'response'
        }
      )
      .subscribe({
        next: (response) => {
          const blob = response.body;
          if (blob) {
            // Obtener el nombre del archivo del header Content-Disposition
            const contentDisposition = response.headers.get(
              'Content-Disposition'
            );
            let filename = 'sales-by-category-with-details.xlsx'; // nombre por defecto

            if (contentDisposition) {
              const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
                contentDisposition
              );
              if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
              }
            }

            // Crear el enlace de descarga
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();

            // Limpiar el URL creado
            window.URL.revokeObjectURL(url);
          }
        },
        error: (error) => {
          console.error('Error al descargar reporte de detalles:', error);
        }
      });
  }

  // 🔹 Métodos alternativos que retornan Observable si los necesitas para otros casos
  getPayReportBlob(): Observable<Blob> {
    return this._httpClient.get(
      `${environment.apiUrl}reports/payment-types/excel`,
      { responseType: 'blob' }
    );
  }

  getDetailsReportBlob(): Observable<Blob> {
    return this._httpClient.get(
      `${environment.apiUrl}reports/sales-by-category/with-details/excel`,
      { responseType: 'blob' }
    );
  }
}
