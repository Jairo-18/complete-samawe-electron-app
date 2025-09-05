import { Component, ViewChild, Input, ElementRef } from '@angular/core';
import { ExcursionComplete } from '../../../service-and-product/interface/excursion.interface';
import { FormatCopPipe } from '../../pipes/format-cop.pipe';
import { CommonModule } from '@angular/common';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-excursios-print',
  standalone: true,
  imports: [FormatCopPipe, CommonModule],
  templateUrl: './excursios-print.component.html',
  styleUrl: './excursios-print.component.scss'
})
export class ExcursiosPrintComponent {
  @Input() excursions: ExcursionComplete[] = [];
  @ViewChild('printSection') printSection!: ElementRef;

  print() {
    const element = this.printSection?.nativeElement;
    if (!element) return;

    setTimeout(() => {
      const element = this.printSection.nativeElement;
      if (!element) return;

      const options = {
        margin: 0.5,
        filename: `pasadias-${new Date().toISOString().split('T')[0]}.pdf`,
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
