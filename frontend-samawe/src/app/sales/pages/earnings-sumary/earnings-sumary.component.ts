import { Component, OnInit, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { EarningService } from '../../services/earning.service';
import {
  ProductSummary,
  InvoiceBalance,
  TotalInventory,
  InvoiceSummaryGroupedResponse,
  DashboardStateSummary
} from '../../interface/earning.interface';
import { NgChartsModule } from 'ng2-charts';
import { FormatCopPipe } from '../../../shared/pipes/format-cop.pipe';
import { BasePageComponent } from '../../../shared/components/base-page/base-page.component';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { GrapicComponent } from '../../components/grapic/grapic.component';

@Component({
  selector: 'app-earnings-sumary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NgChartsModule,
    FormatCopPipe,
    BasePageComponent,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    LoaderComponent,
    GrapicComponent
  ],
  templateUrl: './earnings-sumary.component.html',
  styleUrl: './earnings-sumary.component.scss'
})
export class EarningsSumaryComponent implements OnInit {
  private readonly _earningService: EarningService = inject(EarningService);

  productSummary?: ProductSummary;
  inventoryTotal?: TotalInventory;
  invoiceBalance?: InvoiceBalance;
  invoiceSummaryGroup?: InvoiceSummaryGroupedResponse;
  dashboardSummary?: DashboardStateSummary;
  isLoading: boolean = true;

  selectedPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily';

  readonly periods = [
    { label: 'Diario', value: 'daily' },
    { label: 'Semanal', value: 'weekly' },
    { label: 'Mensual', value: 'monthly' },
    { label: 'Anual', value: 'yearly' }
  ] as const;

  ngOnInit(): void {
    this.loadStaticData();
    this.loadGroupedInvoices(this.selectedPeriod);
  }

  get activeProductsCount(): number {
    return Number(
      this.dashboardSummary?.products?.find((p) => p.isActive)?.count ?? 0
    );
  }

  get inactiveProductsCount(): number {
    return Number(
      this.dashboardSummary?.products?.find((p) => !p.isActive)?.count ?? 0
    );
  }

  get availableAccommodationsCount(): number {
    return Number(
      this.dashboardSummary?.accommodations?.find(
        (a) => a.state === 'Disponible' || a.state === 'DISPONIBLE'
      )?.count ?? 0
    );
  }

  get maintenanceAccommodationsCount(): number {
    return Number(
      this.dashboardSummary?.accommodations?.find(
        (a) => a.state === 'Mantenimiento' || a.state === 'MANTENIMIENTO'
      )?.count ?? 0
    );
  }

  get occupiedAccommodationsCount(): number {
    return Number(
      this.dashboardSummary?.accommodations?.find(
        (a) => a.state === 'Ocupado' || a.state === 'OCUPADO'
      )?.count ?? 0
    );
  }

  get noServiceAccommodationsCount(): number {
    return Number(
      this.dashboardSummary?.accommodations?.find(
        (a) =>
          a.state === 'Fuera de Servicio' || a.state === 'FUERA DE SERVICIO'
      )?.count ?? 0
    );
  }

  get reservedAccommodationsCount(): number {
    return this.dashboardSummary?.reservedAccommodations?.length ?? 0;
  }

  getSelectedPeriodLabel(): string {
    const labels: Record<string, string> = {
      daily: 'Diario',
      weekly: 'Semanal',
      monthly: 'Mensual',
      yearly: 'Anual'
    };
    return labels[this.selectedPeriod] || this.selectedPeriod;
  }

  onPeriodChange(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): void {
    if (this.selectedPeriod === period) return;
    this.selectedPeriod = period;
    this.loadGroupedInvoices(period);
  }

  private loadStaticData(): void {
    this.isLoading = true;

    forkJoin({
      productSummary: this._earningService.getGeneragetProductSummary(),
      invoiceBalance: this._earningService.getInvoiceBalance(),
      inventoryTotal: this._earningService.getTotalInventory(),
      dashboardSummary: this._earningService.getDashboardGeneralSummary()
    }).subscribe({
      next: (res) => {
        const {
          productSummary,
          invoiceBalance,
          inventoryTotal,
          dashboardSummary
        } = res;

        if (
          !productSummary ||
          !invoiceBalance ||
          !inventoryTotal ||
          !dashboardSummary
        ) {
          this.isLoading = false;
          return;
        }

        this.productSummary = productSummary;
        this.invoiceBalance = invoiceBalance;
        this.inventoryTotal = inventoryTotal;
        this.dashboardSummary = dashboardSummary;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private loadGroupedInvoices(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  ): void {
    this._earningService.getGroupedInvoices().subscribe({
      next: (grouped) => {
        this.invoiceSummaryGroup = grouped;
      },
      error: (err) =>
        console.error('Error al cargar resumen de facturas agrupadas:', err)
    });
  }
}
