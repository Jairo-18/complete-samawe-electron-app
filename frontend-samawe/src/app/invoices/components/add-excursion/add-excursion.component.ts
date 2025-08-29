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
import { CurrencyFormatDirective } from '../../../shared/directives/currency-format.directive';

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
    MatProgressSpinnerModule,
    CurrencyFormatDirective
  ],
  templateUrl: './add-excursion.component.html',
  styleUrl: './add-excursion.component.scss'
})
export class AddExcursionComponent implements OnInit {
  @Input() categoryTypes: CategoryType[] = [];
  @Input() taxeTypes: TaxeType[] = [];
  @Output() itemSaved = new EventEmitter<void>();

  private readonly _excursionsService = inject(ExcursionsService);
  private readonly _invoiceDetaillService = inject(InvoiceDetaillService);
  private readonly _activateRouter = inject(ActivatedRoute);
  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _cdr = inject(ChangeDetectorRef);

  form: FormGroup;
  isLoading: boolean = false;
  filteredExcursions: AddedExcursionInvoiceDetaill[] = [];
  isLoadingExcursions: boolean = false;
  invoiceId?: number;

  constructor() {
    this.form = this._fb.group({
      name: ['', Validators.required],
      excursionId: [null, Validators.required],
      priceSale: [0], // Precio unitario base (normalmente SIN IVA)
      priceWithoutTax: [null, Validators.required], // Base sin IVA (lo que se envía)
      taxeTypeId: [2],
      amount: [1, [Validators.required, Validators.min(1)]],
      finalPrice: [0] // Total CON IVA (= unitario c/IVA * cantidad)
    });

    // Búsqueda con debounce
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

  ngOnInit(): void {
    const id = this._activateRouter.snapshot.paramMap.get('id');
    if (id) this.invoiceId = Number(id);

    // Recalcular total cuando cambien entradas relevantes
    this.form
      .get('amount')
      ?.valueChanges.subscribe(() => this.updateFinalPrice());
    this.form
      .get('priceSale')
      ?.valueChanges.subscribe(() => this.updateFinalPrice());
    this.form
      .get('priceWithoutTax')
      ?.valueChanges.subscribe(() => this.updateFinalPrice());
    this.form
      .get('taxeTypeId')
      ?.valueChanges.subscribe(() => this.updateFinalPrice());
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

    // Asumimos que priceSale es el precio base SIN IVA
    this.form.patchValue(
      {
        excursionId: exc.excursionId,
        priceWithoutTax: exc.priceSale,
        priceSale: exc.priceSale
      },
      { emitEvent: true }
    );

    this.updateFinalPrice();
  }

  /** Devuelve el impuesto como fracción (0.12 para 12%) */
  private getTaxRate(): number {
    const id = this.form.get('taxeTypeId')?.value;
    const tax = this.taxeTypes?.find((t) => t.taxeTypeId === id);
    if (!tax || tax.percentage == null) return 0;

    let rate =
      typeof tax.percentage === 'string'
        ? parseFloat(tax.percentage)
        : tax.percentage;

    if (!isFinite(rate) || rate < 0) return 0;
    // Si viene como 12 en lugar de 0.12, normalizar
    if (rate > 1) rate = rate / 100;
    return rate;
  }

  /** Calcula finalPrice = (precio_sin_IVA * (1+IVA)) * cantidad */
  private updateFinalPrice() {
    const base = Number(
      this.form.get('priceWithoutTax')?.value ??
        this.form.get('priceSale')?.value ??
        0
    );
    const amount = Number(this.form.get('amount')?.value ?? 0);
    const taxRate = this.getTaxRate();

    const unitWithTax = base * (1 + taxRate);
    const total = unitWithTax * amount;

    this.form.patchValue(
      { finalPrice: this.round(total, 2) },
      { emitEvent: false }
    );
  }

  private round(n: number, d = 2): number {
    const p = Math.pow(10, d);
    return Math.round((n + Number.EPSILON) * p) / p;
  }

  resetForm() {
    this.form.reset({
      taxeTypeId: 2,
      amount: 1,
      finalPrice: 0
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
      priceWithoutTax: 0,
      finalPrice: 0
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
      const formValue = this.form.getRawValue();

      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 60000);

      const payload: CreateInvoiceDetaill = {
        productId: 0,
        accommodationId: 0,
        excursionId: formValue.excursionId,
        amount: formValue.amount,
        priceBuy: 0,
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
