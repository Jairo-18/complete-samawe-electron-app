export interface CreateType {
  code: string;
  name: string;
}

export interface TypeForEditResponse<T extends CreateType> {
  type: T;
}

export interface CategoryType {
  categoryTypeId: number;
  code?: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface StateType {
  stateTypeId: number;
  code?: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface BedType {
  bedTypeId: number;
  code?: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface RoleType {
  roleTypeId: string;
  code?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface PhoneCode {
  phoneCodeId: string;
  code?: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface IdentificationType {
  identificationTypeId: string;
  code?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface IdentificationType {
  identificationTypeId: string;
  code?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface TaxeType {
  taxeTypeId: string;
  code?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface PayType {
  payTypeId: string;
  code?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface PaidType {
  paidTypeId: string;
  code?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface InvoiceType {
  invoiceTypeId: string;
  code?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface AllTypes {
  additionalType: TypeItem[];
  bedType: TypeItem[];
  categoryType: TypeItem[];
  identificationType: TypeItem[];
  paidType: TypeItem[];
  invoiceType: TypeItem[];
  payType: TypeItem[];
  phoneCode: TypeItem[];
  roleType: TypeItem[];
  stateType: TypeItem[];
  taxeType: TypeItem[];
}

export interface TypeItem {
  id: string;
  code: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
