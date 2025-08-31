import { CategoryReportDto } from './../interfaces/report.interface';
import { PayTypeRepository } from './../../shared/repositories/payType.repository';
import { InvoiceRepository } from './../../shared/repositories/invoice.repository';
import { Injectable } from '@nestjs/common';
import { PaymentTypeReport } from '../interfaces/report.interface';
import { CATEGORY_TYPES, PAYMENT_TYPES } from '../constants/report.constants';

@Injectable()
export class ReportService {
  constructor(
    private readonly _invoiceRepository: InvoiceRepository,
    private readonly _payTypeRepository: PayTypeRepository,
  ) {}

  private getColombianDateTime(): Date {
    const now = new Date();
    const colombianOffset = -5 * 60;
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + colombianOffset * 60000);
  }

  private calculateDateRanges(now: Date) {
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(startOfWeek.getDate() - daysToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    return {
      daily: { start: startOfToday, end: endOfToday },
      weekly: { start: startOfWeek, end: endOfWeek },
      monthly: { start: startOfMonth, end: endOfMonth },
    };
  }

  async generateAllPaymentTypesReport(): Promise<PaymentTypeReport[]> {
    const now = this.getColombianDateTime();
    const dateRanges = this.calculateDateRanges(now);

    // recorrer constantes
    const reports = await Promise.all(
      PAYMENT_TYPES.map(async (paymentTypeName) => {
        const query = async (startDate: Date, endDate: Date) => {
          return await this._invoiceRepository
            .createQueryBuilder('invoice')
            .leftJoin('invoice.payType', 'payType')
            .select([
              'COUNT(*) as count',
              'COALESCE(SUM(invoice.total), 0) as total',
            ])
            .where('payType.name = :paymentTypeName', { paymentTypeName })
            .andWhere(
              'invoice.createdAt >= :startDate AND invoice.createdAt <= :endDate',
              { startDate, endDate },
            )
            .getRawOne();
        };

        const [daily, weekly, monthly] = await Promise.all([
          query(dateRanges.daily.start, dateRanges.daily.end),
          query(dateRanges.weekly.start, dateRanges.weekly.end),
          query(dateRanges.monthly.start, dateRanges.monthly.end),
        ]);

        return {
          paymentType: paymentTypeName,
          dailyCount: parseInt(daily?.count) || 0,
          weeklyCount: parseInt(weekly?.count) || 0,
          monthlyCount: parseInt(monthly?.count) || 0,
          dailyTotal: parseFloat(daily?.total) || 0,
          weeklyTotal: parseFloat(weekly?.total) || 0,
          monthlyTotal: parseFloat(monthly?.total) || 0,
        };
      }),
    );

    return reports;
  }

  async generateSalesByCategoryReport(): Promise<CategoryReportDto[]> {
    const now = this.getColombianDateTime();
    const dateRanges = this.calculateDateRanges(now);

    // 🔹 Aquí definimos nuestras categorías lógicas

    const reports = await Promise.all(
      CATEGORY_TYPES.map(async (categoryName) => {
        const query = async (startDate: Date, endDate: Date) => {
          const qb = this._invoiceRepository
            .createQueryBuilder('invoice')
            .leftJoin('invoice.invoiceDetails', 'detail')
            .leftJoin('detail.product', 'product')
            .leftJoin('product.categoryType', 'categoryType')
            .leftJoin('detail.accommodation', 'accommodation')
            .leftJoin('detail.excursion', 'excursion')
            .select([
              'COUNT(detail.invoiceDetailId) as count',
              'COALESCE(SUM(detail.subtotal), 0) as total',
            ])
            .where('invoice.createdAt BETWEEN :startDate AND :endDate', {
              startDate,
              endDate,
            });

          // 🔹 Filtros según la categoría
          if (
            ['BAR', 'RESTAURANTE', 'OTROS', 'MECATO'].includes(categoryName)
          ) {
            qb.andWhere('categoryType.name = :categoryName', { categoryName });
          } else if (categoryName === 'HOSPEDAJE') {
            qb.andWhere('accommodation.accommodationId IS NOT NULL');
          } else if (categoryName === 'PASADIA') {
            qb.andWhere('excursion.excursionId IS NOT NULL');
          } else if (categoryName === 'SERVICIOS') {
            qb.andWhere('product.name = :service', { service: 'SERVICIOS' });
          }

          return qb.getRawOne();
        };

        const [daily, weekly, monthly] = await Promise.all([
          query(dateRanges.daily.start, dateRanges.daily.end),
          query(dateRanges.weekly.start, dateRanges.weekly.end),
          query(dateRanges.monthly.start, dateRanges.monthly.end),
        ]);

        return {
          category: categoryName,
          dailyCount: parseInt(daily?.count) || 0,
          weeklyCount: parseInt(weekly?.count) || 0,
          monthlyCount: parseInt(monthly?.count) || 0,
          dailyTotal: parseFloat(daily?.total) || 0,
          weeklyTotal: parseFloat(weekly?.total) || 0,
          monthlyTotal: parseFloat(monthly?.total) || 0,
        };
      }),
    );

    return reports;
  }
}
