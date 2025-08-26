import { InvoiceService } from './../../services/invoice.service';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { BasePageComponent } from '../../../shared/components/base-page/base-page.component';
import { CreateInvoiceDialogComponent } from '../../components/create-invoice-dialog/create-invoice-dialog.component';
import { PaginationInterface } from '../../../shared/interfaces/pagination.interface';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RelatedDataService } from '../../../shared/services/relatedData.service';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';
import { AuthService } from '../../../auth/services/auth.service';
import { UserInterface } from '../../../shared/interfaces/user.interface';
import { SearchField } from '../../../shared/interfaces/search.interface';
import { UserComplete } from '../../../organizational/interfaces/create.interface';
import { YesNoDialogComponent } from '../../../shared/components/yes-no-dialog/yes-no-dialog.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { SearchFieldsComponent } from '../../../shared/components/search-fields/search-fields.component';
import { RouterLink } from '@angular/router';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { MatMenuModule } from '@angular/material/menu';
import { InvoicePdfComponent } from '../../components/invoice-pdf/invoice-pdf.component';
import { Invoice } from '../../interface/invoice.interface';
import { InvoicePrintService } from '../../../shared/services/invoicePrint.service';
import { FormatCopPipe } from '../../../shared/pipes/format-cop.pipe';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-see-invoices',
  standalone: true,
  imports: [
    MatButtonModule,
    BasePageComponent,
    MatPaginatorModule,
    MatTabsModule,
    MatIconModule,
    CommonModule,
    SearchFieldsComponent,
    RouterLink,
    LoaderComponent,
    MatTableModule,
    MatMenuModule,
    InvoicePdfComponent,
    FormatCopPipe
  ],
  templateUrl: './see-invoices.component.html',
  styleUrl: './see-invoices.component.scss'
})
export class SeeInvoicesComponent implements OnInit {
  @ViewChild('invoiceToPrintRef') invoiceToPrintRef!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(SearchFieldsComponent) searchComponent!: SearchFieldsComponent;

  // Inyecciones
  private readonly _matDialog: MatDialog = inject(MatDialog);
  private readonly _invoiceService: InvoiceService = inject(InvoiceService);
  private readonly _relatedDataService: RelatedDataService =
    inject(RelatedDataService);
  private readonly _authService: AuthService = inject(AuthService);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedInvoice: any = null;

  // Variable para manejar los datos de la factura
  invoiceToPrintData?: Invoice;

  // Columnas de la tabla
  displayedColumns: string[] = [
    'invoiceType',
    'code',
    'identificationType',
    'clientName',
    'clientIdentification',
    'employeeName',
    'payType',
    'paidType',
    'invoiceElectronic',
    'subtotalWithoutTax',
    'subtotalWithTax',
    'total',
    'actions'
  ];

  // Declaramos el formulario reactivo
  form!: FormGroup;

  // Variable para llenar la tabla
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataSource = new MatTableDataSource<any>([]);

  // Variable para saber si es mobile
  isMobile: boolean = false;

  // Variable para saber si esta cargando la información
  loading: boolean = false;

  // Variable para limpiar filtros
  showClearButton: boolean = false;

  // Variable para saber si está loggeado el usuario
  userLogged: UserInterface;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any = {};

  // Variable para cambiar paginación
  selectedTabIndex: number = 0;

  // Variable para datos básicos de paginación
  paginationParams: PaginationInterface = {
    page: 1,
    perPage: 5,
    total: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false
  };

