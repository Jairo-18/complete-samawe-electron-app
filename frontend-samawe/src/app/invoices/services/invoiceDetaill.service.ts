// Importaciones necesarias desde Angular y otras partes de la app
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponseCreateInterface } from '../../shared/interfaces/api-response.interface';
import { CreateInvoiceDetaill } from '../interface/invoiceDetaill.interface';

// Servicio injectable en el root del proyecto (singleton)
@Injectable({ providedIn: 'root' })
export class InvoiceDetaillService {
  // Inyección del cliente HTTP para hacer peticiones al backend
  private readonly _httpClient: HttpClient = inject(HttpClient);

  /**
   * Crea un nuevo detalle de factura asociado a una factura específica.
   *
   * @param invoiceId - ID de la factura a la que se le añadirá el detalle.
   * @param invoiceDetaill - Objeto con los datos del detalle a crear.
   * @returns Observable con la respuesta del backend que implementa `ApiResponseCreateInterface`.
   */
  createInvoiceDetaill(
    invoiceId: number,
    invoiceDetaill: CreateInvoiceDetaill
  ): Observable<ApiResponseCreateInterface> {
    return this._httpClient.post<ApiResponseCreateInterface>(
      `${environment.apiUrl}invoices/invoice/${invoiceId}/details/bulk`,
      invoiceDetaill
    );
  }

  /**
   * Crea un nuevo detalle de factura asociado a una factura específica.
   *
   * @param invoiceId - ID de la factura a la que se le añadirá el detalle.
   * @param invoiceDetaill - Objeto con los datos del detalle a crear.
   * @returns Observable con la respuesta del backend que implementa `ApiResponseCreateInterface`.
   */
  createInvoiceDetaillMultiple(
    invoiceId: number,
    invoiceDetails: CreateInvoiceDetaill[]
  ): Observable<ApiResponseCreateInterface> {
    return this._httpClient.post<ApiResponseCreateInterface>(
      `${environment.apiUrl}invoices/invoice/${invoiceId}/details/bulk`,
      { details: invoiceDetails } // 👈 importante: envolver en un objeto
    );
  }

  /**
   * Elimina un detalle específico de una factura.
   *
   * @param invoiceDetailId - ID del detalle de la factura que se desea eliminar.
   * @returns Observable con la respuesta del servidor (vacía).
   */
  deleteItemInvoice(invoiceDetailId: number): Observable<unknown> {
    return this._httpClient.delete(
      `${environment.apiUrl}invoices/details/${invoiceDetailId}` // URL de DELETE
    );
  }
}
