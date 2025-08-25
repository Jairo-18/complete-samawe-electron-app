import { Component, inject, OnInit } from '@angular/core';
import { BasePageComponent } from '../../../shared/components/base-page/base-page.component';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TYPE_ENTITY_LABELS_ES } from '../../../shared/constants/type.contstants';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { CardTypesComponent } from '../../components/card-types/card-types.component';
import { TypeItem } from '../../../shared/interfaces/relatedDataGeneral';
import { PaginationInterface } from '../../../shared/interfaces/pagination.interface';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { YesNoDialogComponent } from '../../../shared/components/yes-no-dialog/yes-no-dialog.component';
import { CreateOrEditTypesComponent } from '../create-or-edit-types/create-or-edit-types.component';
import { TypesService } from '../../services/types.service';
import { SearchFieldsComponent } from '../../../shared/components/search-fields/search-fields.component'; // Agregado
import { SearchField } from '../../../shared/interfaces/search.interface';

@Component({
  selector: 'app-see-types',
  standalone: true,
  imports: [
    BasePageComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    CardTypesComponent,
    LoaderComponent,
    CommonModule,
    SearchFieldsComponent // Agregado
  ],
  templateUrl: './see-types.component.html',
  styleUrls: ['./see-types.component.scss']
})
export class SeeTypesComponent implements OnInit {
  private readonly _typesService = inject(TypesService);
  private readonly _matDialog: MatDialog = inject(MatDialog);
  private readonly _fb: FormBuilder = inject(FormBuilder); // Agregado

  results?: TypeItem[];
  loading: boolean = false;
  showClearButton: boolean = false;
  isMobile: boolean = false;
  selectedType: string = 'additionalType';
  params: any = {};
  paginationParams: PaginationInterface = {
    page: 1,
    perPage: 5,
    total: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false
  };
  buttons: Record<string, string> = TYPE_ENTITY_LABELS_ES;
  buttonsControll: FormControl = new FormControl('additionalType');

  form!: FormGroup;

  searchFields: SearchField[] = [
    {
      name: 'code', // ← obligatorio
      label: 'Código',

      type: 'text',
      placeholder: 'Buscar por código'
    },
    {
      name: 'name', // ← obligatorio
      label: 'Nombre',

      type: 'text',
      placeholder: 'Buscar por nombre'
    }
  ];

  ngOnInit(): void {
    this.form = this._fb.group({
      code: [''],
      name: ['']
    });

    this.loadGroupData(this.selectedType);

    this.buttonsControll.valueChanges.subscribe((value) => {
      this.selectedType = value;
      this.loadGroupData(value);
    });
  }

  onSearchSubmit(values: any): void {
    this.params = values;
    this.paginationParams.page = 1;
    this.loadGroupData(this.selectedType);
  }

  onSearchChange(form: any): void {
    this.showClearButton = !!form.length;
    this.params = form?.value;
    this.loadGroupData(this.selectedType);
  }

  onClearSearch() {
    this.params = {};
    this.paginationParams.page = 1;
    this.loadGroupData(this.selectedType);
  }

  public onButtonSelect(type: string) {
    this.selectedType = type;
    this.loadGroupData(type);
  }

  hasContent(data: TypeItem[]): boolean {
    return data.length > 0;
  }

  get buttonLabel() {
    return Object.entries(this.buttons) || [];
  }

  openDialog() {
    const isMobile = window.innerWidth <= 768;

    const dialogRef = this._matDialog.open(CreateOrEditTypesComponent, {
      width: isMobile ? '90vw' : 'auto',
      height: 'auto',
      maxWidth: '100vw',
      data: {
        selectedType: this.selectedType,
        editMode: false
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadGroupData(this.selectedType);
      }
    });
  }

  onEditType(event: { type: string; id: number | string }) {
    this._typesService
      .getTypeForEdit(event.type, event.id.toString())
      .subscribe({
        next: (res) => {
          const data = res.data.type;
          const isMobile = window.innerWidth <= 768;
          const dialogRef = this._matDialog.open(CreateOrEditTypesComponent, {
            width: isMobile ? '90vw' : 'auto',
            height: 'auto',
            maxWidth: '100vw',
            data: {
              editMode: true,
              selectedType: event.type,
              id: event.id.toString(),
              code: data.code,
              name: data.name
            }
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.loadGroupData(this.selectedType);
            }
          });
        },
        error: (err) => {
          console.error('Error al cargar tipo para edición', err);
        }
      });
  }

  onChangePagination(event: PageEvent): void {
    this.paginationParams.page = event.pageIndex + 1;
    this.paginationParams.perPage = event.pageSize;
    this.loadGroupData(this.selectedType);
  }

  loadGroupData(type: string): void {
    const query = {
      page: this.paginationParams.page,
      perPage: this.paginationParams.perPage,
      ...this.params
    };

    this.loading = true;
    this._typesService.getEntitiesWithPagination(type, query).subscribe({
      next: (res) => {
        this.results = res.data || [];
        this.paginationParams = res.pagination;
        this.loading = false;
      },
      error: (err) => {
        console.error(`Error cargando grupo ${type}`, err);
        this.loading = false;
      }
    });
  }

  onDeleteType(event: { type: string; id: number | string }) {
    const dialogRef = this._matDialog.open(YesNoDialogComponent, {
      data: {
        title: '¿Deseas eliminar este registro?',
        message: 'Esta acción no se puede deshacer.'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        const type = event.type.trim();
        const id = event.id.toString();

        this._typesService.deleteType(type, id).subscribe({
          next: () => this.loadGroupData(this.selectedType),
          error: (err) => console.error('Error al eliminar', err)
        });
      }
    });
  }
}
