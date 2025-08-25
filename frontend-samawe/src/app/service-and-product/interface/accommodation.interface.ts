import {
  BedType,
  CategoryType,
  StateType
} from '../../shared/interfaces/relatedDataGeneral';

export interface CreateAccommodationPanel {
  accommodationId?: number;
  code: string;
  name: string;
  description?: string;
  amountPerson: number;
  jacuzzi: boolean;
  amountRoom: number;
  amountBathroom: number;
  priceBuy: number;
  priceSale: number;
  categoryTypeId: number;
  bedTypeId: number;
  stateTypeId?: number;
}

export interface AccommodationComplete {
  accommodationId: number;
  code: string;
  name: string;
  description?: string;
  amountPerson: number;
  jacuzzi: boolean;
  amountRoom: number;
  amountBathroom: number;
  priceBuy: number;
  priceSale: number;
  categoryType: CategoryType;
  bedType: BedType;
  stateType?: StateType;
  updatedAt: Date;
  createdAt: Date;
  deletedAt: Date;
}

export interface GetAccommodationPaginatedList {
  accommodationId?: number;
  code: string;
  name: string;
  description?: string;
  amountPerson: number;
  jacuzzi: boolean;
  amountRoom: number;
  amountBathroom: number;
  priceBuy: number;
  priceSale: number;
  categoryTypeId: number;
  bedTypeId: number;
  stateTypeId?: number;
  images: AccommodationImage[];
}

export interface CreateAccommodationRelatedData {
  categoryType: CategoryType[];
  bedType: BedType[];
  stateType: StateType[];
}

export interface AccommodationImage {
  accommodationImageId: number;
  imageUrl: string;
  publicId: string;
}
