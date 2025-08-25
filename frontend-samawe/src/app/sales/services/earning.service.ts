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
}
