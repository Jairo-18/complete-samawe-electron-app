import { AccommodationComplete } from './../../interface/accommodation.interface';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyFormatDirective } from '../../../shared/directives/currency-format.directive';
import { CreateAccommodationPanel } from '../../interface/accommodation.interface';
import { AccommodationsService } from '../../services/accommodations.service';
import {
  BedType,
  CategoryType,
  StateType
} from '../../../shared/interfaces/relatedDataGeneral';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { UppercaseDirective } from '../../../shared/directives/uppercase.directive';

@Component({
  selector: 'app-create-or-edit-accommodation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    NgFor,
    MatButtonModule,
    FontAwesomeModule,
    MatIcon,
    MatIconModule,
    CurrencyFormatDirective,
    SectionHeaderComponent,
    UppercaseDirective
  ],
  templateUrl: './create-or-edit-accommodation.component.html',
  styleUrl: './create-or-edit-accommodation.component.scss'
})
export class CreateOrEditAccommodationComponent implements OnChanges {
  @Input() stateTypes: StateType[] = [];
  @Input() bedTypes: BedType[] = [];
  @Input() currentAccommodation?: AccommodationComplete;
  @Output() accommodationSaved = new EventEmitter<void>();

  @Input()
  set categoryTypes(value: CategoryType[]) {
    this._categoryTypes = value;
    this.visibleCategoryTypes = value.filter((c) =>
      ['Hospedaje', 'HOSPEDAJE'].includes(c.name)
    );

    // CLAVE: Si ya tenemos un alojamiento cargado y ahora llegan las categorías,
    // actualizamos el formulario
    if (this.currentAccommodation && this.visibleCategoryTypes.length > 0) {
      this.updateFormWithAccommodation(this.currentAccommodation);
    }

    // Si estamos en modo edición por URL y ahora tenemos categorías,
    // reintentamos cargar el alojamiento
    if (this.pendingAccommodationId && this.visibleCategoryTypes.length > 0) {
      this.getAccommodationToEdit(this.pendingAccommodationId);
      this.pendingAccommodationId = null;
    }

    this.cdr.detectChanges();
  }

  get categoryTypes(): CategoryType[] {
    return this._categoryTypes;
  }

  private _categoryTypes: CategoryType[] = [];
  visibleCategoryTypes: CategoryType[] = [];
  accommodationForm!: FormGroup;
  accommodationId: number = 0;
  isEditMode: boolean = false;
  private pendingAccommodationId: number | null = null; // Para manejar carga tardía

  private readonly _accommodationService: AccommodationsService = inject(
    AccommodationsService
  );
  private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly _router: Router = inject(Router);

