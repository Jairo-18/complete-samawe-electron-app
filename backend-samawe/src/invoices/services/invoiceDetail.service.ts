import { DiscountType } from './../../shared/entities/discountType.entity';
import { AdditionalType } from './../../shared/entities/additionalType.entity';
import { StateTypeRepository } from './../../shared/repositories/stateType.repository';
import { CategoryType } from './../../shared/entities/categoryType.entity';
import { IdentificationType } from './../../shared/entities/identificationType.entity';
import { PaidType } from './../../shared/entities/paidType.entity';
import { PayType } from './../../shared/entities/payType.entity';
import { TaxeType } from './../../shared/entities/taxeType.entity';
import { InvoiceType } from './../../shared/entities/invoiceType.entity';
import { RepositoryService } from './../../shared/services/repositoriry.service';
import { ExcursionRepository } from './../../shared/repositories/excursion.repository';
import { AccommodationRepository } from './../../shared/repositories/accommodation.repository';
import { ProductRepository } from './../../shared/repositories/product.repository';
import { TaxeTypeRepository } from './../../shared/repositories/taxeType.repository';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InvoiceRepository } from './../../shared/repositories/invoice.repository';
import { InvoiceDetaillRepository } from './../../shared/repositories/invoiceDetaill.repository';

import {
  CreateInvoiceDetailDto,
  CreateRelatedDataInvoiceDto,
} from '../dtos/invoiceDetaill.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GeneralInvoiceDetaillService } from 'src/shared/services/generalInvoiceDetaill.service';
import { In } from 'typeorm';

@Injectable()
export class InvoiceDetailService {
  constructor(
    private readonly _invoiceDetaillRepository: InvoiceDetaillRepository,
    private readonly _invoiceRepository: InvoiceRepository,
    private readonly _productRepository: ProductRepository,
    private readonly _accommodationRepository: AccommodationRepository,
    private readonly _excursionRepository: ExcursionRepository,
    private readonly _taxeTypeRepository: TaxeTypeRepository,
    private readonly _repositoriesService: RepositoryService,
    private readonly _stateTypeRepository: StateTypeRepository,
    private readonly _eventEmitter: EventEmitter2,
    private readonly _generalInvoiceDetaillService: GeneralInvoiceDetaillService,
  ) {}

  async getRelatedDataToCreate(): Promise<CreateRelatedDataInvoiceDto> {
    const {
      invoiceType,
      taxeType,
      payType,
      paidType,
      categoryType,
      identificationType,
      additionalType,
      discountType,
    } = this._repositoriesService.repositories;

    const [
      invoiceTypes,
      taxeTypes,
      payTypes,
      paidTypes,
      categoryTypes,
      identificationTypes,
      additionalTypes,
      discountTypes,
    ] = await Promise.all([
      this._repositoriesService.getEntities<InvoiceType>(invoiceType),
      this._repositoriesService.getEntities<TaxeType>(taxeType),
      this._repositoriesService.getEntities<PayType>(payType),
      this._repositoriesService.getEntities<PaidType>(paidType),
      this._repositoriesService.getEntities<CategoryType>(categoryType),
      this._repositoriesService.getEntities<IdentificationType>(
        identificationType,
      ),
      this._repositoriesService.getEntities<AdditionalType>(additionalType),
      this._repositoriesService.getEntities<DiscountType>(discountType),
    ]);

    return {
      invoiceType: invoiceTypes,
      taxeType: taxeTypes,
      payType: payTypes,
      paidType: paidTypes,
      categoryType: categoryTypes,
      identificationType: identificationTypes,
      additionalType: additionalTypes,
      discountType: discountTypes,
    };
  }

