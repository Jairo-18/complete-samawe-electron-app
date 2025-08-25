import { createInvoiceRelatedData } from './../../invoices/interface/invoice.interface';
import {
  CreateUserRelatedData,
  RegisterUserRelatedData
} from './../../auth/interfaces/register.interface';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { ApiResponseInterface } from '../interfaces/api-response.interface';
import { environment } from '../../../environments/environment';
import { CreateAccommodationRelatedData } from '../../service-and-product/interface/accommodation.interface';

@Injectable({
  providedIn: 'root'
})
export class RelatedDataService {
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private _invoiceRelatedData =
    signal<ApiResponseInterface<createInvoiceRelatedData> | null>(null);
  readonly invoiceRelatedData = this._invoiceRelatedData.asReadonly();

  registerUserRelatedData(): Observable<
    ApiResponseInterface<RegisterUserRelatedData>
  > {
    return this._httpClient.get<ApiResponseInterface<RegisterUserRelatedData>>(
      `${environment.apiUrl}user/register/related-data`
    );
  }

  createUserRelatedData(): Observable<
    ApiResponseInterface<CreateUserRelatedData>
  > {
    return this._httpClient.get<ApiResponseInterface<CreateUserRelatedData>>(
      `${environment.apiUrl}user/create/related-data`
    );
  }

  createAccommodationRelatedData(): Observable<
    ApiResponseInterface<CreateAccommodationRelatedData>
  > {
    return this._httpClient.get<
      ApiResponseInterface<CreateAccommodationRelatedData>
    >(`${environment.apiUrl}accommodation/create/related-data`);
  }

  createInvoiceRelatedData(
    forceRefresh: boolean = false
  ): Observable<ApiResponseInterface<createInvoiceRelatedData>> {
    // Si ya tenemos datos y no se fuerza refresco, devolvemos los datos existentes
    if (!forceRefresh && this._invoiceRelatedData()) {
      return of(this._invoiceRelatedData()!);
    }

    return this._httpClient
      .get<ApiResponseInterface<createInvoiceRelatedData>>(
        `${environment.apiUrl}invoices/create/related-data`
      )
      .pipe(
        tap((response) => {
          // Almacenamos la respuesta en la signal
          this._invoiceRelatedData.set(response);
        })
      );
  }

  // Método para limpiar la caché si es necesario
  clearInvoiceRelatedDataCache(): void {
    this._invoiceRelatedData.set(null);
  }
}
