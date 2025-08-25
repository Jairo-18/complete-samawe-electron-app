import { UserComplete } from '../../organizational/interfaces/create.interface';
import {
  CategoryType,
  IdentificationType,
  InvoiceType,
  PaidType,
  PayType,
  TaxeType
} from './../../shared/interfaces/relatedDataGeneral';
import { InvoiceDetail } from './invoiceDetaill.interface';

export interface createInvoiceRelatedData {
  categoryType: CategoryType[];
  identificationType: IdentificationType[];
  invoiceType: InvoiceType[];
  taxeType: TaxeType[];
  payType: PayType[];
  paidType: PaidType[];
}

export interface Invoice {
  invoiceId: number;
  code: string;
  subtotalWithoutTax: string;
  subtotalWithTax: string;
  total: string;
  startDate: string;
  endDate: string;
  user: UserComplete;
  employee: UserComplete;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  invoiceType: InvoiceType;
  payType: PayType;
  paidType: PaidType;
  invoiceDetails: InvoiceDetail[];
}

export interface CreateInvoice {
  invoiceTypeId: number;
  userId: string;
  payTypeId: number;
  paidTypeId: number;
  invoiceElectronic: boolean;
  startDate: string;
  endDate: string;
}

export interface EditInvoice {
  invoiceId: number;
  payTypeId: number;
  paidTypeId: number;
  invoiceElectronic: boolean;
}

export interface InvoiceComplete {
  invoiceId: number;
  code: string;
  subtotalWithoutTax: string;
  subtotalWithTax: string;
  total: string;
  startDate: string;
  endDate: string;
  user: UserComplete;
  employee: UserComplete;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  invoiceType: InvoiceType;
  payType: PayType;
  paidType: PaidType;
  invoiceDetails: InvoiceDetail[];
  invoiceElectronic: boolean;
}

export interface DialogData {
  editMode: boolean;
  invoiceId?: number;
  relatedData: {
    invoiceType: InvoiceType[];
    paidType: PaidType[];
    payType: PayType[];
  };
}
