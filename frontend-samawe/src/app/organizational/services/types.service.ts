import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { HttpUtilitiesService } from '../../shared/utilities/http-utilities.service';
import {
  PaginationInterface,
  ParamsPaginationInterface
} from '../../shared/interfaces/pagination.interface';
import {
  AdditionalType,
  CreateType,
  DiscountType,
  TypeForEditResponse,
  TypeItem
} from '../../shared/interfaces/relatedDataGeneral';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {
  ApiResponseCreateInterface,
  ApiResponseInterface
} from '../../shared/interfaces/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class TypesService {
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private readonly _httpUtilities: HttpUtilitiesService =
    inject(HttpUtilitiesService);

  getEntitiesWithPagination(
    type: string,
    query: ParamsPaginationInterface
  ): Observable<{ pagination: PaginationInterface; data: TypeItem[] }> {
    const params = this._httpUtilities.httpParamsFromObject(query);
    return this._httpClient.get<{
      pagination: PaginationInterface;
      data: TypeItem[];
    }>(`${environment.apiUrl}type/paginated/${type}`, { params });
  }

  createType(
    type: string,
    data: CreateType
  ): Observable<ApiResponseCreateInterface> {
    return this._httpClient.post<ApiResponseCreateInterface>(
      `${environment.apiUrl}type/create/${type}`,
      data
    );
  }

  getTypeForEdit<T extends CreateType>(
    type: string,
    id: string
  ): Observable<ApiResponseInterface<TypeForEditResponse<T>>> {
    return this._httpClient.get<ApiResponseInterface<TypeForEditResponse<T>>>(
      `${environment.apiUrl}type/${type}/${id}`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateType(type: string, id: string, body: any): Observable<any> {
    return this._httpClient.patch(
      `${environment.apiUrl}type/${type}/${id}`,
      body
    );
  }

  deleteType(type: string, id: string): Observable<unknown> {
    return this._httpClient.delete(`${environment.apiUrl}type/${type}/${id}`);
  }

  /**
   * Obtiene todos los DiscountType (sin paginación)
   */
  getAllDiscountTypes(): Observable<ApiResponseInterface<DiscountType[]>> {
    return this._httpClient.get<ApiResponseInterface<DiscountType[]>>(
      `${environment.apiUrl}type/discountType/all`
    );
  }

  /**
   * Obtiene todos los AdditionalType (sin paginación)
   */
  getAllAdditionalTypes(): Observable<ApiResponseInterface<AdditionalType[]>> {
    return this._httpClient.get<ApiResponseInterface<AdditionalType[]>>(
      `${environment.apiUrl}type/additionalType/all`
    );
  }
}
