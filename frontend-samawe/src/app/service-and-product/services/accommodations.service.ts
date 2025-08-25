import { inject, Injectable } from '@angular/core';
import {
  AccommodationComplete,
  CreateAccommodationPanel,
  GetAccommodationPaginatedList
} from '../interface/accommodation.interface';
import {
  ApiResponseCreateInterface,
  ApiResponseInterface
} from '../../shared/interfaces/api-response.interface';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpUtilitiesService } from '../../shared/utilities/http-utilities.service';
import { HttpClient } from '@angular/common/http';
import { PaginationInterface } from '../../shared/interfaces/pagination.interface';

@Injectable({
  providedIn: 'root'
})
export class AccommodationsService {
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private readonly _httpUtilities: HttpUtilitiesService =
    inject(HttpUtilitiesService);

  getAccommodationWithPagination(query: object): Observable<{
    pagination: PaginationInterface;
    data: GetAccommodationPaginatedList[];
  }> {
    const params = this._httpUtilities.httpParamsFromObject(query);
    return this._httpClient.get<{
      pagination: PaginationInterface;
      data: GetAccommodationPaginatedList[];
    }>(`${environment.apiUrl}accommodation/paginated-list`, { params });
  }

  getAccommodationEditPanel(
    accommodationId: number
  ): Observable<ApiResponseInterface<AccommodationComplete>> {
    return this._httpClient.get<ApiResponseInterface<AccommodationComplete>>(
      `${environment.apiUrl}accommodation/${accommodationId}`
    );
  }

  createAccommodationPanel(
    accommodation: CreateAccommodationPanel
  ): Observable<ApiResponseCreateInterface> {
    return this._httpClient.post<ApiResponseCreateInterface>(
      `${environment.apiUrl}accommodation/create`,
      accommodation
    );
  }

  updateAccommodationPanel(
    accommodationId: number,
    body: unknown
  ): Observable<void> {
    return this._httpClient.patch<void>(
      `${environment.apiUrl}accommodation/${accommodationId}`,
      body
    );
  }

  deleteAccommodationPanel(accommodationId: number): Observable<unknown> {
    return this._httpClient.delete(
      `${environment.apiUrl}accommodation/${accommodationId}`
    );
  }
}
