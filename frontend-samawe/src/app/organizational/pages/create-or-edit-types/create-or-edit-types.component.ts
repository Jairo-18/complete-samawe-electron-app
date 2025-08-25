import { Component, Inject, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BaseDialogComponent } from '../../../shared/components/base-dialog/base-dialog.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TYPE_ENTITY_LABELS_ES } from '../../../shared/constants/type.contstants';
import { TypesService } from '../../services/types.service';

@Component({
  selector: 'app-create-or-edit-types',
  imports: [
    BaseDialogComponent,
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './create-or-edit-types.component.html',
  styleUrl: './create-or-edit-types.component.scss'
})
export class CreateOrEditTypesComponent {
  formType!: FormGroup;
  isEditMode = false;
  private _id?: string;

  typeOptions = Object.entries(TYPE_ENTITY_LABELS_ES).map(([key, value]) => ({
    key,
    value
  }));

  private readonly _dialogRef = inject(
    MatDialogRef<CreateOrEditTypesComponent>
  );
  private readonly _typesService = inject(TypesService);
  private readonly _fb = inject(FormBuilder);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.isEditMode = !!data?.editMode;
    this._id = data?.id ? data.id.toString() : undefined;

    this.formType = this._fb.group({
      selectedType: [data?.selectedType || '', Validators.required],
      code: [data?.code || '', Validators.required],
      name: [data?.name || '', Validators.required]
    });

    // Si está en edición, deshabilitar la selección del tipo para evitar cambios
    if (this.isEditMode) {
      this.formType.get('selectedType')?.disable();
    }
  }

  save(): void {
    if (this.formType.invalid) {
      this.formType.markAllAsTouched();
      return;
    }

    // Para editar, el selectedType está deshabilitado, por eso accedemos al valor con getRawValue
    const values = this.formType.getRawValue();
    const type = values.selectedType?.trim();

    if (!type) {
      this.formType.get('selectedType')?.setErrors({ required: true });
      return;
    }

    const payload = {
      code: values.code.trim(),
      name: values.name.trim()
    };

    let action$;

    if (this.isEditMode && this._id) {
      action$ = this._typesService.updateType(type, this._id, payload);
    } else {
      action$ = this._typesService.createType(type, payload);
    }

    action$.subscribe({
      next: () => this._dialogRef.close(true),
      error: (err) => {
        console.error('Error en guardado:', err);
      }
    });
  }

  cancel(): void {
    this._dialogRef.close(null);
  }
}
