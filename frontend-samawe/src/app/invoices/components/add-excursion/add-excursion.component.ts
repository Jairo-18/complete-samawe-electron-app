import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  inject
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl
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
export class AddExcursionComponent {
  @Input() categoryTypes: CategoryType[] = [];
  @Input() taxeTypes: TaxeType[] = [];
  @Output() excursionAdded = new EventEmitter<void>();
  @Output() tempDetailAdded = new EventEmitter<CreateInvoiceDetaill>();

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

  constructor() {
    const now = new Date();
    const nowLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    this.form = this._fb.group({
      excursionName: ['', Validators.required],
      excursionId: [null, Validators.required],
      priceSale: [{ value: '', disabled: true }],
      priceWithoutTax: [null, Validators.required],
      amount: [1, [Validators.required, Validators.min(1)]],
      taxeTypeId: [null, Validators.required],
      startDate: new FormControl(null),
      endDate: [nowLocal, Validators.required]
    });

    this.form
      .get('excursionName')
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
      priceSale: exc.priceSale,
      taxeTypeId: exc.taxeTypeId
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
    const nowLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    this.form.reset();
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      control?.setErrors(null);
    });

    this.form.patchValue({
      amount: 1,
      startDate: nowLocal,
      endDate: nowLocal
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
      excursionName: '',
      excursionId: null,
      priceSale: 0,
      priceWithoutTax: 0
    });

    this.filteredExcursions = [];
  }

  addExcursion(): void {
    if (this.form.valid) {
      const formValue = this.form.value;

      const payload: CreateInvoiceDetaill = {
        productId: 0,
        accommodationId: 0,
        excursionId: formValue.excursionId,
        amount: formValue.amount,
        priceBuy: Number(formValue.priceBuy) || 0,
        priceWithoutTax: Number(formValue.priceWithoutTax),
        taxeTypeId: formValue.taxeTypeId,
        startDate: new Date(formValue.startDate).toISOString(),
        endDate: new Date(formValue.endDate).toISOString()
      };

      this.tempDetailAdded.emit(payload);
      this.resetForm();
    } else {
      console.log('Formulario inválido');
      this.form.markAllAsTouched();
    }
  }
}
