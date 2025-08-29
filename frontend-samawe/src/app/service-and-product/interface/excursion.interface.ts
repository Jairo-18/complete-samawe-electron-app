import {
  CategoryType,
  StateType
} from '../../shared/interfaces/relatedDataGeneral';

export interface CreateExcursionPanel {
  excursionId?: number;
  code: string;
  name: string;
  description?: string;
  priceBuy: number;
  taxe?: number;
  priceSale: number;
  stateTypeId: number;
  categoryTypeId: number;
}

export interface ExcursionComplete {
  excursionId: number;
  code: string;
  name: string;
  description?: string;
  priceBuy: number;
  priceSale: number;
  taxe?: number;
  stateType: StateType;
  categoryType: CategoryType;
  updatedAt: Date;
  createdAt: Date;
  deletedAt: Date;
}
