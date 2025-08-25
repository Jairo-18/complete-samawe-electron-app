import { Component, inject, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InvoiceService } from '../../services/invoice.service';
import {
  InvoiceType,
  PaidType,
  PayType
} from '../../../shared/interfaces/relatedDataGeneral';
import { CreateUserPanel } from '../../../organizational/interfaces/create.interface';
import { MatButtonModule } from '@angular/material/button';
import { BaseDialogComponent } from '../../../shared/components/base-dialog/base-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
  catchError,
  map,
  startWith
} from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { DialogData, InvoiceComplete } from '../../interface/invoice.interface';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { Router } from '@angular/router';
import { PaginationPartialService } from '../../../shared/services/paginationPartial.service';
import { PaginatedUserPartial } from '../../../shared/interfaces/paginatedPartial.interface';

@Component({
  selector: 'app-create-invoice-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    BaseDialogComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatOptionModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatIconModule,
    LoaderComponent
  ],
  templateUrl: './create-invoice-dialog.component.html',
  styleUrls: ['./create-invoice-dialog.component.scss']
})
export class CreateInvoiceDialogComponent implements OnInit {
  form: FormGroup;
  invoiceTypes: InvoiceType[] = [];
  paidTypes: PaidType[] = [];
  payTypes: PayType[] = [];
  filteredClients: PaginatedUserPartial[] = [];
  clientFilterControl = new FormControl<string | CreateUserPanel>('');
  isLoadingClients = false;
  isLoading = false;

  private readonly _dialogRef = inject(
    MatDialogRef<CreateInvoiceDialogComponent>
  );
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _invoiceService: InvoiceService = inject(InvoiceService);
  private readonly _paginationPartialService: PaginationPartialService = inject(
    PaginationPartialService
  );
  private readonly _router: Router = inject(Router);

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.form = this._fb.group({
      invoiceTypeId: ['', Validators.required],
      userId: ['', Validators.required],
      invoiceElectronic: [false, Validators.required],
      paidTypeId: ['', Validators.required],
      payTypeId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.invoiceTypes = this.data.relatedData.invoiceType;
    this.paidTypes = this.data.relatedData.paidType;
    this.payTypes = this.data.relatedData.payType;

    if (this.data.editMode && this.data.invoiceId) {
      this.loadInvoiceData(this.data.invoiceId);
      this.disableNonEditableFields();
    } else {
      this.setupClientAutocomplete();
    }
  }

  private loadInvoiceData(invoiceId: number): void {
    this.isLoading = true;
    this._invoiceService.getInvoiceToEdit(invoiceId).subscribe({
      next: (res) => {
        if (res.data) {
          this.patchForm(res.data);
        }
        this.isLoading = false;
      },
      error: () => {
        this._dialogRef.close();
      }
    });
  }

  private patchForm(invoice: InvoiceComplete): void {
    this.form.patchValue({
      invoiceTypeId: invoice.invoiceType?.invoiceTypeId,
      userId: invoice.user?.userId,
      invoiceElectronic: invoice.invoiceElectronic,
      payTypeId: invoice.payType?.payTypeId,
      paidTypeId: invoice.paidType?.paidTypeId
    });

    if (invoice.user) {
      const clientForDisplay: Partial<CreateUserPanel> = {
        userId: invoice.user.userId,
        firstName: invoice.user.firstName,
        lastName: invoice.user.lastName,
        identificationNumber: invoice.user.identificationNumber
      };
      this.clientFilterControl.setValue(clientForDisplay as CreateUserPanel);
    }
  }

  private disableNonEditableFields(): void {
    this.form.get('invoiceTypeId')?.disable();
    this.form.get('userId')?.disable();
    this.clientFilterControl.disable();
  }

  private setupClientAutocomplete(): void {
    this.clientFilterControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => {
          const query =
            typeof value === 'string' ? value : this.displayClient(value);
          if (!query || query.length < 2) {
            this.isLoadingClients = false;
            return of([]);
          }
          this.isLoadingClients = true;
          return this._paginationPartialService
            .getUserPartial({ search: query.trim(), page: 1 })
            .pipe(
              map((response) => response.data || []),
              catchError(() => of([]))
            );
        })
      )
      .subscribe((clients) => {
        this.filteredClients = clients;
        this.isLoadingClients = false;
      });
  }

  onClientFocus(): void {
    if (
      !this.filteredClients.length &&
      typeof this.clientFilterControl.value === 'string' &&
      !this.clientFilterControl.value
    ) {
      this.isLoadingClients = true;
      this._paginationPartialService
        .getUserPartial({ page: 1, perPage: 5 })
        .subscribe({
          next: (res) => {
            this.filteredClients = res.data || [];
            this.isLoadingClients = false;
          },
          error: (err) => {
            console.error('Error loading initial clients:', err);
            this.isLoadingClients = false;
          }
        });
    }
  }

  onClientSelected(event: MatAutocompleteSelectedEvent): void {
    const client = event.option.value as CreateUserPanel;
    this.form.patchValue({
      userId: client.userId
    });
  }

  clearClientSelection(): void {
    this.form.patchValue({ userId: '' });
    this.clientFilterControl.setValue('');
  }

  get showNoResultsMessage(): boolean {
    const value = this.clientFilterControl.value;
    const searchText = typeof value === 'string' ? value : '';
    return (
      !this.isLoadingClients &&
      this.filteredClients.length === 0 &&
      !!searchText &&
      searchText.length >= 2
    );
  }

  displayClient(client: CreateUserPanel | null): string {
    return client
      ? `${client.firstName || ''} ${client.lastName || ''}`.trim()
      : '';
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.isLoading = true;
    if (this.data.editMode) {
      this.updateInvoice();
    } else {
      this.createInvoice();
    }
  }

  private updateInvoice(): void {
    console.log('Actualizando con ID', this.data.invoiceId);
    if (!this.data.invoiceId) return;

    const formValue = this.form.getRawValue();

    const updatePayload = {
      invoiceId: this.data.invoiceId, // ✅ Este campo es obligatorio para el backend
      payTypeId: formValue.payTypeId,
      paidTypeId: formValue.paidTypeId,
      invoiceElectronic: formValue.invoiceElectronic
    };

    this._invoiceService
      .updateInvoice(this.data.invoiceId, updatePayload)
      .subscribe({
        next: () => {
          this._dialogRef.close(true);
        }
      });
  }

  private createInvoice(): void {
    const payload = {
      ...this.form.value,
      userId: this.form.get('userId')?.value,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    };

    this._invoiceService.createInvoice(payload).subscribe({
      next: (res) => {
        this._router.navigateByUrl(`/invoice/invoices/${res.data.rowId}/edit`);
        this._dialogRef.close(res.data.rowId);
      }
    });
  }

  cancel(): void {
    this._dialogRef.close(null);
  }
}
