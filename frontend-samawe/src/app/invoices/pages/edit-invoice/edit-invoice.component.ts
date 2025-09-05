import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BasePageComponent } from '../../../shared/components/base-page/base-page.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AddProductComponent } from '../../components/add-product/add-product.component';
import { AddAccommodationComponent } from '../../components/add-accommodation/add-accommodation.component';
import { AddExcursionComponent } from '../../components/add-excursion/add-excursion.component';
import { RelatedDataService } from '../../../shared/services/relatedData.service';
import {
  AdditionalType,
  CategoryType,
  DiscountType,
  PaidType,
  PayType,
  TaxeType
} from '../../../shared/interfaces/relatedDataGeneral';
import {
  createInvoiceRelatedData,
  Invoice
} from '../../interface/invoice.interface';
import { InvoiceService } from '../../services/invoice.service';
import { ApiResponseInterface } from '../../../shared/interfaces/api-response.interface';
import { InvoiceDetaillComponent } from '../../components/invoice-detaill/invoice-detaill.component';
import { InvoiceSummaryComponent } from '../../components/invoice-summary/invoice-summary.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { InvoicePdfComponent } from '../../components/invoice-pdf/invoice-pdf.component';
import html2pdf from 'html2pdf.js';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CreateInvoiceDialogComponent } from '../../components/create-invoice-dialog/create-invoice-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AddInvoiceBuyComponent } from '../../components/add-invoice-buy/add-invoice-buy.component';

@Component({
  selector: 'app-edit-invoice',
  standalone: true,
  imports: [
    CommonModule,
    BasePageComponent,
    MatTabsModule,
    AddProductComponent,
    AddAccommodationComponent,
    AddExcursionComponent,
    InvoiceDetaillComponent,
    InvoiceSummaryComponent,
    LoaderComponent,
    InvoicePdfComponent,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    AddInvoiceBuyComponent
  ],
  templateUrl: './edit-invoice.component.html',
  styleUrl: './edit-invoice.component.scss'
})
export class EditInvoiceComponent implements OnInit {
  private readonly _relatedDataService: RelatedDataService =
    inject(RelatedDataService);
  private readonly _invoiceService: InvoiceService = inject(InvoiceService);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _dialog: MatDialog = inject(MatDialog);

  @ViewChild('invoiceToPrint') invoicePdfComp!: ElementRef;
  @ViewChild(InvoiceDetaillComponent)
  invoiceDetaillComponent!: InvoiceDetaillComponent;

  categoryTypes: CategoryType[] = [];
  paidTypes: PaidType[] = [];
  taxeTypes: TaxeType[] = [];
  payTypes: PayType[] = [];
  additionalTypes: AdditionalType[] = [];
  discountTypes: DiscountType[] = [];
  reloadInvoiceDetails: boolean = false;
  invoiceData?: Invoice;
  invoiceId?: number;
  initialLoading: boolean = true;

  ngOnInit(): void {
    const invoiceId = Number(this._route.snapshot.paramMap.get('id'));
    if (invoiceId) {
      this.getInvoiceToEdit(invoiceId);
    }
  }

  loadRelatedData(): void {
    if (this._relatedDataService.invoiceRelatedData()) {
      this.processData(this._relatedDataService.invoiceRelatedData()!);
    } else {
      this._relatedDataService.createInvoiceRelatedData().subscribe({
        next: (res) => this.processData(res),
        error: (err) =>
          console.error('❌ Error al cargar datos relacionados:', err)
      });
    }
  }

  private processData(
    res: ApiResponseInterface<createInvoiceRelatedData>
  ): void {
    this.categoryTypes = res.data.categoryType || [];
    this.payTypes = res.data.payType || [];
    this.paidTypes = res.data.paidType || [];
    this.taxeTypes = res.data.taxeType || [];
    this.additionalTypes = res.data.additionalType || [];
    this.discountTypes = res.data.discountType || [];
  }

  onItemSaved(): void {
    if (this.invoiceId) {
      this.getInvoiceToEdit(this.invoiceId, false);
    }
  }

  openEditInvoiceDialog(): void {
    if (!this.invoiceId) return;

    const isMobile = window.innerWidth <= 768;

    this._dialog
      .open(CreateInvoiceDialogComponent, {
        width: isMobile ? '90vw' : '60vw',
        data: {
          editMode: true,
          invoiceId: this.invoiceId,
          relatedData: {
            payType: this.payTypes,
            paidType: this.paidTypes
          }
        }
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.getInvoiceToEdit(this.invoiceId!, false);
      });
  }

  onItemDeleted(): void {
    if (this.invoiceId) {
      this.getInvoiceToEdit(this.invoiceId, false);
      this.reloadInvoiceDetails = true;
      setTimeout(() => (this.reloadInvoiceDetails = false), 100);
    }
  }

  getInvoiceToEdit(invoiceId: number, isInitialLoad: boolean = true): void {
    this._invoiceService.getInvoiceToEdit(invoiceId).subscribe({
      next: (res) => {
        const invoice = res.data;

        this.invoiceData = {
          ...invoice,
          invoiceDetails: [...invoice.invoiceDetails]
        };
        this.invoiceId = invoice.invoiceId;
        this.loadRelatedData();

        if (isInitialLoad) {
          this.initialLoading = false;
        }
      },
      error: (err) => {
        console.error('Error al obtener la factura', err);
        if (isInitialLoad) {
          this.initialLoading = false;
        }
      }
    });
  }

  printInvoice(): void {
    const element = this.invoicePdfComp?.nativeElement;

    if (!element || !this.invoiceData) return;

    const options = {
      margin: 0.5,
      filename: `${this.invoiceData.invoiceType.code}-${this.invoiceData.code}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
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
        window.open(pdfUrl, '_blank'); // Abre una pestaña nueva con el PDF
      });
  }

  downloadInvoice(): void {
    const element = this.invoicePdfComp?.nativeElement;

    if (!element || !this.invoiceData) return;

    const options = {
      margin: 0.5,
      filename: `${this.invoiceData.invoiceType.code}-${this.invoiceData.code}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save();
  }

  // Método para manejar cuando se guardan todos los items desde el componente hijo
  onAllItemsSaved(): void {
    if (this.invoiceId) {
      this.getInvoiceToEdit(this.invoiceId, false);
    }
  }
}
