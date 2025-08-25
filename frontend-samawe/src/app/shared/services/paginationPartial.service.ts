import { inject, Injectable } from '@angular/core';
import { HttpUtilitiesService } from '../utilities/http-utilities.service';
import { Observable } from 'rxjs';
import { PaginationInterface } from '../interfaces/pagination.interface';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  GeneralPartial,
  PaginatedUserPartial
} from '../interfaces/paginatedPartial.interface';

@Injectable({
  providedIn: 'root'
})
export class PaginationPartialService {
  private readonly _httpUtilities: HttpUtilitiesService =
    inject(HttpUtilitiesService);
  private readonly _httpClient: HttpClient = inject(HttpClient);

  getUserPartial(query: object): Observable<{
    pagination: PaginationInterface;
    data: PaginatedUserPartial[];
  }> {
    const params = this._httpUtilities.httpParamsFromObject(query);
    return this._httpClient.get<{
      pagination: PaginationInterface;
      data: PaginatedUserPartial[];
    }>(`${environment.apiUrl}user/paginated-list`, { params });
  }

  getProductPartial(query: object): Observable<{
    pagination: PaginationInterface;
    data: GeneralPartial[];
  }> {
    const params = this._httpUtilities.httpParamsFromObject(query);
    return this._httpClient.get<{
      pagination: PaginationInterface;
      data: GeneralPartial[];
    }>(`${environment.apiUrl}user/paginated-partial`, { params });
  }

  getAccommodationPartial(query: object): Observable<{
    pagination: PaginationInterface;
    data: GeneralPartial[];
  }> {
    const params = this._httpUtilities.httpParamsFromObject(query);
    return this._httpClient.get<{
      pagination: PaginationInterface;
      data: GeneralPartial[];
    }>(`${environment.apiUrl}accommodation/paginated-partial`, { params });
  }

  getExcursionPartial(query: object): Observable<{
    pagination: PaginationInterface;
    data: GeneralPartial[];
  }> {
    const params = this._httpUtilities.httpParamsFromObject(query);
    return this._httpClient.get<{
      pagination: PaginationInterface;
      data: GeneralPartial[];
    }>(`${environment.apiUrl}excursion/paginated-partial`, { params });
  }
}