  async create(invoiceId: number, dto: CreateInvoiceDetailDto) {
    try {
      const [invoice, taxeType] = await Promise.all([
        this._invoiceRepository.findOne({
          where: { invoiceId },
          relations: ['invoiceType', 'paidType'],
        }),
        dto.taxeTypeId
          ? this._taxeTypeRepository.findOne({
              where: { taxeTypeId: dto.taxeTypeId },
            })
          : Promise.resolve(null),
      ]);

      if (!invoice) {
        throw new NotFoundException(
          `Factura con ID ${invoiceId} no encontrada`,
        );
      }

      const isQuote = invoice.invoiceType?.code === 'CO';
      const isSale = invoice.invoiceType?.code === 'FV';
      const isBuy = invoice.invoiceType?.code === 'FC';

      if (dto.taxeTypeId && !taxeType) {
        throw new NotFoundException('Tipo de impuesto no encontrado');
      }

      const taxRate = taxeType?.percentage
        ? taxeType.percentage > 1
          ? taxeType.percentage / 100
          : taxeType.percentage
        : 0;

      const amount = Number(dto.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new BadRequestException('La cantidad debe ser mayor a cero');
      }

      // Validación de fechas
      if (
        dto.startDate &&
        dto.endDate &&
        new Date(dto.startDate) >= new Date(dto.endDate)
      ) {
        throw new BadRequestException(
          'La fecha de inicio debe ser anterior a la fecha de fin',
        );
      }

      let priceBuy = 0;
      let priceWithoutTax = 0;
      let priceWithTax = 0;
      let taxe = 0;
      let subtotal = 0;
      let isProduct = false;
      let product = null;

      if (dto.productId) {
        product = await this._productRepository.findOne({
          where: { productId: dto.productId },
        });
        if (!product) throw new NotFoundException('Producto no encontrado');
        if (!product.isActive)
          throw new BadRequestException('Este producto está inactivo');

        if (isSale && !isQuote) {
          const currentStock = product.amount ?? 0;
          if (amount > currentStock) {
          }
        }

        const prices = this._generalInvoiceDetaillService.getHistoricalPrices(
          product,
          dto,
        );
        priceBuy = prices.priceBuy;
        priceWithoutTax = prices.priceWithoutTax;

        isProduct = true;
      } else {
        priceBuy = Number(dto.priceBuy) || 0;
        priceWithoutTax = Number(dto.priceWithoutTax) || 0;
      }

      if (isNaN(priceWithoutTax) || priceWithoutTax < 0) {
        throw new BadRequestException('El precio sin impuesto no es válido');
      }

      // Calcular el precio con impuesto
      priceWithTax = Number((priceWithoutTax * (1 + taxRate)).toFixed(2));
      taxe = Number((priceWithTax - priceWithoutTax).toFixed(2));
      subtotal = Number((amount * priceWithTax).toFixed(2));

      const detail = this._invoiceDetaillRepository.create({
        amount,
        priceBuy,
        priceWithoutTax,
        priceWithTax,
        taxe,
        subtotal,
        taxeType,
        invoice,
        startDate: dto.startDate,
        endDate: dto.endDate,
      });

      if (product) detail.product = product;

      // --- IMPORTANT: removed 'reservations' relation (no existe en la entidad)
      const [accommodation, excursion] = await Promise.all([
        dto.accommodationId
          ? this._accommodationRepository.findOne({
              where: { accommodationId: dto.accommodationId },
              relations: ['stateType'], // solo stateType, no reservations
            })
          : Promise.resolve(null),
        dto.excursionId
          ? this._excursionRepository.findOne({
              where: { excursionId: dto.excursionId },
            })
          : Promise.resolve(null),
      ]);

      if (dto.accommodationId && !accommodation) {
        throw new NotFoundException('Hospedaje no encontrado');
      }
      if (dto.excursionId && !excursion) {
        throw new NotFoundException('Excursión no encontrada');
      }

      if (accommodation) {
        if (!accommodation.stateType) {
          throw new BadRequestException(
            'El alojamiento no tiene un estado definido',
          );
        }

        const stateName = accommodation.stateType.name?.toString().trim();
        if (!stateName) {
          throw new BadRequestException(
            'El nombre del estado no está definido',
          );
        }

        // Verificar reservas existentes (si hay solapamiento y están reservadas -> error)
        if (dto.startDate && dto.endDate) {
          const overlappingDetail = await this._invoiceDetaillRepository
            .createQueryBuilder('detail')
            .leftJoinAndSelect('detail.invoice', 'invoice')
            .leftJoinAndSelect('invoice.paidType', 'paidType')
            .where('detail.accommodation = :accommodationId', {
              accommodationId: accommodation.accommodationId,
            })
            .andWhere(
              'detail.startDate < :endDate AND detail.endDate > :startDate',
              { startDate: dto.startDate, endDate: dto.endDate },
            )
            .getOne();

          if (
            overlappingDetail &&
            overlappingDetail.invoice?.paidType?.name &&
            [
              'Reservado - Pagado',
              'Reservado - Pendiente',
              'RESERVADO - PAGADO',
              'RESERVADO - PENDIENTE',
            ].includes(overlappingDetail.invoice.paidType.name.trim())
          ) {
            throw new BadRequestException(
              `El hospedaje ya está reservado entre ${dto.startDate} y ${dto.endDate}`,
            );
          }
        }

        // Mantengo la validación de disponibilidad
        if (stateName !== 'Disponible' && stateName !== 'DISPONIBLE') {
          throw new BadRequestException(
            `El hospedaje no está disponible (estado actual: ${stateName})`,
          );
        }

        detail.accommodation = accommodation;

        // ✅ Cambiar a OCUPADO solo si NO es cotización (isQuote === false)
        if (!isQuote && dto.startDate) {
          // umbral cambiado a 2 días
          const diffDays = Math.ceil(
            (new Date(dto.startDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24),
          );

          if (diffDays <= 2) {
            const ocupadoState = await this._stateTypeRepository.findOne({
              where: {
                name: In(['Ocupado', 'OCUPADO']),
              },
            });
            if (!ocupadoState) {
              throw new NotFoundException('No se encontró el estado "Ocupado"');
            }
            accommodation.stateType = ocupadoState;
            await this._accommodationRepository.save(accommodation);
          }
        }
      }

      if (excursion) detail.excursion = excursion;

      const savedDetail = await this._invoiceDetaillRepository.save(detail);

      // ===========================
      // STOCK: modificar solo si no es cotización
      // ===========================
      if (isProduct) {
        const currentAmount = Number(product.amount) || 0;

        if (isSale && !isQuote) {
          // Venta (no cotización): restar stock (incluso si queda negativo)
          product.amount = currentAmount - amount;
        } else if (isBuy) {
          // Compra: sumar
          product.amount = currentAmount + amount;
        } else if (isQuote) {
          // Cotización -> NO tocar stock

          this._eventEmitter.emit('invoice.detail.cotizacion', {
            invoice,
            product,
          });
        }
      }

      const savePromises = [
        // guardamos product solo si vino product y NO es cotización
        isProduct && !isQuote
          ? this._productRepository.save(product)
          : Promise.resolve(),
        this._generalInvoiceDetaillService.updateInvoiceTotal(invoiceId),
      ];

      await Promise.all(savePromises);

      this._eventEmitter.emit('invoice.detail.created', {
        invoice,
        isProduct,
      });

      // Preparar información adicional para el frontend
      let stockInfo = null;
      if (isProduct && product) {
        const previousStock =
          isSale && !isQuote ? product.amount + amount : product.amount;
        const currentStock = product.amount;

        stockInfo = {
          productName: product.name,
          previousStock,
          currentStock,
          requestedAmount: amount,
          hasStockWarning: isSale && !isQuote && amount > previousStock,
          isQuote,
          operationType: isQuote ? 'cotizacion' : isSale ? 'venta' : 'compra',
        };
      }

      return {
        ...savedDetail,
        stockInfo,
      };
    } catch (error) {
      console.error('❌ Error al crear detalle:', error);

      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ocurrió un error al crear el detalle',
      );
    }
  }

