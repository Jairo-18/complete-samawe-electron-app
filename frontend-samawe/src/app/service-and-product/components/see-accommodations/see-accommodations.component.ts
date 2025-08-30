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
  BedType,
  StateType
} from '../../../shared/interfaces/relatedDataGeneral';
import {
  AccommodationComplete,
  CreateAccommodationPanel
} from '../../interface/accommodation.interface';
import { AccommodationsService } from '../../services/accommodations.service';
import { SectionHeaderComponent } from '../../../shared/components/section-header/section-header.component';
import { FormatCopPipe } from '../../../shared/pipes/format-cop.pipe';

@Component({
  selector: 'app-see-accommodations',
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
  templateUrl: './see-accommodations.component.html',
  styleUrl: './see-accommodations.component.scss'
})
export class SeeAccommodationsComponent implements OnInit {
  @Input() searchFieldsAccommodations: any[] = [];
  @Input() stateTypes: StateType[] = [];
  @Input() bedTypes: BedType[] = [];
  @Output() accommodationSelect = new EventEmitter<AccommodationComplete>();
  @Output() accommodationClean = new EventEmitter<number>();

  private readonly _accommodationService: AccommodationsService = inject(
    AccommodationsService
  );
  private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _matDialog: MatDialog = inject(MatDialog);
  private readonly _authService: AuthService = inject(AuthService);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(SearchFieldsComponent) searchComponent!: SearchFieldsComponent;

  displayedColumns: string[] = [
    'bedType',
    'stateType',
    'code',
    'name',
    'amountPerson',
    'jacuzzi',
    'amountRoom',
    'amountBathroom',
    'priceBuy',
    'priceSale',
    'actions'
  ];

  dataSource = new MatTableDataSource<CreateAccommodationPanel>([]);

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
    this.loadAccommodations();
  }

  constructor() {
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) this.paginationParams.perPage = 5;
    this.userLogged = this._authService.getUserLoggedIn();
  }

  getBedTypeName(accommodation: AccommodationComplete): string {
    const bedTypeId = accommodation?.bedType?.bedTypeId;

    const stateType = this.bedTypes.find((r) => r.bedTypeId === bedTypeId);

    return stateType?.name || 'N/A';
  }

  getStateTypeName(accommodation: AccommodationComplete): string {
    const stateTypeId = accommodation?.stateType?.stateTypeId;

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
    this.loadAccommodations();
  }

  /**
   * @param onChangePagination - Cambio de paginación.
   */
  onChangePagination(event: PageEvent): void {
    this.paginationParams.page = event.pageIndex + 1;
    this.paginationParams.perPage = event.pageSize;
    this.loadAccommodations();
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
    this.loadAccommodations();
  }

  /**
   * @param loadUsers - Carga de usuarios.
   * @param getUserWithPagination - Obtiene los usuarios con paginación.
   */
  loadAccommodations(filter: string = ''): void {
    this.loading = true;

    const query = {
      page: this.paginationParams.page,
      perPage: this.paginationParams.perPage,
      search: filter,
      ...this.params
    };

    this._accommodationService.getAccommodationWithPagination(query).subscribe({
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
  private deleteAccommodation(accommodationId: number): void {
    this.loading = true;
    this._accommodationService
      .deleteAccommodationPanel(accommodationId)
      .subscribe({
        next: () => {
          this.loadAccommodations();
          this.cleanQueryParamDelete(accommodationId);

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
  openDeleteAccommodationDialog(id: number): void {
    const dialogRef = this._matDialog.open(YesNoDialogComponent, {
      data: {
        title: '¿Deseas eliminar este hospedaje?',
        message: 'Esta acción no se puede deshacer.'
      }
    });

    dialogRef.afterClosed().subscribe((confirm) => {
      if (confirm) {
        this.deleteAccommodation(id);
      }
    });
  }

  cleanQueryParamDelete(id: number) {
    const queryParams = this._activatedRoute.snapshot.queryParams;
    if (queryParams['editAccommodation']) {
      const accommodationId = Number(queryParams['editAccommodation']);
      if (accommodationId === id) {
        this._router.navigate(
          [], // La misma ruta actual (segmentos de ruta)
          {
            queryParams: {}, // Pasa un objeto vacío para eliminar los query parameters
            queryParamsHandling: '', // 'merge' es el comportamiento predeterminado, pero explícito por claridad
            replaceUrl: true // Importante: Reemplaza la URL actual en el historial sin recargar
          }
        );
        this.accommodationClean.emit(id);
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
