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
import {
  CategoryType,
  StateType
} from '../../../shared/interfaces/relatedDataGeneral';
import {
  CreateExcursionPanel,
  ExcursionComplete
} from '../../interface/excursion.interface';
import { ExcursionsService } from '../../services/excursions.service';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { UppercaseDirective } from '../../../shared/directives/uppercase.directive';

@Component({
  selector: 'app-create-or-edit-excursion',
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
  templateUrl: './create-or-edit-excursion.component.html',
  styleUrl: './create-or-edit-excursion.component.scss'
})
export class CreateOrEditExcursionComponent implements OnChanges {
  @Input() stateTypes: StateType[] = [];
  @Input() currentExcursion?: ExcursionComplete;
  @Output() excursionSaved = new EventEmitter<void>();

  @Input()
  set categoryTypes(value: CategoryType[]) {
    this._categoryTypes = value;
    this.visibleCategoryTypes = value.filter((c) =>
      ['Pasadía', 'Servicios', 'PASADIA', 'SERVICIOS'].includes(c.name)
    );

    // CLAVE: Si ya tenemos una excursión cargada y ahora llegan las categorías,
    // actualizamos el formulario
    if (this.currentExcursion && this.visibleCategoryTypes.length > 0) {
      this.updateFormWithExcursion(this.currentExcursion);
    }

    // Si estamos en modo edición por URL y ahora tenemos categorías,
    // reintentamos cargar la excursión
    if (this.pendingExcursionId && this.visibleCategoryTypes.length > 0) {
      this.getExcursionToEdit(this.pendingExcursionId);
      this.pendingExcursionId = null;
    }

    this.cdr.detectChanges();
  }

  get categoryTypes(): CategoryType[] {
    return this._categoryTypes;
  }

  private _categoryTypes: CategoryType[] = [];
  visibleCategoryTypes: CategoryType[] = [];
  excursionForm!: FormGroup;
  excursionId: number = 0;
  isEditMode: boolean = false;
  private pendingExcursionId: number | null = null; // Para manejar carga tardía

  private readonly _excursionService: ExcursionsService =
    inject(ExcursionsService);
  private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly _router: Router = inject(Router);

  constructor(private _fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.excursionForm = this._fb.group({
      categoryTypeId: [null, Validators.required],
      code: ['', Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.maxLength(250)],
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
    if (changes['currentExcursion']) {
      const queryParams = this._activatedRoute.snapshot.queryParams;

      // Si viene la excursión desde el padre
      if (this.currentExcursion) {
        this.excursionId = this.currentExcursion.excursionId;
        this.isEditMode = true;

        // Solo actualizamos si ya tenemos las categorías cargadas
        if (this.visibleCategoryTypes.length > 0) {
          this.updateFormWithExcursion(this.currentExcursion);
        }
        // Si no hay categorías aún, se actualizará cuando lleguen en el setter
      } else if (queryParams['editExcursion'] === 'true') {
        // Crear nueva excursión
        this.isEditMode = false;
        this.excursionId = 0;
        this.resetFormToDefaults();
      } else if (!isNaN(+queryParams['editExcursion'])) {
        // Editar por ID desde URL
        this.excursionId = Number(queryParams['editExcursion']);
        this.isEditMode = true;

        // Si ya tenemos categorías, cargamos la excursión inmediatamente
        if (this.visibleCategoryTypes.length > 0) {
          this.getExcursionToEdit(this.excursionId);
        } else {
          // Si no hay categorías aún, guardamos el ID para cargar después
          this.pendingExcursionId = this.excursionId;
        }
      }
    }
  }

  private updateFormWithExcursion(excursion: ExcursionComplete): void {
    this.excursionForm.patchValue({
      categoryTypeId: excursion.categoryType?.categoryTypeId,
      code: excursion.code,
      name: excursion.name,
      description: excursion.description,
      priceBuy: excursion.priceBuy,
      priceSale: excursion.priceSale,
      stateTypeId: excursion.stateType?.stateTypeId
    });
    this.cdr.detectChanges();
  }

  private resetFormToDefaults(): void {
    this.excursionForm.reset({
      categoryTypeId: null,
      code: '',
      name: '',
      description: '',
      priceBuy: 0,
      priceSale: 0,
      stateTypeId: null
    });
    this.cdr.detectChanges();
  }

  resetForm() {
    this.resetFormToDefaults();
    Object.keys(this.excursionForm.controls).forEach((key) => {
      const control = this.excursionForm.get(key);
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

  private getExcursionToEdit(excursionId: number): void {
    this._excursionService.getExcursionEditPanel(excursionId).subscribe({
      next: (res) => {
        const excursion = res.data;
        this.excursionId = excursion.excursionId;

        // Actualizamos el formulario con los datos de la excursión
        this.updateFormWithExcursion(excursion);
      },
      error: (err) => {
        console.error(
          'Error al obtener la pasadía:',
          err.error?.message || err
        );
      }
    });
  }

  save() {
    if (this.excursionForm.valid) {
      const formValue = this.excursionForm.value;

      const excursionSave: CreateExcursionPanel = {
        excursionId: this.isEditMode ? this.excursionId : undefined,
        code: formValue.code,
        name: formValue.name,
        description: formValue.description,
        priceBuy: Math.abs(Number(formValue.priceBuy)),
        priceSale: Math.abs(Number(formValue.priceSale)),
        categoryTypeId: formValue.categoryTypeId,
        stateTypeId: formValue.stateTypeId
      };

      if (this.isEditMode) {
        const updateData = { ...excursionSave };
        delete updateData.excursionId;

        this._excursionService
          .updateExcursionPanel(this.excursionId, updateData)
          .subscribe({
            next: () => {
              this.excursionSaved.emit();
              this.resetForm();
            },
            error: (error) => {
              console.error('Error al actualizar la pasadía', error);
            }
          });
      } else {
        this._excursionService.createExcursionPanel(excursionSave).subscribe({
          next: () => {
            this.excursionSaved.emit();
            this.resetForm();
          },
          error: (err) => {
            if (err.error && err.error.message) {
              console.error(
                'Error al registrar la pasadía:',
                err.error.message
              );
            } else {
              console.error('Error desconocido:', err);
            }
          }
        });
      }
    } else {
      console.error('Formulario no válido', this.excursionForm);
      this.excursionForm.markAllAsTouched();
    }
  }
}