  /**
   * Eliminar detalle:
   * - Si invoiceType === 'CO' no revertir stock ni cambiar estados de accommodation.
   */
  async delete(invoiceDetailId: number) {
    const detail = await this._invoiceDetaillRepository.findOne({
      where: { invoiceDetailId },
      relations: [
        'invoice',
        'product',
        'invoice.invoiceType',
        'accommodation',
        'accommodation.stateType',
      ],
    });

    if (!detail) {
      throw new NotFoundException(
        `Detalle con ID ${invoiceDetailId} no encontrado`,
      );
    }

    const { invoice, product, accommodation, amount: detailAmount } = detail;
    const invoiceTypeCode = invoice.invoiceType.code;
    const isSale = invoiceTypeCode === 'FV';
    const isBuy = invoiceTypeCode === 'FC';
    const isQuote = invoiceTypeCode === 'CO';

    const ops: Promise<any>[] = [];

    // ✅ REVERTIR STOCK SOLO SI NO ES COTIZACIÓN
    if (product && !isQuote) {
      const currentAmount = Number(product.amount ?? 0);
      const amt = Number(detailAmount ?? 0);

      if (isNaN(currentAmount) || isNaN(amt)) {
        throw new Error(
          `Stock inválido: product.amount=${product.amount}, detail.amount=${detail.amount}`,
        );
      }

      if (isSale) {
        // Si fue venta, al eliminar reponemos
        product.amount = currentAmount + amt;
      } else if (isBuy) {
        // Si fue compra, al eliminar restamos (verificamos no negativo)
        const newAmount = currentAmount - amt;
        if (newAmount < 0) {
          throw new BadRequestException(
            `No se puede eliminar: dejaría el stock del producto ${product.name} en negativo`,
          );
        }
        product.amount = newAmount;
      }

      ops.push(this._productRepository.save(product));
    }

    // 🆕 LIBERAR ACCOMMODATION SOLO SI NO ES COTIZACIÓN
    if (accommodation && !isQuote) {
      const disponibleState = await this._stateTypeRepository.findOne({
        where: {
          name: In(['Disponible', 'DISPONIBLE']),
        },
      });

      if (disponibleState) {
        accommodation.stateType = disponibleState;
        ops.push(this._accommodationRepository.save(accommodation));
      }
    }

    // ELIMINAR DETALLE Y ACTUALIZAR TOTAL
    await this._invoiceDetaillRepository.remove(detail);

    await this._generalInvoiceDetaillService.updateInvoiceTotal(
      invoice.invoiceId,
    );

    await Promise.all(ops);

    this._eventEmitter.emit('invoice.detail.deleted', {
      invoice,
      isProduct: !!product,
    });

    return {
      invoiceId: invoice.invoiceId,
      deletedDetailId: invoiceDetailId,
    };
  }

