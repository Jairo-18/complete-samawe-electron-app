import { Response } from 'express';
import { Controller, Get, Res, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { ReportService } from './../services/report.service';
import { CategoryReportDto, PaymentTypeReportDto } from './../dtos/report.dto';
import { CategoryDetailReport } from '../interfaces/report.interface';

import * as ExcelJS from 'exceljs';

@Controller('reports')
@ApiTags('Reportes de Facturas')
export class ReportController {
  constructor(private readonly _reportService: ReportService) {}

  // === JSON NORMAL (para API / frontend) ===

  @Get('payment-types')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiOkResponse({
    type: [PaymentTypeReportDto],
    description: 'Reporte de todos los tipos de pago',
  })
  async getAllPaymentTypesReport(): Promise<PaymentTypeReportDto[]> {
    return this._reportService.generateAllPaymentTypesReport();
  }

  @Get('sales-by-category')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiOkResponse({
    type: [CategoryReportDto],
    description:
      'Reporte de ventas por categoría (productos, hospedajes, pasadías)',
  })
  async getSalesByCategoryReport(): Promise<CategoryReportDto[]> {
    return this._reportService.generateSalesByCategoryReport();
  }

  // 🔹 NUEVOS ENDPOINTS CON DETALLES

  @Get('sales-by-category/with-details')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiOkResponse({
    description: 'Reporte de ventas por categoría con detalles de cada ítem',
  })
  async getSalesByCategoryWithDetails(): Promise<CategoryDetailReport[]> {
    return this._reportService.generateSalesByCategoryWithDetails();
  }

  @Get('sales-by-category/:category/details/:period')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiParam({
    name: 'category',
    description: 'Nombre de la categoría (BAR, RESTAURANTE, etc.)',
  })
  @ApiParam({
    name: 'period',
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    description: 'Período del reporte',
  })
  @ApiOkResponse({
    description:
      'Detalles específicos de una categoría en un período determinado',
  })
  async getCategoryDetailsForPeriod(
    @Param('category') category: string,
    @Param('period') period: 'daily' | 'weekly' | 'monthly' | 'yearly',
  ) {
    return this._reportService.getCategoryDetailsForPeriod(category, period);
  }

  // === EXPORTAR A EXCEL ===

  @Get('payment-types/excel')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async exportPaymentTypesExcel(@Res() res: Response) {
    const reports = await this._reportService.generateAllPaymentTypesReport();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tipos de Pago');

    // Encabezados
    worksheet.addRow([
      'Tipo de Pago',
      'Ventas Diarias',
      'Ventas Semanales',
      'Ventas Mensuales',
      'Ventas Anuales',
      'Total Diario',
      'Total Semanal',
      'Total Mensual',
      'Total Anual',
    ]);

    // Datos
    reports.forEach((r) => {
      worksheet.addRow([
        r.paymentType,
        r.dailyCount,
        r.weeklyCount,
        r.monthlyCount,
        r.yearlyCount,
        r.dailyTotal,
        r.weeklyTotal,
        r.monthlyTotal,
        r.yearlyTotal,
      ]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=payment-types-report.xlsx',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  }

  @Get('sales-by-category/excel')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async exportSalesByCategoryExcel(@Res() res: Response) {
    const reports = await this._reportService.generateSalesByCategoryReport();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ventas por Categoría');

    // Encabezados
    worksheet.addRow([
      'Categoría',
      'Ventas Diarias',
      'Ventas Semanales',
      'Ventas Mensuales',
      'Ventas Anuales',
      'Total Diario',
      'Total Semanal',
      'Total Mensual',
      'Total Anual',
    ]);

    // Datos
    reports.forEach((r) => {
      worksheet.addRow([
        r.category,
        r.dailyCount,
        r.weeklyCount,
        r.monthlyCount,
        r.yearlyCount,
        r.dailyTotal,
        r.weeklyTotal,
        r.monthlyTotal,
        r.yearlyTotal,
      ]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=sales-by-category-report.xlsx',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  }

  // 🔹 NUEVO: Exportar reportes con detalles a Excel
  // 🔹 NUEVO: Exportar reportes con detalles a Excel
  @Get('sales-by-category/with-details/excel')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  async exportSalesByCategoryWithDetailsExcel(@Res() res: Response) {
    const reports =
      await this._reportService.generateSalesByCategoryWithDetails();

    const workbook = new ExcelJS.Workbook();

    // Crear hoja de resumen
    const summaryWorksheet = workbook.addWorksheet('Resumen por Categoría');
    summaryWorksheet.addRow([
      'Categoría',
      'Ventas Diarias',
      'Ventas Semanales',
      'Ventas Mensuales',
      'Ventas Anuales', // ✅ Agregado
      'Total Diario',
      'Total Semanal',
      'Total Mensual',
      'Total Anual', // ✅ Agregado
    ]);

    reports.forEach((report) => {
      summaryWorksheet.addRow([
        report.category,
        report.summary.dailyCount,
        report.summary.weeklyCount,
        report.summary.monthlyCount,
        report.summary.yearlyCount, // ✅ Agregado
        report.summary.dailyTotal,
        report.summary.weeklyTotal,
        report.summary.monthlyTotal,
        report.summary.yearlyTotal, // ✅ Agregado
      ]);
    });

    // Crear hojas de detalle para cada categoría con datos
    reports.forEach((report) => {
      const hasData = report.summary.yearlyCount > 0; // ✅ Cambiado a yearly para captar más datos
      if (hasData) {
        const detailWorksheet = workbook.addWorksheet(
          `Detalles ${report.category}`,
        );

        // Encabezados
        detailWorksheet.addRow([
          'Período',
          'ID Detalle',
          'ID Factura',
          'Fecha Factura',
          'Tipo de Ítem',
          'Nombre del Ítem',
          'Cantidad',
          'Subtotal',
        ]);

        // Agregar detalles de todos los períodos
        const allDetails = [
          ...report.details.daily.map((d) => ({ ...d, period: 'DIARIO' })),
          ...report.details.weekly.map((d) => ({ ...d, period: 'SEMANAL' })),
          ...report.details.monthly.map((d) => ({ ...d, period: 'MENSUAL' })),
          ...report.details.yearly.map((d) => ({ ...d, period: 'ANUAL' })), // ✅ Agregado
        ];

        // Ordenar por fecha
        allDetails.sort(
          (a, b) =>
            new Date(b.invoiceDate).getTime() -
            new Date(a.invoiceDate).getTime(),
        );

        allDetails.forEach((detail) => {
          detailWorksheet.addRow([
            detail.period,
            detail.invoiceDetailId,
            detail.invoiceId,
            detail.invoiceDate,
            detail.itemType,
            detail.itemName,
            detail.amount,
            detail.subtotal,
          ]);
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=sales-by-category-with-details.xlsx',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.send(buffer);
  }
}
