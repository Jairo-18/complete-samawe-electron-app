import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApiResponseCreateInterface,
  ApiResponseInterface
} from '../../shared/interfaces/api-response.interface';
import { HttpUtilitiesService } from '../../shared/utilities/http-utilities.service';
import {
  CreateProductPanel,
  ProductComplete,
  ProductListResponse
} from '../interface/product.interface';
import { PaginationInterface } from '../../shared/interfaces/pagination.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private readonly _httpUtilities: HttpUtilitiesService =
    inject(HttpUtilitiesService);

  getProductWithPagination(query: object): Observable<{
    pagination: PaginationInterface;
    data: CreateProductPanel[];
  }> {
    const params = this._httpUtilities.httpParamsFromObject(query);
    return this._httpClient.get<{
      pagination: PaginationInterface;
      data: CreateProductPanel[];
    }>(`${environment.apiUrl}product/paginated-list`, { params });
  }

  getAllProducts(): Observable<{ data: ProductListResponse }> {
    return this._httpClient.get<{ data: ProductListResponse }>(
      `${environment.apiUrl}product`
    );
  }

  getProductEditPanel(
    productId: number
  ): Observable<ApiResponseInterface<ProductComplete>> {
    return this._httpClient.get<ApiResponseInterface<ProductComplete>>(
      `${environment.apiUrl}product/${productId}`
    );
  }

  createProductPanel(
    product: CreateProductPanel
  ): Observable<ApiResponseCreateInterface> {
    return this._httpClient.post<ApiResponseCreateInterface>(
      `${environment.apiUrl}product/create`,
      product
    );
  }

  updateProductPanel(productId: number, body: unknown): Observable<void> {
    return this._httpClient.patch<void>(
      `${environment.apiUrl}product/${productId}`,
      body
    );
  }

  deleteProductPanel(productId: number): Observable<unknown> {
    return this._httpClient.delete(`${environment.apiUrl}product/${productId}`);
  }
}
