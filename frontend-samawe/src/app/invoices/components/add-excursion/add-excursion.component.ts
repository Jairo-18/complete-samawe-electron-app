import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {
  CategoryType,
  TaxeType
} from '../../../shared/interfaces/relatedDataGeneral';
import { InvoiceDetaillService } from '../../services/invoiceDetaill.service';
import { ExcursionsService } from '../../../service-and-product/services/excursions.service';
import {
  AddedExcursionInvoiceDetaill,
  CreateInvoiceDetaill
} from '../../interface/invoiceDetaill.interface';
import { debounceTime, of, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { DatePickerComponent } from '../../../shared/components/date-picker/date-picker.component';

@Component({
  selector: 'app-add-excursion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatButtonModule,
    CommonModule,
    MatIcon,
    MatProgressSpinnerModule
    // DatePickerComponent
  ],
  templateUrl: './add-excursion.component.html',
  styleUrl: './add-excursion.component.scss'
})
export class AddExcursionComponent implements OnInit {
  @Input() categoryTypes: CategoryType[] = [];
  @Input() taxeTypes: TaxeType[] = [];
  @Output() itemSaved = new EventEmitter<void>();

  private readonly _excursionsService: ExcursionsService =
    inject(ExcursionsService);
  private readonly _invoiceDetaillService: InvoiceDetaillService = inject(
    InvoiceDetaillService
  );
  private readonly _activateRouter: ActivatedRoute = inject(ActivatedRoute);
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _router: Router = inject(Router);
  private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  form: FormGroup;
  isLoading: boolean = false;
  filteredExcursions: AddedExcursionInvoiceDetaill[] = [];
  isLoadingExcursions: boolean = false;
  invoiceId?: number;

  ngOnInit(): void {
    const id = this._activateRouter.snapshot.paramMap.get('id');
    if (id) {
      this.invoiceId = Number(id);
      console.log('✅ Invoice ID obtenido:', this.invoiceId);
    }
  }

  constructor() {
    this.form = this._fb.group({
      name: ['', Validators.required],
      excursionId: [null, Validators.required],
      priceSale: [{ value: '', disabled: true }],
      priceWithoutTax: [null, Validators.required],
      taxeTypeId: [2],
      amount: [1, [Validators.required, Validators.min(1)]]
    });

    this.form
      .get('name')
      ?.valueChanges.pipe(
        debounceTime(500),
        switchMap((name: string) => {
          if (!name || name.trim().length < 2) return of({ data: [] });
          return this._excursionsService.getExcursionWithPagination({ name });
        })
      )
      .subscribe((res) => {
        this.filteredExcursions = res.data ?? [];
      });
  }

  onExcursionFocus() {
    if (!this.filteredExcursions.length) {
      this._excursionsService
        .getExcursionWithPagination({})
        .subscribe((res) => {
          this.filteredExcursions = res.data ?? [];
        });
    }
  }

  onExcursionSelected(name: string) {
    const exc = this.filteredExcursions.find((e) => e.name === name);
    if (!exc) return;

    this.form.patchValue({
      excursionId: exc.excursionId,
      priceWithoutTax: exc.priceSale,
      priceSale: exc.priceSale
    });
  }

  private getInvoiceIdFromRoute(route: ActivatedRoute): string | null {
    let current = route;
    while (current) {
      const id = current.snapshot.paramMap.get('id');
      if (id) return id;
      current = current.parent!;
    }
    return null;
  }

  resetForm() {
    this.form.reset();
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      control?.setErrors(null);
    });

    this.form.patchValue({
      taxeTypeId: 2,
      amount: 1
    });

    this._router.navigate([], {
      queryParams: {},
      queryParamsHandling: '',
      replaceUrl: true
    });

    this._cdr.detectChanges();
  }

  clearExcursionSelection(): void {
    this.form.patchValue({
      name: '',
      excursionId: null,
      priceSale: 0,
      priceWithoutTax: 0
    });

    this.filteredExcursions = [];
  }

  addExcursion(): void {
    if (!this.form.value.excursionId) {
      this.form.get('name')?.setErrors({ required: true });
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.valid) {
      const formValue = this.form.value;

      // ✅ Generar fecha actual en el momento del envío
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 60000);

      const payload: CreateInvoiceDetaill = {
        productId: 0,
        accommodationId: 0,
        excursionId: formValue.excursionId,
        amount: formValue.amount,
        priceBuy: Number(formValue.priceBuy) || 0,
        priceWithoutTax: Number(formValue.priceWithoutTax),
        taxeTypeId: formValue.taxeTypeId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };

      if (!this.invoiceId) {
        console.error('❌ No hay invoiceId definido');
        return;
      }

      this.isLoading = true;
      this._invoiceDetaillService
        .createInvoiceDetaill(this.invoiceId, payload)
        .subscribe({
          next: () => {
            this.resetForm();
            this.isLoading = false;
            this.itemSaved.emit();
          },
          error: (err) => {
            console.error('❌ Error al guardar detalle:', err);
            this.isLoading = false;
          }
        });
    }
  }
}
