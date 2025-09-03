import {
  IdentificationTypeDto,
  InvoiceTypeDto,
  PaidTypeDto,
  PayTypeDto,
  PhoneCodeDto,
} from './../../shared/dtos/types.dto';
import { BaseResponseDto } from './../../shared/dtos/response.dto';
import { OnlyOneDefined } from '../../shared/validators/onlyOneDefined';
import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  ValidateNested,
  IsArray,
  IsUUID,
  IsBoolean,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInvoiceDetailDto } from './invoiceDetaill.dto';

export class CreateInvoiceDto {
  // @ApiProperty({ example: 1, description: 'ID de la factura', required: false })
  // @IsNumber()
  // @IsOptional()
  // invoiceId: number;

  @ApiProperty({
    example: 1,
    description: 'Tipo de factura (relación con invoiceType)',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'El tipo es requerido' })
  invoiceTypeId: number;

  @ApiProperty({
    example: 'Excursión a la montaña con guía y refrigerios',
    description: 'Descripción de la excursión',
    required: false,
  })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty({
    example: 'eae05031-a181-4175-b09c-90177ef87f9b',
    description: 'ID del cliente (User) al que va dirigida la factura',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'El cliente (userId) es requerido' })
  userId: string;

  @ApiProperty({
    example: false,
    description: 'False y True',
  })
  @IsBoolean()
  @IsOptional()
  invoiceElectronic?: boolean;

  @ApiProperty({ example: '2025-05-27', description: 'Fecha de inicio' })
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe tener formato YYYY-MM-DD' },
  )
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  startDate: string;

  @ApiProperty({ example: '2025-05-30', description: 'Fecha de fin' })
  @IsDateString(
    {},
    { message: 'La fecha de fin debe tener formato YYYY-MM-DD' },
  )
  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  endDate: string;

  @ApiProperty({
    example: 1,
    description: 'ID del tipo de pago (PayType)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  payTypeId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID del estado de pago (PaidType)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  paidTypeId?: number;

  @ApiProperty({
    example: 0,
    description: 'Monto transferido',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  transfer?: number;

  @ApiProperty({
    example: 0,
    description: 'Monto en efectivo',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  cash?: number;

  @ApiProperty()
  details?: CreateInvoiceDetailDto[];
}

@OnlyOneDefined(['productId', 'accommodationId', 'excursionId'], {
  message:
    'Debes especificar exactamente uno entre productId, accommodationId o excursionId',
})
export class CreateInvoiceWithDetailsDto extends CreateInvoiceDto {
  @ApiProperty({
    description: 'Lista de detalles que componen la factura',
    type: [CreateInvoiceDetailDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceDetailDto)
  details: CreateInvoiceDetailDto[];
}

export class UpdateInvoiceDto {
  @ApiProperty({
    description: 'ID de la factura a actualizar',
    example: 101,
  })
  @IsNumber()
  @IsNotEmpty()
  invoiceId: number;

  @ApiProperty({
    example: 'Excursión a la montaña con guía y refrigerios',
    description: 'Descripción de la excursión',
    required: false,
  })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty({
    example: 1,
    description: 'ID del tipo de pago (PayType)',
  })
  @IsNumber()
  @IsOptional()
  payTypeId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID del estado de pago (PaidType)',
  })
  @IsNumber()
  @IsOptional()
  paidTypeId?: number;

  @ApiProperty({
    example: 0,
    description: 'Monto transferido',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  transfer?: number;

  @ApiProperty({
    example: 0,
    description: 'Monto en efectivo',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  cash?: number;

  @ApiProperty({
    example: true,
    description: 'Factura electrónica',
  })
  @IsBoolean()
  @IsOptional()
  invoiceElectronic?: boolean;
}

export class EmployeMiniDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  identificationNumber: string;
}

export class UserMiniDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  identificationNumber: string;

  @ApiProperty({ type: () => IdentificationTypeDto })
  identificationType: IdentificationTypeDto;

  @ApiProperty({ type: () => PhoneCodeDto })
  phoneCode: PhoneCodeDto;
}

export class ProductMiniDto {
  @ApiProperty()
  productId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;
}

export class AccommodationMiniDto {
  @ApiProperty()
  accommodationId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;
}

export class ExcursionMiniDto {
  @ApiProperty()
  excursionId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;
}

export class InvoiceDetailDto {
  @ApiProperty()
  invoiceDetailId: number;

  @ApiProperty({ required: false })
  amount?: number;

  @ApiProperty()
  priceWithoutTax: string;

  @ApiProperty()
  priceWithTax: string;

  @ApiProperty()
  subtotal: string;

  @ApiProperty()
  taxe?: string;

  @ApiProperty({ required: false })
  startDate?: Date;

  @ApiProperty({ required: false })
  endDate?: Date;

  @ApiProperty({ type: () => ProductMiniDto, required: false })
  product?: ProductMiniDto;

  @ApiProperty({ type: () => AccommodationMiniDto, required: false })
  accommodation?: AccommodationMiniDto;

  @ApiProperty({ type: () => ExcursionMiniDto, required: false })
  excursion?: ExcursionMiniDto;
}

export class GetInvoiceWithDetailsDto {
  @ApiProperty()
  invoiceId: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  observations: string;

  @ApiProperty()
  invoiceElectronic: boolean;

  @ApiProperty()
  subtotalWithoutTax: string;

  @ApiProperty()
  subtotalWithTax: string;

  @ApiProperty()
  total: string;

  @ApiProperty()
  totalTaxes: number;

  @ApiProperty({ example: 0 })
  transfer: number;

  @ApiProperty({ example: 0 })
  cash: number;

  @ApiProperty({ type: () => InvoiceTypeDto })
  invoiceType: InvoiceTypeDto;

  @ApiProperty({ type: () => PayTypeDto })
  payType: PayTypeDto;

  @ApiProperty({ type: () => PaidTypeDto })
  paidType: PaidTypeDto;

  @ApiProperty({ type: () => UserMiniDto })
  user: UserMiniDto;

  @ApiProperty({ type: () => EmployeMiniDto })
  employee: EmployeMiniDto;

  @ApiProperty({ type: () => [InvoiceDetailDto] })
  invoiceDetails: InvoiceDetailDto[];
}

export class GetInvoiceWithDetailsResponseDto implements BaseResponseDto {
  @ApiProperty({
    example: HttpStatus.OK,
  })
  statusCode: number;

  @ApiProperty({
    type: () => GetInvoiceWithDetailsDto,
  })
  data: GetInvoiceWithDetailsDto;
}