  // Buscadores para facturas
  searchFields: SearchField[] = [
    {
      name: 'search',
      label: 'Código, nombre, identificación, total, sub',
      type: 'text',
      placeholder: ' '
    },
    {
      name: 'invoiceTypeId',
      label: 'Tipo de factura',
      type: 'select',
      options: [],
      placeholder: 'Buscar por tipo de factura'
    },

    {
      name: 'identificationTypeId',
      label: 'Tipo identificación Cliente',
      type: 'select',
      options: [],
      placeholder: 'Buscar por tipo de identificación'
    },
    {
      name: 'paidTypeId',
      label: 'Tipo estado pago',
      type: 'select',
      options: [],
      placeholder: 'Buscar por tipo estado pago'
    },
    {
      name: 'payTypeId',
      label: 'Tipo pago',
      type: 'select',
      options: [],
      placeholder: 'Buscar por tipo pago'
    },
    {
      name: 'taxeTypeId',
      label: 'Tipo impuesto',
      type: 'select',
      options: [],
      placeholder: 'Buscar por tipo de impuesto'
    },
    {
      name: 'invoiceElectronic',
      label: 'Facturación electrónica',
      type: 'select',
      options: [
        { value: 'true', label: 'Sí' },
        { value: 'false', label: 'No' }
      ],
      placeholder: 'Buscar por facturación electrónica'
    }
  ];

