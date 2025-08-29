import { InvoiceDetailService } from './../../invoices/services/invoiceDetail.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronJobService {
  constructor(private readonly _invoiceDetaillService: InvoiceDetailService) {}

  @Cron('0 */30 * * * *')
  async handleReservationsJob() {
    console.log('⏰ Ejecutando revisión de reservas...');
    await this._invoiceDetaillService.handleScheduledReservation();
  }
}