  async handleScheduledReservation() {
    const now = new Date();

    // Buscar reservas que están en curso
    const activeReservations = await this._invoiceDetaillRepository
      .createQueryBuilder('detail')
      .leftJoinAndSelect('detail.invoice', 'invoice')
      .leftJoinAndSelect('invoice.paidType', 'paidType')
      .leftJoinAndSelect('detail.accommodation', 'accommodation')
      .leftJoinAndSelect('accommodation.stateType', 'stateType')
      .where('detail.startDate <= :now AND detail.endDate >= :now', { now })
      .getMany();

    for (const reservation of activeReservations) {
      if (
        reservation.invoice?.paidType?.name &&
        ['RESERVADO - PAGADO', 'RESERVADO - PENDIENTE'].includes(
          reservation.invoice.paidType.name.trim(),
        )
      ) {
        if (
          reservation.accommodation &&
          reservation.accommodation.stateType?.name === 'DISPONIBLE'
        ) {
          const ocupadoState = await this._stateTypeRepository.findOne({
            where: {
              name: In(['OCUPADO']),
            },
          });
          if (ocupadoState) {
            reservation.accommodation.stateType = ocupadoState;
            await this._accommodationRepository.save(reservation.accommodation);
          }
        }
      }
    }

    // Buscar reservas que ya pasaron su fecha de fin
    const expiredReservations = await this._invoiceDetaillRepository
      .createQueryBuilder('detail')
      .leftJoinAndSelect('detail.accommodation', 'accommodation')
      .leftJoinAndSelect('accommodation.stateType', 'stateType')
      .where('detail.endDate < :now', { now })
      .getMany();

    for (const reservation of expiredReservations) {
      if (
        reservation.accommodation &&
        reservation.accommodation.stateType?.name === 'OCUPADO'
      ) {
        const mantenimientoState = await this._stateTypeRepository.findOne({
          where: {
            name: In(['MANTENIMIENTO']),
          },
        });

        if (mantenimientoState) {
          reservation.accommodation.stateType = mantenimientoState;
          await this._accommodationRepository.save(reservation.accommodation);
        }
      }
    }
  }
}
