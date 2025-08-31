import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Invoice } from '../../interface/invoice.interface';
import { FormatCopPipe } from '../../../shared/pipes/format-cop.pipe';

@Component({
  selector: 'app-invoice-pdf',
  standalone: true,
  imports: [CommonModule, MatTableModule, FormatCopPipe],
  templateUrl: './invoice-pdf.component.html',
  styleUrl: './invoice-pdf.component.scss'
})
export class InvoicePdfComponent {
  @Input() invoiceData!: Invoice;
  @ViewChild('pdfWrapper') pdfWrapper!: ElementRef;

  printDate = new Date();

  displayedColumns: string[] = [
    'nro',
    'item',
    'und',
    'precio',
    'impuesto',
    'subtotal'
  ];
  get dataSource() {
    return this.invoiceData?.invoiceDetails || [];
  }

  get nativeElement(): HTMLElement {
    return this.pdfWrapper?.nativeElement;
  }
}
