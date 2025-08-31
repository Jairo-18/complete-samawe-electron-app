import { Response } from 'express';
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ReportService } from './../services/report.service';
import { PaymentTypeReportDto } from './../dtos/report.dto';
import { CategoryReportDto } from '../interfaces/report.interface';
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
      'Total Diario',
      'Total Semanal',
      'Total Mensual',
    ]);

    // Datos
    reports.forEach((r) => {
      worksheet.addRow([
        r.paymentType,
        r.dailyCount,
        r.weeklyCount,
        r.monthlyCount,
        r.dailyTotal,
        r.weeklyTotal,
        r.monthlyTotal,
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
      'Total Diario',
      'Total Semanal',
      'Total Mensual',
    ]);

    // Datos
    reports.forEach((r) => {
      worksheet.addRow([
        r.category,
        r.dailyCount,
        r.weeklyCount,
        r.monthlyCount,
        r.dailyTotal,
        r.weeklyTotal,
        r.monthlyTotal,
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
}
