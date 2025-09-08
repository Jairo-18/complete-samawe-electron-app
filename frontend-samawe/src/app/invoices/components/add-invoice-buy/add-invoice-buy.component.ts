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
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  CategoryType,
  TaxeType
} from '../../../shared/interfaces/relatedDataGeneral';
import { ProductsService } from '../../../service-and-product/services/products.service';
import { debounceTime, of, switchMap } from 'rxjs';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { InvoiceDetaillService } from '../../services/invoiceDetaill.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AddedProductInvoiceDetaill,
  CreateInvoiceDetaill
} from '../../interface/invoiceDetaill.interface';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyFormatDirective } from '../../../shared/directives/currency-format.directive';

@Component({
  selector: 'app-add-invoice-buy',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatOptionModule,
    MatAutocompleteModule,
    CommonModule,
    MatSelectModule,
    MatIcon,
    MatProgressSpinnerModule,
    CurrencyFormatDirective
  ],
  templateUrl: './add-invoice-buy.component.html',
  styleUrl: './add-invoice-buy.component.scss'
})
export class AddInvoiceBuyComponent implements OnInit {
  @Input() categoryTypes: CategoryType[] = [];
  @Input() taxeTypes: TaxeType[] = [];
  @Output() itemSaved = new EventEmitter<void>();
  private readonly _producsService: ProductsService = inject(ProductsService);
  private readonly _invoiceDetaillService: InvoiceDetaillService = inject(
    InvoiceDetaillService
  );
  private readonly _activateRouter: ActivatedRoute = inject(ActivatedRoute);
  private readonly _router: Router = inject(Router);
  private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly _fb: FormBuilder = inject(FormBuilder);
  isLoading: boolean = false;
  invoiceId?: number;
  form: FormGroup;
  filteredProducts: AddedProductInvoiceDetaill[] = [];

  ngOnInit(): void {
    const id = this._activateRouter.snapshot.paramMap.get('id');
    if (id) {
      this.invoiceId = Number(id);
    }

    // Recalcular total cuando cambien entradas relevantes
    this.form
      .get('amountSale')
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

  constructor() {
    this.form = this._fb.group({
      name: ['', Validators.required],
      productId: [null, Validators.required],
      priceSale: [
        0,
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern(/^\d+([.,]\d{1,2})?$/)
        ]
      ],
      priceBuy: [0, [Validators.required, Validators.min(0)]],
      priceWithoutTax: [0, Validators.required],
      taxeTypeId: [3],
      amountSale: [1, [Validators.required, Validators.min(1)]],
      finalPrice: [0],
      amount: [0]
    });

    // Listener para sincronizar priceSale con priceWithoutTax (normalizando)
    this.form.get('priceSale')?.valueChanges.subscribe((value) => {
      const numericValue = this.parseNumber(value);
      this.form.patchValue(
        { priceWithoutTax: numericValue },
        { emitEvent: false }
      );
      this.updateFinalPrice();
    });

    this.form
      .get('name')
      ?.valueChanges.pipe(
        debounceTime(500),
        switchMap((name: string) => {
          if (!name || name.trim().length < 2) {
            return of({ data: [] });
          }
          return this._producsService.getProductWithPagination({ name });
        })
      )
      .subscribe((res) => {
        this.filteredProducts = res.data ?? [];
      });
  }

