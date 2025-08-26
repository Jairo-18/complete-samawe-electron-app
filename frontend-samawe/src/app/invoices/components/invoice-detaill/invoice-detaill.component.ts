import {
  AfterViewInit,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { YesNoDialogComponent } from '../../../shared/components/yes-no-dialog/yes-no-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { InvoiceDetaillService } from '../../services/invoiceDetaill.service';
import { MatButtonModule } from '@angular/material/button';
import { InvoiceDetail } from '../../interface/invoiceDetaill.interface';
import { PaginationInterface } from '../../../shared/interfaces/pagination.interface';
import { FormatCopPipe } from '../../../shared/pipes/format-cop.pipe';

@Component({
  selector: 'app-invoice-detaill',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIcon,
    MatButtonModule,
    FormatCopPipe
  ],
  templateUrl: './invoice-detaill.component.html',
  styleUrl: './invoice-detaill.component.scss'
})
export class InvoiceDetaillComponent implements OnChanges, AfterViewInit {
  @Input() invoiceDetails: InvoiceDetail[] = [];
  @Input() invoiceId?: number;
  @Input() reload: boolean = false;
  @Output() itemDelete = new EventEmitter<void>();
  @Output() allItemsSaved = new EventEmitter<void>();

  private readonly _matDialog: MatDialog = inject(MatDialog);
  private readonly _invoiceDetaillService: InvoiceDetaillService = inject(
    InvoiceDetaillService
  );

  loading: boolean = false;
  isMobile: boolean = false;
  paginationParams: PaginationInterface = {
    page: 1,
    perPage: 25,
    total: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false
  };
  displayedColumns: string[] = [
    'code',
    'name',
    'startDate',
    'endDate',
    'amount',
    'priceWithoutTax',
    'priceWithTax',
    'subtotal',
    'actions'
  ];

  dataSource = new MatTableDataSource<InvoiceDetail>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private paginatorInitialized = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoiceDetails'] && this.invoiceDetails) {
      this.dataSource.data = this.invoiceDetails;

      if (this.paginatorInitialized) {
        this.dataSource.paginator = this.paginator;

        // Saltar a la última página automáticamente
        setTimeout(() => {
          const totalItems = this.dataSource.data.length;
          const pageSize = this.paginator.pageSize;
          const lastPageIndex = Math.ceil(totalItems / pageSize) - 1;

          if (lastPageIndex >= 0) {
            this.paginator.pageIndex = lastPageIndex;
            this.paginator._changePageSize(this.paginator.pageSize);
          }
        });
      }
    }

    if (changes['reload'] && changes['reload'].currentValue) {
      this.dataSource.data = this.invoiceDetails;
      if (this.paginator) {
        this.paginator.firstPage();
      }
    }
  }

  ngAfterViewInit(): void {
    this.paginatorInitialized = true;
    this.dataSource.paginator = this.paginator;
  }

  onChangePagination(event: PageEvent): void {
    this.paginationParams.page = event.pageIndex + 1;
    this.paginationParams.perPage = event.pageSize;
  }

  addItem(detail: InvoiceDetail): void {
    if (!detail) return;

    // Agrega el item directamente al dataSource
    this.dataSource.data = [...this.dataSource.data, detail];

    // Opcional: mover a la última página si hay paginación
    if (this.paginator) {
      const totalItems = this.dataSource.data.length;
      const pageSize = this.paginator.pageSize;
      this.paginator.pageIndex = Math.floor((totalItems - 1) / pageSize);
      this.paginator._changePageSize(pageSize);
    }
  }

  /**
   * @param _deleteUser - Elimina un usuario.
   */
  private deleteItem(invoiceDetailId: number): void {
    this.loading = true;
    this._invoiceDetaillService.deleteItemInvoice(invoiceDetailId).subscribe({
      next: () => {
        this.loading = false;
        this.itemDelete.emit();
      },
      error: (error) => {
        console.error('Error en la solicitud:', error);
        this.loading = false;
      }
    });
  }

  /**
   * @param openDeleteUserDialog - Abre un modal para eliminar un usuario.
   */
  openDeleteItemDialog(id: number): void {
    const dialogRef = this._matDialog.open(YesNoDialogComponent, {
      data: {
        title: '¿Deseas eliminar este item?',
        message: 'Esta acción no se puede deshacer.'
      }
    });

    dialogRef.afterClosed().subscribe((confirm) => {
      if (confirm) {
        this.deleteItem(id);
      }
    });
  }
}
