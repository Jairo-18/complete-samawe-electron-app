import { CommonModule } from '@angular/common';
import { ProductComplete } from './../../../service-and-product/interface/product.interface';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import html2pdf from 'html2pdf.js';
import { FormatCopPipe } from '../../../shared/pipes/format-cop.pipe';

@Component({
  selector: 'app-products-print',
  imports: [FormatCopPipe, CommonModule],
  templateUrl: './products-print.component.html',
  styleUrl: './products-print.component.scss'
})
export class ProductsPrintComponent {
  @Input() products: ProductComplete[] = [];
  @ViewChild('printSection') printSection!: ElementRef;

  get totalSaleValue(): number {
    return this.products.reduce(
      (sum, p) => sum + (p.priceSale ?? 0) * (p.amount ?? 0),
      0
    );
  }

  print() {
    const element = this.printSection?.nativeElement;
    if (!element) return;

    setTimeout(() => {
      const element = this.printSection.nativeElement;
      if (!element) return;

      const options = {
        margin: 0.5,
        filename: `productos-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf()
        .set(options)
        .from(element)
        .toPdf()
        .get('pdf')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((pdf: any) => {
          const pdfUrl = pdf.output('bloburl');
          window.open(pdfUrl, '_blank'); // abre nueva pestaña
        });
    }, 0);
  }
}
