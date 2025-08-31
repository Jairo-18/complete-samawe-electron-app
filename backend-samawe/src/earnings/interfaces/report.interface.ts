export interface PaymentTypeReport {
  paymentType: string;
  dailyCount: number;
  weeklyCount: number;
  monthlyCount: number;
  dailyTotal: number;
  weeklyTotal: number;
  monthlyTotal: number;
}

export interface ReportSummary {
  reportDate: string;
  timezone: string;
  paymentTypes: PaymentTypeReport[];
  totals: {
    dailyInvoices: number;
    weeklyInvoices: number;
    monthlyInvoices: number;
    dailyAmount: number;
    weeklyAmount: number;
    monthlyAmount: number;
  };
}

export class CategoryReportDto {
  category: string;
  dailyCount: number;
  weeklyCount: number;
  monthlyCount: number;
  dailyTotal: number;
  weeklyTotal: number;
  monthlyTotal: number;
}
