import {
  ChangeDetectionStrategy,
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
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { debounceTime, of, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CategoryType,
  TaxeType,
  DiscountType,
  AdditionalType
} from '../../../shared/interfaces/relatedDataGeneral';
import { AccommodationsService } from '../../../service-and-product/services/accommodations.service';
import {
  AddedAccommodationInvoiceDetaill,
  CreateInvoiceDetaill
} from '../../interface/invoiceDetaill.interface';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { InvoiceDetaillService } from '../../services/invoiceDetaill.service';
import { TypesService } from '../../../organizational/services/types.service';
import { CurrencyFormatDirective } from '../../../shared/directives/currency-format.directive';

@Component({
  selector: 'app-add-accommodation',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    CommonModule,
    MatSelectModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatIcon,
    MatProgressSpinnerModule,
    MatTimepickerModule,
    MatDatepickerModule,
    CurrencyFormatDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-accommodation.component.html',
  styleUrl: './add-accommodation.component.scss'
})
export class AddAccommodationComponent implements OnInit {
  @Input() categoryTypes: CategoryType[] = [];
  @Input() taxeTypes: TaxeType[] = [];
  @Output() itemSaved = new EventEmitter<void>();

  private readonly _accommodationsService: AccommodationsService = inject(
    AccommodationsService
  );
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _router: Router = inject(Router);
  private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly _activateRouter: ActivatedRoute = inject(ActivatedRoute);
  private readonly _invoiceDetaillService: InvoiceDetaillService = inject(
    InvoiceDetaillService
  );
  private readonly _typesService: TypesService = inject(TypesService);

  form: FormGroup;
  isLoading: boolean = false;
  filteredAccommodations: AddedAccommodationInvoiceDetaill[] = [];
  isLoadingAccommodations: boolean = false;
  value!: Date;
  invoiceId?: number;

  // Propiedades para discount y additional
  discountTypes: DiscountType[] = [];
  additionalTypes: AdditionalType[] = [];

  // Propiedades de precio
  originalPrice: number = 0; // Precio base del hospedaje
  subtotal: number = 0; // Precio con descuentos y adicionales
  taxAmount: number = 0; // Monto del IVA
  unitPrice: number = 0; // Precio unitario con IVA
  finalPrice: number = 0; // Precio total (unitario * cantidad)

  // Helper para usar parseFloat en el template
  parseFloat = parseFloat;

  ngOnInit() {
    const id = this._activateRouter.snapshot.paramMap.get('id');
    if (id) {
      this.invoiceId = Number(id);
    }

    // Suscribirse a cambios del formulario para recalcular precios
    this.form.valueChanges.subscribe((val) => {
      // Combinar fechas y horas
      if (val.startDate && val.startTime) {
        this.form.patchValue(
          {
            startDateTime: this.combineDateAndTime(val.startDate, val.startTime)
          },
          { emitEvent: false }
        );
      }

      if (val.endDate && val.endTime) {
        this.form.patchValue(
          { endDateTime: this.combineDateAndTime(val.endDate, val.endTime) },
          { emitEvent: false }
        );
      }

      // Recalcular precio cuando cambien discount, additional, taxe o cantidad
      this.calculateFinalPrice();
    });

    this.loadDiscountTypes();
    this.loadAdditionalTypes();
  }

  constructor() {
    const now = new Date();

    this.form = this._fb.group({
      name: ['', Validators.required],
      accommodationId: [null, Validators.required],
      priceSale: [0],
      priceWithoutTax: [null, Validators.required],
      taxeTypeId: [2],
      amount: [1, [Validators.required, Validators.min(1)]],

      startDate: [now, Validators.required],
      startTime: [now, Validators.required],
      endDate: [null, Validators.required],
      endTime: [null, Validators.required],
      amountPerson: [0],
      amountBathroom: [0],

      startDateTime: [null, Validators.required],
      endDateTime: [null, Validators.required],

      // Nuevos campos
      discountTypeId: [null],
      additionalTypeId: [null],
      unitPrice: [0], // Precio unitario con IVA
      finalPrice: [0] // Precio total final
    });

    this.form
      .get('name')
      ?.valueChanges.pipe(
        debounceTime(500),
        switchMap((name: string) => {
          if (!name || name.trim().length < 2) return of({ data: [] });
          return this._accommodationsService.getAccommodationWithPagination({
            name
          });
        })
      )
      .subscribe((res) => {
        this.filteredAccommodations = res.data ?? [];
      });
  }

  displayAccommodation(acc?: AddedAccommodationInvoiceDetaill): string {
    return acc ? acc.name : '';
  }

  loadDiscountTypes() {
    this._typesService.getAllDiscountTypes().subscribe({
      next: (res) => {
        this.discountTypes = res.data || [];
        this._cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando discountTypes', err)
    });
  }

  loadAdditionalTypes() {
    this._typesService.getAllAdditionalTypes().subscribe({
      next: (res) => {
        this.additionalTypes = res.data || [];
        this._cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando additionalTypes', err)
    });
  }

  calculateFinalPrice() {
    const formValue = this.form.value;

    // 1. Empezar con el precio original
    let basePrice =
      typeof this.originalPrice === 'string'
        ? parseFloat(this.originalPrice)
        : this.originalPrice;

    // 2. Aplicar descuento si existe
    if (formValue.discountTypeId) {
      const discount = this.discountTypes.find(
        (d) => d.discountTypeId === formValue.discountTypeId
      );
      if (discount) {
        const discountAmount = basePrice * parseFloat(discount.percent);
        basePrice = basePrice - discountAmount;
      }
    }

    // 3. Aplicar adicional si existe
    if (formValue.additionalTypeId) {
      const additional = this.additionalTypes.find(
        (a) => a.additionalTypeId === formValue.additionalTypeId
      );
      if (additional) {
        const additionalValue =
          typeof additional.value === 'string'
            ? parseFloat(additional.value)
            : additional.value;
        basePrice = basePrice + additionalValue;
      }
    }

    // 4. Este es el subtotal (sin IVA)
    this.subtotal = basePrice;

    // 5. Calcular el IVA
    const selectedTax = this.taxeTypes.find(
      (t) => t.taxeTypeId === formValue.taxeTypeId
    );

    let taxPercent = 0;
    if (selectedTax && selectedTax.percentage) {
      taxPercent =
        typeof selectedTax.percentage === 'string'
          ? parseFloat(selectedTax.percentage)
          : selectedTax.percentage;
    }

    this.taxAmount = this.subtotal * taxPercent;

    // 6. Precio unitario con IVA
    this.unitPrice = this.subtotal + this.taxAmount;

    // 7. Precio total (unitario * cantidad)
    const amount = formValue.amount || 1;
    this.finalPrice = this.unitPrice * amount;

    // Actualizar los campos del formulario
    this.form.patchValue(
      {
        priceWithoutTax: this.subtotal,
        unitPrice: this.unitPrice,

        finalPrice: this.finalPrice
      },
      { emitEvent: false }
    );

    this._cdr.detectChanges();
  }

  // Métodos helper para el template
  getSelectedDiscountType(): DiscountType | undefined {
    const discountId = this.form.get('discountTypeId')?.value;
    if (!discountId) return undefined;
    return this.discountTypes.find((d) => d.discountTypeId === discountId);
  }

  getSelectedAdditionalType(): AdditionalType | undefined {
    const additionalId = this.form.get('additionalTypeId')?.value;
    if (!additionalId) return undefined;
    return this.additionalTypes.find(
      (a) => a.additionalTypeId === additionalId
    );
  }

  getSelectedTaxType(): TaxeType | undefined {
    const taxId = this.form.get('taxeTypeId')?.value;
    if (!taxId) return undefined;
    return this.taxeTypes.find((t) => t.taxeTypeId === taxId);
  }

  getDiscountAmount(): number {
    const discount = this.getSelectedDiscountType();
    if (!discount) return 0;
    const basePrice =
      typeof this.originalPrice === 'string'
        ? parseFloat(this.originalPrice)
        : this.originalPrice;
    return basePrice * parseFloat(discount.percent);
  }

  getAdditionalAmount(): number {
    const additional = this.getSelectedAdditionalType();
    if (!additional) return 0;
    return typeof additional.value === 'string'
      ? parseFloat(additional.value)
      : additional.value;
  }

  getTaxPercentage(): number {
    const tax = this.getSelectedTaxType();
    if (!tax || !tax.percentage) return 0;
    return typeof tax.percentage === 'string'
      ? parseFloat(tax.percentage) * 100
      : tax.percentage * 100;
  }

  combineDateAndTime(date: Date, time: Date): Date {
    const d = new Date(date);
    const t = new Date(time);
    d.setHours(t.getHours(), t.getMinutes(), 0, 0);
    return d;
  }

  onAccommodationFocus() {
    if (!this.filteredAccommodations.length) {
      this._accommodationsService
        .getAccommodationWithPagination({})
        .subscribe((res) => {
          this.filteredAccommodations = res.data ?? [];
        });
    }
  }

  onAccommodationSelected(acc: AddedAccommodationInvoiceDetaill) {
    if (!acc) return;

    // Validar y convertir precio a número
    const price =
      acc.priceSale && !isNaN(Number(acc.priceSale))
        ? Number(acc.priceSale)
        : 0;
    this.originalPrice = price;

    this.form.patchValue({
      name: acc, // aquí se guarda el objeto en el form, pero displayWith muestra solo el nombre
      accommodationId: acc.accommodationId,
      amountPerson: acc.amountPerson ?? 0,
      amountBathroom: acc.amountBathroom ?? 0,
      priceSale: price
    });

    this.calculateFinalPrice();
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
    const now = new Date();

    this.form.reset(
      {
        taxeTypeId: 2,
        amount: 1,
        startDate: now,
        startTime: now,
        endDate: now,
        endTime: now,
        finalPrice: 0,
        unitPrice: 0,
        discountTypeId: null,
        additionalTypeId: null,
        amountPerson: 0,
        amountBathroom: 0
      },
      { emitEvent: false }
    );

    // Resetear variables de precio
    this.originalPrice = 0;
    this.subtotal = 0;
    this.taxAmount = 0;
    this.unitPrice = 0;
    this.finalPrice = 0;

    this._router.navigate([], {
      queryParams: {},
      queryParamsHandling: '',
      replaceUrl: true
    });

    this._cdr.detectChanges();
  }

  clearAccommodationSelection(): void {
    this.form.patchValue({
      name: '',
      accommodationId: null,
      priceSale: 0,
      finalPrice: 0,
      unitPrice: 0,
      amountPerson: 0,
      amountBathroom: 0,
      priceWithoutTax: 0
    });

    this.originalPrice = 0;
    this.subtotal = 0;
    this.taxAmount = 0;
    this.unitPrice = 0;
    this.finalPrice = 0;
    this.filteredAccommodations = [];
    this._cdr.detectChanges();
  }

  addAccommodation(): void {
    if (!this.form.value.accommodationId) {
      this.form.get('name')?.setErrors({ required: true });
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.valid) {
      const formValue = this.form.value;

      // El precio a enviar es el subtotal (sin IVA)
      const priceToSend =
        this.subtotal && !isNaN(this.subtotal) && this.subtotal > 0
          ? this.subtotal
          : 0;

      const invoiceDetailPayload: CreateInvoiceDetaill = {
        productId: 0,
        excursionId: 0,
        accommodationId: formValue.accommodationId,
        amount: formValue.amount,
        priceBuy: Number(formValue.priceBuy) || 0,
        priceWithoutTax: Number(priceToSend), // Precio sin IVA
        taxeTypeId: formValue.taxeTypeId,
        startDate: new Date(formValue.startDateTime).toISOString(),
        endDate: new Date(formValue.endDateTime).toISOString()
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
}
