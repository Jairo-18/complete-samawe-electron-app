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
  TaxeType
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
    MatDatepickerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-accommodation.component.html',
  styleUrl: './add-accommodation.component.scss'
})
export class AddAccommodationComponent implements OnInit {
  @Input() categoryTypes: CategoryType[] = [];
  @Input() taxeTypes: TaxeType[] = [];
  @Output() accommodationAdded = new EventEmitter<void>();
  @Output() tempDetailAdded = new EventEmitter<CreateInvoiceDetaill>();

  private readonly _accommodationsService: AccommodationsService = inject(
    AccommodationsService
  );
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _router: Router = inject(Router);
  private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  form: FormGroup;
  isLoading: boolean = false;
  filteredAccommodations: AddedAccommodationInvoiceDetaill[] = [];
  isLoadingAccommodations: boolean = false;
  value!: Date;

  ngOnInit() {
    this.form.valueChanges.subscribe((val) => {
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
    });
  }

  constructor() {
    const now = new Date();

    this.form = this._fb.group({
      accommodationName: ['', Validators.required],
      accommodationId: [null, Validators.required],
      priceSale: [{ value: '', disabled: true }],
      priceWithoutTax: [null, Validators.required],
      taxeTypeId: [2],
      amount: [1, [Validators.required, Validators.min(1)]],

      startDate: [now, Validators.required],
      startTime: [now, Validators.required],
      endDate: [null, Validators.required],
      endTime: [null, Validators.required],

      startDateTime: [null, Validators.required],
      endDateTime: [null, Validators.required]
    });

    this.form
      .get('accommodationName')
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

  onAccommodationSelected(name: string) {
    const acc = this.filteredAccommodations.find((a) => a.name === name);
    if (!acc) return;

    this.form.patchValue({
      accommodationId: acc.accommodationId,
      priceWithoutTax: acc.priceSale,
      priceSale: acc.priceSale
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
    const now = new Date();

    this.form.reset();
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      control?.setErrors(null);
    });

    this.form.patchValue({
      taxeTypeId: 2,
      amount: 1,
      startDate: now,
      startTime: now,
      endDate: now,
      endTime: now
    });

    this._router.navigate([], {
      queryParams: {},
      queryParamsHandling: '',
      replaceUrl: true
    });

    this._cdr.detectChanges();
  }

  clearAccommodationSelection(): void {
    this.form.patchValue({
      accommodationName: '',
      accommodationId: null,
      priceSale: 0
    });

    this.filteredAccommodations = [];
  }

  addAccommodation(): void {
    if (this.form.valid) {
      const formValue = this.form.value;

      const invoiceDetailPayload: CreateInvoiceDetaill = {
        productId: 0,
        excursionId: 0,
        accommodationId: formValue.accommodationId,
        amount: formValue.amount,
        priceBuy: Number(formValue.priceBuy) || 0,
        priceWithoutTax: Number(formValue.priceWithoutTax),
        taxeTypeId: formValue.taxeTypeId,
        startDate: new Date(formValue.startDateTime).toISOString(),
        endDate: new Date(formValue.endDateTime).toISOString()
      };

      this.tempDetailAdded.emit(invoiceDetailPayload);
      this.resetForm();
    } else {
      console.log('Formulario inválido');
      this.form.markAllAsTouched();
    }
  }
}
