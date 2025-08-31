import { PaymentTypeReportDto } from './../dtos/report.dto';
import { ReportService } from './../services/report.service';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CategoryReportDto } from '../interfaces/report.interface';

@Controller('reports')
@ApiTags('Reportes de Facturas por Tipo de Pago')
export class ReportController {
  constructor(private readonly _reportService: ReportService) {}

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
}