  /**
   * Constructor para saber en que pantalla se esta renderizando y para obtener el usuario loggeado
   */
  constructor(private _invoicePrintService: InvoicePrintService) {
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) this.paginationParams.perPage = 5;
    this.userLogged = this._authService.getUserLoggedIn();
  }

  /**
   * Cargamos las facturas y sus datos relacionados para los selects.
   */
  ngOnInit(): void {
    this.loadInvoices();
    this.loadRelatedData();
  }

  /**
   * Cargamos datos relacionados
   */
  loadRelatedData(): void {
    this._relatedDataService.createInvoiceRelatedData().subscribe({
      next: (res) => {
        const optionMap = {
          invoiceTypeId: res.data.invoiceType,
          identificationTypeId: res.data.identificationType,
          paidTypeId: res.data.paidType,
          payTypeId: res.data.payType,
          taxeTypeId: res.data.taxeType
        };

        this.searchFields = this.searchFields.map((field) => {
          const key = field.name as keyof typeof optionMap;

          const options = optionMap[key];
          if (options) {
            // Verificamos si encontramos opciones para este campo
            return {
              ...field,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              options: options.map((t: any) => ({
                value: t[key],
                label: t.name ?? 'Sin nombre'
              }))
            };
          }
          return field; // Si no hay opciones (como en 'invoiceElectronic'), lo devolvemos como está
        });
      },
      error: (err) => {
        console.error('Error loading related data', err);
      }
    });
  }

  /**
   * Abrimos dialogo de creación de factura
   */
  openCreateDialog(): void {
    const isMobile = window.innerWidth <= 768;

    this._matDialog
      .open(CreateInvoiceDialogComponent, {
        width: isMobile ? '90vw' : '60vw',
        data: {
          editMode: false,
          relatedData: {
            invoiceType: this.getOptions('invoiceTypeId'),
            payType: this.getOptions('payTypeId'),
            paidType: this.getOptions('paidTypeId')
          }
        }
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.loadInvoices();
      });
  }

  /**
   * Abrimos dialogo de edición de factura
   */
  openEditDialog(invoiceId: number): void {
    const isMobile = window.innerWidth <= 768;

    this._matDialog
      .open(CreateInvoiceDialogComponent, {
        width: isMobile ? '90vw' : '60vw',
        data: {
          editMode: true,
          invoiceId: invoiceId,
          relatedData: {
            payType: this.getOptions('payTypeId'),
            paidType: this.getOptions('paidTypeId')
          }
        }
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.loadInvoices();
      });
  }

  /**
   * Obtenemos opciones para enviarselas a los dialogos y ahorrar peticiones
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getOptions(fieldName: string): any[] {
    const field = this.searchFields.find((f) => f.name === fieldName);
    return (
      field?.options?.map((opt) => ({
        [fieldName.replace('Id', '') + 'Id']: Number(opt.value),
        name: opt.label
      })) || []
    );
  }

  /**
   * Botón de buscar
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSearchSubmit(values: any): void {
    const formattedParams = { ...values };
    for (const key in formattedParams) {
      if (key.endsWith('Id') && formattedParams[key]) {
        formattedParams[key] = Number(formattedParams[key]);
      }
    }
    this.params = formattedParams;
    this.paginationParams.page = 1;
    this.loadInvoices();
  }

  /**
   * Botón para cambiar paginación
   */
  onChangePagination(event: PageEvent): void {
    this.paginationParams.page = event.pageIndex + 1;
    this.paginationParams.perPage = event.pageSize;
    this.loadInvoices();
  }

  /**
   * Botón para cambiar de tab en mobile
   */
  onTabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  /**
   * Método para saber si alguien escribe y busca
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSearchChange(form: any): void {
    this.showClearButton = !!form.length;
    this.params = form?.value;
    this.loadInvoices();
  }

  /**
   * Carga facturas de manera paginada
   */
  loadInvoices(filter: string = ''): void {
    this.loading = true;
    const query = {
      page: this.paginationParams.page,
      perPage: this.paginationParams.perPage,
      search: filter,
      ...this.params
    };

    this._invoiceService.getInvoiceWithPagination(query).subscribe({
      next: (res) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedData = res.data.map((invoice: any) => ({
          ...invoice,
          clientName: invoice.user
            ? `${invoice.user.firstName} ${invoice.user.lastName}`
            : '---',
          clientIdentification: invoice.user?.identificationNumber || '---',
          clientIdentificationType:
            invoice.user?.identificationType?.name || '---',
          employeeName: invoice.employee
            ? `${invoice.employee.firstName} ${invoice.employee.lastName}`
            : '---',
          taxeType: invoice.invoiceDetails?.[0]?.taxeType || null,
          // <-- CAMBIO: Normalizar el valor de invoiceElectronic a un booleano puro
          invoiceElectronic:
            invoice.invoiceElectronic === true ||
            invoice.invoiceElectronic === 'true' ||
            invoice.invoiceElectronic === 1
        }));

        this.dataSource.data = transformedData;
        this.paginationParams = res?.pagination;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error en la solicitud:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Método para eliminar factura
   */
  private deleteInvoice(invoiceId: number): void {
    this.loading = true;
    this._invoiceService.deleteInvoice(invoiceId).subscribe({
      next: () => {
        this.loadInvoices();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error en la solicitud:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Método para abrir dialogo de eliminar factura
   */
  openDeleteInvoiceDialog(id: number): void {
    const dialogRef = this._matDialog.open(YesNoDialogComponent, {
      data: {
        title: '¿Deseas eliminar esta factura?',
        message: 'Esta acción no se puede deshacer.'
      }
    });

    dialogRef.afterClosed().subscribe((confirm) => {
      if (confirm) {
        this.deleteInvoice(id);
      }
    });
  }

  /**
   * Método para validar que el Recepcionista o admin puedan eliminar o editar facturas
   */
  validateIfCanEditUserOrDelete(user: UserComplete): boolean {
    return (
      this.userLogged?.roleType?.name === 'Administrador' &&
      user.roleType?.name === 'Cliente'
    );
  }

  /**
   * Método imprimir factura
   */
  async onPrintInvoice(invoiceId: number): Promise<void> {
    const res = await this._invoicePrintService['_invoiceService']
      .getInvoiceToEdit(invoiceId)
      .toPromise();

    this.invoiceToPrintData = res?.data;

    setTimeout(() => {
      if (this.invoiceToPrintRef?.nativeElement && this.invoiceToPrintData) {
        this._invoicePrintService.printInvoice(
          this.invoiceToPrintData,
          this.invoiceToPrintRef.nativeElement
        );
      }
    }, 300);
  }

  /**
   * Método para descargar factura
   */
  async onDownloadInvoice(invoiceId: number): Promise<void> {
    const res = await this._invoicePrintService['_invoiceService']
      .getInvoiceToEdit(invoiceId)
      .toPromise();

    this.invoiceToPrintData = res?.data;

    setTimeout(() => {
      if (this.invoiceToPrintRef?.nativeElement && this.invoiceToPrintData) {
        this._invoicePrintService.downloadInvoice(
          this.invoiceToPrintData,
          this.invoiceToPrintRef.nativeElement
        );
      }
    }, 300);
  }
}
