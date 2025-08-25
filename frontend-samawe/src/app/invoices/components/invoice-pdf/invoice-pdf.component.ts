import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Invoice } from '../../interface/invoice.interface';
import { CommonModule } from '@angular/common';
import { FormatCopPipe } from '../../../shared/pipes/format-cop.pipe';

@Component({
  selector: 'app-invoice-pdf',
  standalone: true,
  imports: [CommonModule, FormatCopPipe],
  templateUrl: './invoice-pdf.component.html',
  styleUrl: './invoice-pdf.component.scss'
})
export class InvoicePdfComponent {
  @Input() invoiceData!: Invoice;
  @ViewChild('pdfWrapper') pdfWrapper!: ElementRef;

  printDate = new Date();

  get nativeElement(): HTMLElement {
    return this.pdfWrapper?.nativeElement;
  }
}
