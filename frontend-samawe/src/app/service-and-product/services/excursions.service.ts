import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {
  CreateExcursionPanel,
  ExcursionComplete,
  ExcursionListResponse
} from '../interface/excursion.interface';
import {
  ApiResponseCreateInterface,
  ApiResponseInterface
} from '../../shared/interfaces/api-response.interface';
import { HttpUtilitiesService } from '../../shared/utilities/http-utilities.service';
import { PaginationInterface } from '../../shared/interfaces/pagination.interface';

@Injectable({
  providedIn: 'root'
})
export class ExcursionsService {
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private readonly _httpUtilities: HttpUtilitiesService =
    inject(HttpUtilitiesService);

  getExcursionWithPagination(query: object): Observable<{
    pagination: PaginationInterface;
    data: CreateExcursionPanel[];
  }> {
    const params = this._httpUtilities.httpParamsFromObject(query);
    return this._httpClient.get<{
      pagination: PaginationInterface;
      data: CreateExcursionPanel[];
    }>(`${environment.apiUrl}excursion/paginated-list`, { params });
  }

  getAllExcursions(): Observable<{ data: ExcursionListResponse }> {
    return this._httpClient.get<{ data: ExcursionListResponse }>(
      `${environment.apiUrl}excursion`
    );
  }

  getExcursionEditPanel(
    excursionId: number
  ): Observable<ApiResponseInterface<ExcursionComplete>> {
    return this._httpClient.get<ApiResponseInterface<ExcursionComplete>>(
      `${environment.apiUrl}excursion/${excursionId}`
    );
  }

  createExcursionPanel(
    excursion: CreateExcursionPanel
  ): Observable<ApiResponseCreateInterface> {
    return this._httpClient.post<ApiResponseCreateInterface>(
      `${environment.apiUrl}excursion/create`,
      excursion
    );
  }

  updateExcursionPanel(excursionId: number, body: unknown): Observable<void> {
    return this._httpClient.patch<void>(
      `${environment.apiUrl}excursion/${excursionId}`,
      body
    );
  }

  deleteExcursionPanel(excursionId: number): Observable<unknown> {
    return this._httpClient.delete(
      `${environment.apiUrl}excursion/${excursionId}`
    );
  }
}
