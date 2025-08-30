export interface InvoicePeriodTotals {
  daily?: number;
  weekly?: number;
  monthly?: number;
  yearly: number;
  totalAllTime?: number;
}

export interface BalancePeriod {
  totalInvoiceSale?: string;
  totalInvoiceBuy?: string;
  balanceInvoice?: string;
  periodDate?: string; // formato: YYYY-MM-DD
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface InvoiceBalance {
  daily?: BalancePeriod;
  weekly?: BalancePeriod;
  monthly?: BalancePeriod;
  yearly?: BalancePeriod;
}

export interface TotalInventory {
  totalStock: number;
}

export interface ProductSummary {
  totalProductPriceSale?: number;
  totalProductPriceBuy?: number;
  balanceProduct?: number;
}

export interface InvoiceSummaryItem {
  code?: string;
  total?: number;
  type?: string;
  createdAt?: string;
}

export interface InvoiceSummaryGroupedResponse {
  daily?: InvoiceSummaryItem[];
  weekly?: InvoiceSummaryItem[];
  monthly?: InvoiceSummaryItem[];
  yearly?: InvoiceSummaryItem[];
}

export interface DashboardStateSummary {
  products?: {
    isActive: boolean;
    count: string;
  }[];

  accommodations?: {
    state:
      | 'Disponible'
      | 'Ocupado'
      | 'Mantenimiento'
      | 'Fuera de Servicio'
      | 'DISPONIBLE'
      | 'OCUPADO'
      | 'MANTENIMIENTO'
      | 'FUERA DE SERVICIO'
      | string;
    count: string;
  }[];

  excursions?: {
    state:
      | 'Disponible'
      | 'Ocupado'
      | 'Mantenimiento'
      | 'Fuera de Servicio'
      | 'DISPONIBLE'
      | 'OCUPADO'
      | 'MANTENIMIENTO'
      | 'FUERA DE SERVICIO'
      | string;
    count: string;
  }[];

  reservedAccommodations?: {
    accommodationId: number;
    invoiceId: number;
  }[];
}