  constructor(private _fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.accommodationForm = this._fb.group({
      categoryTypeId: [null, Validators.required],
      bedTypeId: [null, Validators.required],
      code: ['', Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.maxLength(250)],
      amountPerson: [
        1,
        [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(1)]
      ],
      jacuzzi: [false, Validators.required],
      amountRoom: [
        0,
        [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(0)]
      ],
      amountBathroom: [
        0,
        [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(0)]
      ],
      priceBuy: [
        0,
        [Validators.pattern(/^\d+(\.\d{1,2})?$/), Validators.min(0.0)]
      ],
      priceSale: [
        0,
        [Validators.pattern(/^\d+(\.\d{1,2})?$/), Validators.min(0.0)]
      ],
      stateTypeId: [null, Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentAccommodation']) {
      const queryParams = this._activatedRoute.snapshot.queryParams;

      if (this.currentAccommodation) {
        this.accommodationId = this.currentAccommodation.accommodationId;
        this.isEditMode = true;

        // Solo actualizamos si ya tenemos las categorías cargadas
        if (this.visibleCategoryTypes.length > 0) {
          this.updateFormWithAccommodation(this.currentAccommodation);
        }
        // Si no hay categorías aún, se actualizará cuando lleguen en el setter
      } else if (queryParams['editAccommodation'] === 'true') {
        // Crear nuevo alojamiento
        this.isEditMode = false;
        this.accommodationId = 0;
        this.resetFormToDefaults();
      } else if (!isNaN(+queryParams['editAccommodation'])) {
        // Editar por ID desde URL
        this.accommodationId = Number(queryParams['editAccommodation']);
        this.isEditMode = true;

        // Si ya tenemos categorías, cargamos el alojamiento inmediatamente
        if (this.visibleCategoryTypes.length > 0) {
          this.getAccommodationToEdit(this.accommodationId);
        } else {
          // Si no hay categorías aún, guardamos el ID para cargar después
          this.pendingAccommodationId = this.accommodationId;
        }
      }
    }
  }

  private updateFormWithAccommodation(
    accommodation: AccommodationComplete
  ): void {
    this.accommodationForm.patchValue({
      categoryTypeId: accommodation.categoryType?.categoryTypeId,
      bedTypeId: accommodation.bedType?.bedTypeId,
      code: accommodation.code,
      name: accommodation.name,
      description: accommodation.description,
      amountPerson: accommodation.amountPerson ?? 1,
      jacuzzi: accommodation.jacuzzi ?? false,
      amountRoom: accommodation.amountRoom ?? 0,
      amountBathroom: accommodation.amountBathroom ?? 0,
      priceBuy: accommodation.priceBuy,
      priceSale: accommodation.priceSale,
      stateTypeId: accommodation.stateType?.stateTypeId
    });
    this.cdr.detectChanges();
  }

  private resetFormToDefaults(): void {
    this.accommodationForm.reset({
      categoryTypeId: null,
      bedTypeId: null,
      code: '',
      name: '',
      description: '',
      amountPerson: 1,
      jacuzzi: false,
      amountRoom: 0,
      amountBathroom: 0,
      priceBuy: 0,
      priceSale: 0,
      stateTypeId: null
    });
    this.cdr.detectChanges();
  }

  resetForm() {
    this.resetFormToDefaults();
    Object.keys(this.accommodationForm.controls).forEach((key) => {
      const control = this.accommodationForm.get(key);
      control?.setErrors(null);
    });
    this.isEditMode = false;
    this._router.navigate([], {
      queryParams: {},
      queryParamsHandling: '',
      replaceUrl: true
    });
    this.cdr.detectChanges();
  }

  private getAccommodationToEdit(accommodationId: number): void {
    this._accommodationService
      .getAccommodationEditPanel(accommodationId)
      .subscribe({
        next: (res) => {
          const accommodation = res.data;
          this.accommodationId = accommodation.accommodationId;

          // Actualizamos el formulario con los datos del alojamiento
          this.updateFormWithAccommodation(accommodation);
        },
        error: (err) => {
          console.error(
            'Error al obtener hospedaje:',
            err.error?.message || err
          );
        }
      });
  }

  save() {
    if (this.accommodationForm.valid) {
      const formValue = this.accommodationForm.value;

      const accommodationSave: CreateAccommodationPanel = {
        accommodationId: this.isEditMode ? this.accommodationId : undefined,
        code: formValue.code,
        name: formValue.name,
        description: formValue.description,
        amountPerson: Math.trunc(Number(formValue.amountPerson)),
        jacuzzi: formValue.jacuzzi,
        amountRoom: Math.trunc(Number(formValue.amountRoom)),
        amountBathroom: Math.trunc(Number(formValue.amountBathroom)),
        priceBuy: Math.abs(Number(formValue.priceBuy)),
        priceSale: Math.abs(Number(formValue.priceSale)),
        categoryTypeId: formValue.categoryTypeId,
        bedTypeId: formValue.bedTypeId,
        stateTypeId: formValue.stateTypeId
      };

      if (this.isEditMode) {
        const updateData = { ...accommodationSave };
        delete updateData.accommodationId;

        this._accommodationService
          .updateAccommodationPanel(this.accommodationId, updateData)
          .subscribe({
            next: () => {
              this.accommodationSaved.emit();
              this.resetForm();
            },
            error: (error) => {
              console.error('Error al actualizar el hospedaje', error);
            }
          });
      } else {
        this._accommodationService
          .createAccommodationPanel(accommodationSave)
          .subscribe({
            next: () => {
              this.accommodationSaved.emit();
              this.resetForm();
            },
            error: (err) => {
              if (err.error && err.error.message) {
                console.error(
                  'Error al registrar hospedaje:',
                  err.error.message
                );
              } else {
                console.error('Error desconocido:', err);
              }
            }
          });
      }
    } else {
      console.error('Formulario no válido', this.accommodationForm);
      this.accommodationForm.markAllAsTouched();
    }
  }
}
