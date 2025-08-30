/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SearchFieldsComponent } from '../../../shared/components/search-fields/search-fields.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../auth/services/auth.service';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PaginationInterface } from '../../../shared/interfaces/pagination.interface';
import { YesNoDialogComponent } from '../../../shared/components/yes-no-dialog/yes-no-dialog.component';
import { UserInterface } from '../../../shared/interfaces/user.interface';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UserComplete } from '../../../organizational/interfaces/create.interface';
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
import { FormatCopPipe } from '../../../shared/pipes/format-cop.pipe';

@Component({
  selector: 'app-see-excursions',
  standalone: true,
  imports: [
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIcon,
    CommonModule,
    MatPaginatorModule,
    MatTableModule,
    RouterLink,
    SearchFieldsComponent,
    LoaderComponent,
    MatTab,
    MatTabGroup,
    SectionHeaderComponent,
    FormatCopPipe
  ],
  templateUrl: './see-excursions.component.html',
  styleUrl: './see-excursions.component.scss'
})
export class SeeExcursionsComponent implements OnInit {
  @Input() searchFieldsExcursions: any[] = [];
  @Input() stateTypes: StateType[] = [];
  @Input() categoryTypes: CategoryType[] = [];
  @Output() excursionSelect = new EventEmitter<ExcursionComplete>();
  @Output() excursionClean = new EventEmitter<number>();

  private readonly _excursionService: ExcursionsService =
    inject(ExcursionsService);
  private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _matDialog: MatDialog = inject(MatDialog);
  private readonly _authService: AuthService = inject(AuthService);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(SearchFieldsComponent) searchComponent!: SearchFieldsComponent;

  displayedColumns: string[] = [
    'categoryType',
    'stateType',
    'code',
    'name',
    'priceBuy',
    'priceSale',
    'actions'
  ];

  dataSource = new MatTableDataSource<CreateExcursionPanel>([]);

  userLogged: UserInterface;
  form!: FormGroup;
  showClearButton: boolean = false;
  loading: boolean = false;
  isMobile: boolean = false;
  params: any = {};
  selectedTabIndex: number = 0;
  paginationParams: PaginationInterface = {
    page: 1,
    perPage: 25,
    total: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false
  };

  /**
   * @param ngOnInit - Inicialización de las funciones.
   */
  ngOnInit(): void {
    this.loadExcursions();
  }

  constructor() {
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) this.paginationParams.perPage = 5;
    this.userLogged = this._authService.getUserLoggedIn();
  }

  getCategoryTypeName(excursion: ExcursionComplete): string {
    // Obtener el ID del categoryType
    const categoryTypeId = excursion?.categoryType?.categoryTypeId;

    const category = this.categoryTypes.find(
      (r) => r.categoryTypeId === categoryTypeId
    );

    return category?.name || 'N/A';
  }

  getStateTypeName(excursion: ExcursionComplete): string {
    const stateTypeId = excursion?.stateType?.stateTypeId;

    const stateType = this.stateTypes.find(
      (r) => r.stateTypeId === stateTypeId
    );

    return stateType?.name || 'N/A';
  }

  /**
   * @param onSearchSubmit - Botón de búsqueda.
   */
  onSearchSubmit(values: any): void {
    this.params = values;
    this.paginationParams.page = 1;
    this.loadExcursions();
  }

  /**
   * @param onChangePagination - Cambio de paginación.
   */
  onChangePagination(event: PageEvent): void {
    this.paginationParams.page = event.pageIndex + 1;
    this.paginationParams.perPage = event.pageSize;
    this.loadExcursions();
  }

  /**
   * @param onTabChange - Cambio de tabla.
   */
  onTabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  onSearchChange(form: any): void {
    this.showClearButton = !!form.length;
    this.params = form?.value;
    this.loadExcursions();
  }

  /**
   * @param loadUsers - Carga de usuarios.
   * @param getUserWithPagination - Obtiene los usuarios con paginación.
   */
  loadExcursions(filter: string = ''): void {
    this.loading = true;

    const parsedParams = {
      ...this.params,

      bedType: this.params.bedType ? Number(this.params.bedType) : undefined,
      stateType: this.params.stateType
        ? Number(this.params.stateType)
        : undefined
    };

    const query = {
      page: this.paginationParams.page,
      perPage: this.paginationParams.perPage,
      search: filter,
      ...parsedParams
    };

    this._excursionService.getExcursionWithPagination(query).subscribe({
      next: (res) => {
        this.dataSource.data = res.data || [];
        this.paginationParams = res?.pagination;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error en la solicitud:', error);
        this.loading = false;
      }
    });
  }

  /**
   * @param _deleteUser - Ellimina un usuario.
   */
  private deleteExcursion(excursionId: number): void {
    this.loading = true;
    this._excursionService.deleteExcursionPanel(excursionId).subscribe({
      next: () => {
        this.loadExcursions();
        this.cleanQueryParamDelete(excursionId);

        this.loading = false;
      },
      error: (error) => {
        console.error('Error en la solicitud:', error);
        this.loading = false;
      }
    });
  }

  /**
   * @param openDeleteUserDialog - Abre un modal para eliminar un usuario.
   */
  openDeleteExcursionDialog(id: number): void {
    const dialogRef = this._matDialog.open(YesNoDialogComponent, {
      data: {
        title: '¿Deseas eliminar esta pasadía?',
        message: 'Esta acción no se puede deshacer.'
      }
    });

    dialogRef.afterClosed().subscribe((confirm) => {
      if (confirm) {
        this.deleteExcursion(id);
      }
    });
  }

  cleanQueryParamDelete(id: number) {
    const queryParams = this._activatedRoute.snapshot.queryParams;
    if (queryParams['editExcursion']) {
      const excursionId = Number(queryParams['editExcursion']);
      if (excursionId === id) {
        this._router.navigate(
          [], // La misma ruta actual (segmentos de ruta)
          {
            queryParams: {}, // Pasa un objeto vacío para eliminar los query parameters
            queryParamsHandling: '', // 'merge' es el comportamiento predeterminado, pero explícito por claridad
            replaceUrl: true // Importante: Reemplaza la URL actual en el historial sin recargar
          }
        );
        this.excursionClean.emit(id);
      }
    }
  }

  validateIfCanEditUserOrDelete(user: UserComplete): boolean {
    return (
      this.userLogged?.roleType?.name === 'Administrador' ||
      (this.userLogged?.roleType?.name === 'ADMINISTRADOR' &&
        user.roleType?.name === 'Cliente') ||
      user.roleType?.name === 'CLIENTE'
    );
  }
}
