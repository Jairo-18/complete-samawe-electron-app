// Importaciones necesarias desde Angular y recursos compartidos
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  ApiResponseCreateInterface,
  ApiResponseInterface
} from '../../shared/interfaces/api-response.interface';
import { Observable } from 'rxjs';
import {
  CreateInvoice,
  EditInvoice,
  InvoiceComplete
} from '../interface/invoice.interface';
import { HttpUtilitiesService } from '../../shared/utilities/http-utilities.service';
import { PaginationInterface } from '../../shared/interfaces/pagination.interface';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly _httpClient: HttpClient = inject(HttpClient);

  // Servicio utilitario para transformar objetos a parámetros HTTP
  private readonly _httpUtilities: HttpUtilitiesService =
    inject(HttpUtilitiesService);

  /**
   * Obtiene una lista paginada de facturas, filtrando por los parámetros dados.
   * @param query - Objeto con filtros (paginación, búsqueda, etc.)
   * @returns Observable con los datos paginados y la lista de facturas
   */
  getInvoiceWithPagination(query: object): Observable<{
    pagination: PaginationInterface;
    data: CreateInvoice[];
  }> {
    const params = this._httpUtilities.httpParamsFromObject(query);
    return this._httpClient.get<{
      pagination: PaginationInterface;
      data: CreateInvoice[];
    }>(`${environment.apiUrl}invoices/paginated-list`, { params });
  }

  /**
   * Obtiene la información completa de una factura específica, incluyendo detalles y relaciones.
   * @param invoiceId - ID de la factura
   * @returns Observable con la factura completa envuelta en una respuesta estándar
   */
  getInvoiceToEdit(
    invoiceId: number
  ): Observable<ApiResponseInterface<InvoiceComplete>> {
    return this._httpClient.get<ApiResponseInterface<InvoiceComplete>>(
      `${environment.apiUrl}invoices/${invoiceId}`
    );
  }

  /**
   * Actualiza parcialmente una factura.
   * @param invoiceId - ID de la factura a editar
   * @param body - Objeto con los campos que se quieren actualizar
   * @returns Observable vacío si fue exitoso
   */
  updateInvoice(
    invoiceId: number,
    body: Partial<EditInvoice>
  ): Observable<void> {
    return this._httpClient.patch<void>(
      `${environment.apiUrl}invoices/${invoiceId}`,
      body
    );
  }

  /**
   * Crea una nueva factura.
   * @param invoice - Objeto con los datos necesarios para crear la factura
   * @returns Observable con la respuesta del backend (ID, mensaje, etc.)
   */
  createInvoice(
    invoice: CreateInvoice
  ): Observable<ApiResponseCreateInterface> {
    return this._httpClient.post<ApiResponseCreateInterface>(
      `${environment.apiUrl}invoices`,
      invoice
    );
  }

  /**
   * Elimina una factura existente.
   * @param invoiceId - ID de la factura a eliminar
   * @returns Observable vacío si fue exitoso
   */
  deleteInvoice(invoiceId: number): Observable<unknown> {
    return this._httpClient.delete(
      `${environment.apiUrl}invoices/${invoiceId}`
    );
  }
}
