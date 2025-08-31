export class PaymentTypeReportDto {
  paymentType: string;
  dailyCount: number;
  weeklyCount: number;
  monthlyCount: number;
  dailyTotal: number;
  weeklyTotal: number;
  monthlyTotal: number;
}

export class ReportTotalsDto {
  dailyInvoices: number;
  weeklyInvoices: number;
  monthlyInvoices: number;
  dailyAmount: number;
  weeklyAmount: number;
  monthlyAmount: number;
}

export class ReportSummaryDto {
  reportDate: string;
  timezone: string;
  paymentTypes: PaymentTypeReportDto[];
  totals: ReportTotalsDto;
}

export class MostUsedPaymentTypeDto {
  paymentType: string;
  count: number;
  total: number;
  percentage: number;
}