  /**
   * Robust parseNumber:
   * - Soporta formatos: "1.234,56"  (EU), "1,234.56" (US) y "4000.00"
   * - Detecta cuál separador está actuando como decimal (el que aparece más a la derecha)
   * - Elimina símbolos/espacios no numéricos
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseNumber(value: any): number {
    if (value == null) return 0;
    if (typeof value === 'number' && Number.isFinite(value)) return value;

    let s = String(value).trim();

    // eliminar cualquier cosa que no sea dígito, punto, coma o signo negativo
    s = s.replace(/[^\d\-,.]/g, '');

    const hasDot = s.indexOf('.') !== -1;
    const hasComma = s.indexOf(',') !== -1;

    if (hasDot && hasComma) {
      // ambos presentes: el que esté más a la derecha es el decimal
      if (s.lastIndexOf('.') > s.lastIndexOf(',')) {
        // punto es decimal -> quitar comas (separador de miles)
        s = s.replace(/,/g, '');
      } else {
        // coma es decimal -> quitar puntos y reemplazar coma por punto
        s = s.replace(/\./g, '').replace(/,/g, '.');
      }
    } else if (hasComma && !hasDot) {
      // solo coma: asumimos coma decimal (1.234 -> improbable aquí)
      s = s.replace(/\./g, '').replace(/,/g, '.');
    } else {
      // solo punto o ninguno: asumimos punto decimal (estilo "4000.00")
      // pero puede haber espacios o símbolos ya eliminados
      s = s.replace(/,/g, ''); // quitar comas residuales
    }

    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
  }

  getInvoiceIdFromRoute(route: ActivatedRoute): string | null {
    let currentRoute: ActivatedRoute | null = route;
    while (currentRoute) {
      const id = currentRoute.snapshot.paramMap.get('id');
      if (id) return id;
      currentRoute = currentRoute.parent;
    }
    return null;
  }

  onProductFocus(): void {
    if (!this.filteredProducts.length) {
      this._producsService.getProductWithPagination({}).subscribe((res) => {
        this.filteredProducts = res.data ?? [];
      });
    }
  }

  onProductSelected(name: string): void {
    const product = this.filteredProducts.find((p) => p.name === name);
    if (!product) return;

    const currentPriceSale = this.parseNumber(
      this.form.get('priceSale')?.value
    );
    const shouldUpdatePrice = !currentPriceSale || currentPriceSale === 0;

    this.form.patchValue({
      productId: product.productId,
      ...(shouldUpdatePrice && {
        priceSale: product.priceSale,
        priceWithoutTax: product.priceSale
      }),
      priceBuy: product.priceBuy ?? 0,
      amount: product.amount,
      categoryId: product.categoryTypeId
    });

    this.updateFinalPrice();
  }

  resetForm(): void {
    this.form.reset({
      name: '',
      productId: null,
      priceSale: 0,
      priceBuy: 0,
      priceWithoutTax: 0,
      taxeTypeId: 3,
      amountSale: 1,
      amount: 0,
      categoryId: null,
      finalPrice: 0
    });

    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      control?.setErrors(null);
    });

    this._router.navigate([], {
      queryParams: {},
      queryParamsHandling: '',
      replaceUrl: true
    });

    this._cdr.detectChanges();
  }

  private getTaxRate(): number {
    const id = this.form.get('taxeTypeId')?.value;
    const tax = this.taxeTypes?.find((t) => t.taxeTypeId === id);
    if (!tax || tax.percentage == null) return 0;

    let rate =
      typeof tax.percentage === 'string'
        ? parseFloat(tax.percentage)
        : tax.percentage;

    if (!isFinite(rate) || rate < 0) return 0;
    if (rate > 1) rate = rate / 100;
    return rate;
  }

  /** Calcula: (precio_sin_IVA * (1+IVA)) * cantidad */
  private updateFinalPrice() {
    const base = this.parseNumber(
      this.form.get('priceWithoutTax')?.value ??
        this.form.get('priceSale')?.value ??
        0
    );
    const amountSale = this.parseNumber(
      this.form.get('amountSale')?.value ?? 0
    );
    const taxRate = this.getTaxRate();

    const unitWithTax = base * (1 + taxRate);
    const total = unitWithTax * amountSale;

    this.form.patchValue(
      { finalPrice: this.round(total, 2) },
      { emitEvent: false }
    );
  }

  private round(n: number, d = 2): number {
    const p = Math.pow(10, d);
    return Math.round((n + Number.EPSILON) * p) / p;
  }

  clearProductSelection(): void {
    this.form.patchValue({
      name: '',
      productId: null,
      priceBuy: 0,
      priceWithoutTax: this.parseNumber(this.form.get('priceSale')?.value) || 0,
      categoryId: null
    });

    this.filteredProducts = [];
  }

  addProduct(): void {
    if (!this.form.value.productId) {
      this.form.get('name')?.setErrors({ required: true });
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.warn(
            `  - ${key} inválido | value=`,
            control.value,
            '| errors=',
            control.errors
          );
        }
      });
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMinutes(endDate.getMinutes() + 5);

    const invoiceDetailPayload: CreateInvoiceDetaill = {
      productId: formValue.productId,
      accommodationId: 0,
      excursionId: 0,
      amount: this.parseNumber(formValue.amountSale),
      priceBuy: this.parseNumber(formValue.priceBuy),
      priceWithoutTax: this.parseNumber(formValue.priceWithoutTax),
      taxeTypeId: formValue.taxeTypeId,
      startDate: now.toISOString(),
      endDate: endDate.toISOString()
    };

    if (!this.invoiceId) {
      console.error('❌ No hay invoiceId definido');
      return;
    }

    this.isLoading = true;
    this._invoiceDetaillService
      .createInvoiceDetaill(this.invoiceId, invoiceDetailPayload)
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
