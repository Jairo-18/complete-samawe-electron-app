export interface PaginatedNotification {
  notificationId: string;
  title: string;
  message: string;
  read: boolean;
  metadata: {
    invoiceId?: number;
    productId?: number;
    threshold?: number;
    productName?: string;
    currentStock?: number;
    [key: string]: any; // por si en el futuro se añaden otros campos
  };
  type: 'LOW_PRODUCT' | string; // puedes ampliar esto si hay más tipos
  createdAt: string; // o `Date` si lo parseas luego
}
