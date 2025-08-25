import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { InvoiceSummaryGroupedResponse } from '../../interface/earning.interface';
import { formatDate } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-grapic',
  standalone: true,
  imports: [NgChartsModule],
  templateUrl: './grapic.component.html',
  styleUrl: './grapic.component.scss'
})
export class GrapicComponent implements OnChanges {
  @Input() invoiceSummaryGroup?: InvoiceSummaryGroupedResponse;
  @Input() selectedPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily';

  chartData?: ChartConfiguration<'bar'>['data'];

  chartType: 'bar' = 'bar';
  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: {
      x: {},
      y: {
        beginAtZero: true
      }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoiceSummaryGroup'] || changes['selectedPeriod']) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    if (this.invoiceSummaryGroup?.[this.selectedPeriod]) {
      this.chartData = this.buildChartData(
        this.invoiceSummaryGroup,
        this.selectedPeriod
      );
    }
  }

  private formatFullDate(date: string | undefined): string {
    if (!date) return '';
    return formatDate(date, 'dd/MM hh:mm a', 'es-CO');
  }

  private buildChartData(
    data: InvoiceSummaryGroupedResponse,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  ): ChartConfiguration<'bar'>['data'] {
    const grouped = data[period];
    if (!grouped) return { labels: [], datasets: [] };

    const labels: string[] = [];
    const saleData: number[] = [];
    const buyData: number[] = [];

    grouped.forEach((item) => {
      const label = `${item.code ?? 'N/A'} - ${this.formatFullDate(
        item.createdAt
      )}`;

      labels.push(label);

      const total = item.total ?? 0;

      if (item.type === 'FV') {
        saleData.push(total);
        buyData.push(0);
      } else if (item.type === 'FC') {
        saleData.push(0);
        buyData.push(total);
      } else {
        saleData.push(0);
        buyData.push(0);
      }
    });

    return {
      labels,
      datasets: [
        {
          label: 'Ventas',
          data: saleData,
          backgroundColor: '#06a606'
        },
        {
          label: 'Compras',
          data: buyData,
          backgroundColor: '#fe0000'
        }
      ]
    };
  }
}
