import { ProductComplete } from '../../interface/product.interface';
import {
  ChangeDetectionStrategy,
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
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { CreateProductPanel } from '../../interface/product.interface';
import { CurrencyFormatDirective } from '../../../shared/directives/currency-format.directive';
import { CategoryType } from '../../../shared/interfaces/relatedDataGeneral';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { UppercaseDirective } from '../../../shared/directives/uppercase.directive';

@Component({
  selector: 'app-create-or-edit-product',
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
    CurrencyFormatDirective,
    SectionHeaderComponent,
    UppercaseDirective
  ],
  templateUrl: './create-or-edit-product.component.html',
  styleUrl: './create-or-edit-product.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateOrEditProductComponent implements OnChanges {
  @Input() currentProduct?: ProductComplete;
  @Output() productSaved = new EventEmitter<void>();

  @Input()
  set categoryTypes(value: CategoryType[]) {
    this._categoryTypes = value;
    this.visibleCategoryTypes = value.filter((c) =>
      [
        'Bar',
        'Restaurante',
        'Otros',
        'Mecato',
        'MECATO',
        'BAR',
        'RESTAURANTE',
        'OTROS'
      ].includes(c.name)
    );

    // CLAVE: Si ya tenemos un producto cargado y ahora llegan las categorías,
    // actualizamos el formulario
    if (this.currentProduct && this.visibleCategoryTypes.length > 0) {
      this.updateFormWithProduct(this.currentProduct);
    }

    // Si estamos en modo edición por URL y ahora tenemos categorías,
    // reintentamos cargar el producto
    if (this.pendingProductId && this.visibleCategoryTypes.length > 0) {
      this.getProductToEdit(this.pendingProductId);
      this.pendingProductId = null;
    }

    this.cdr.detectChanges();
  }

  get categoryTypes(): CategoryType[] {
    return this._categoryTypes;
  }

  private _categoryTypes: CategoryType[] = [];
  productForm!: FormGroup;
  productId: number = 0;
  isEditMode: boolean = false;
  visibleCategoryTypes: CategoryType[] = [];
  private pendingProductId: number | null = null; // Para manejar carga tardía

  private readonly _productsService: ProductsService = inject(ProductsService);
  private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly _router: Router = inject(Router);

  constructor(private _fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.productForm = this._fb.group({
      categoryTypeId: [null, [Validators.required]],
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: ['', [Validators.maxLength(500)]],
      amount: [
        0,
        [Validators.pattern(/^\d+(\.\d{1,2})?$/), Validators.min(0.0)]
      ],
      priceBuy: [
        0,
        [Validators.pattern(/^\d+(\.\d{1,2})?$/), Validators.min(0.0)]
      ],
      priceSale: [
        0,
        [Validators.pattern(/^\d+(\.\d{1,2})?$/), Validators.min(0.0)]
      ],
      isActive: [false, Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentProduct']) {
      const queryParams = this._activatedRoute.snapshot.queryParams;

      // Si viene un producto desde el padre: editar
      if (this.currentProduct) {
        this.productId = this.currentProduct.productId;
        this.isEditMode = true;

        // Solo actualizamos si ya tenemos las categorías cargadas
        if (this.visibleCategoryTypes.length > 0) {
          this.updateFormWithProduct(this.currentProduct);
        }
        // Si no hay categorías aún, se actualizará cuando lleguen en el setter
      } else if (queryParams['editProduct'] === 'true') {
        // Crear nuevo producto
        this.isEditMode = false;
        this.productId = 0;
        this.resetFormToDefaults();
      } else if (!isNaN(+queryParams['editProduct'])) {
        // Editar por ID desde URL
        this.productId = Number(queryParams['editProduct']);
        this.isEditMode = true;

        // Si ya tenemos categorías, cargamos el producto inmediatamente
        if (this.visibleCategoryTypes.length > 0) {
          this.getProductToEdit(this.productId);
        } else {
          // Si no hay categorías aún, guardamos el ID para cargar después
          this.pendingProductId = this.productId;
        }
      }
    }
  }

  private updateFormWithProduct(product: ProductComplete): void {
    this.productForm.patchValue({
      categoryTypeId: product.categoryType?.categoryTypeId,
      code: product.code,
      name: product.name,
      description: product.description,
      amount: product.amount ?? 0,
      priceBuy: product.priceBuy,
      priceSale: product.priceSale,
      isActive: product.isActive ?? false
    });
    this.cdr.detectChanges();
  }

  private resetFormToDefaults(): void {
    this.productForm.reset({
      categoryTypeId: null,
      code: '',
      name: '',
      description: '',
      amount: 0,
      priceBuy: 0,
      priceSale: 0,
      isActive: false
    });
    this.cdr.detectChanges();
  }

  resetForm() {
    this.resetFormToDefaults();
    Object.keys(this.productForm.controls).forEach((key) => {
      const control = this.productForm.get(key);
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

  private getProductToEdit(productId: number): void {
    this._productsService.getProductEditPanel(productId).subscribe({
      next: (res) => {
        const product = res.data;
        this.productId = product.productId;

        // Actualizamos el formulario con los datos del producto
        this.updateFormWithProduct(product);
      },
      error: (err) => {
        console.error('Error al obtener producto:', err.error?.message || err);
      }
    });
  }

  save() {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;

      const productSave: CreateProductPanel = {
        productId: this.isEditMode ? this.productId : undefined,
        code: formValue.code,
        categoryTypeId: formValue.categoryTypeId,
        name: formValue.name,
        description: formValue.description,
        amount: Math.abs(Number(formValue.amount)),
        priceBuy: Math.abs(Number(formValue.priceBuy)),
        priceSale: Math.abs(Number(formValue.priceSale)),
        isActive: formValue.isActive
      };

      if (this.isEditMode) {
        const updateData = { ...productSave };
        delete updateData.productId;

        this._productsService
          .updateProductPanel(this.productId, updateData)
          .subscribe({
            next: () => {
              this.productSaved.emit();
              this.resetForm();
            },
            error: (error) => {
              console.error('Error al actualizar el producto', error);
            }
          });
      } else {
        this._productsService.createProductPanel(productSave).subscribe({
          next: () => {
            this.productSaved.emit();
            this.resetForm();
          },
          error: (err) => {
            if (err.error && err.error.message) {
              console.error('Error al registrar producto:', err.error.message);
            } else {
              console.error('Error desconocido:', err);
            }
          }
        });
      }
    } else {
      console.error('Formulario no válido', this.productForm);
      this.productForm.markAllAsTouched();
    }
  }
}
