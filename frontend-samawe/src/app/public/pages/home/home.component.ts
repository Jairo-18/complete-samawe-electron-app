import { AccommodationsService } from './../../../service-and-product/services/accommodations.service';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { UserInterface } from '../../../shared/interfaces/user.interface';
import { LocalStorageService } from '../../../shared/services/localStorage.service';
import { AuthService } from '../../../auth/services/auth.service';
import { BasePageComponent } from '../../../shared/components/base-page/base-page.component';
import { CardHomeComponent } from '../../components/card-home/card-home.component';
import { GetAccommodationPaginatedList } from '../../../service-and-product/interface/accommodation.interface';
// import { CardAccommodationComponent } from '../../components/card-accommodation/card-accommodation.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    FormsModule,
    BasePageComponent,
    CardHomeComponent,
    RouterLink
    // CardAccommodationComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly _subscription: Subscription = new Subscription();
  private readonly _authService: AuthService = inject(AuthService);
  private readonly _localStorage: LocalStorageService =
    inject(LocalStorageService);
  private readonly _router: Router = inject(Router);
  private readonly _accommodationsService: AccommodationsService = inject(
    AccommodationsService
  );

  isLoggedUser = false;
  userInfo?: UserInterface;
  accommodations: GetAccommodationPaginatedList[] = [];
  tipo: string = 'hospedaje';
  huespedes: string = '2';
  dateRange: { from?: Date; to?: Date } = {};

  ngOnInit(): void {
    this._subscription.add(
      this._authService._isLoggedSubject.subscribe((isLogged) => {
        this.isLoggedUser = isLogged;
        this.userInfo = this._localStorage.getUserData();
        this.loadAccommodationsIfUser();
      })
    );

    this.isLoggedUser = this._authService.isAuthenticated();
    this.userInfo = this._localStorage.getUserData();
    this.loadAccommodationsIfUser();

    this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isLoggedUser = this._authService.isAuthenticated();
        this.userInfo = this._localStorage.getUserData();
        this.loadAccommodationsIfUser();
      });
  }

  private loadAccommodationsIfUser() {
    if (!this.isLoggedUser || this.userInfo?.roleType?.name === 'Usuario') {
      this._accommodationsService
        .getAccommodationWithPagination({ page: 1, perPage: 10 })
        .subscribe((res) => {
          this.accommodations = res.data;
        });
    }
  }

  formatRangeEs(): string {
    const { from, to } = this.dateRange;
    if (!from && !to) return 'Selecciona fechas';
    if (from && !to) return from.toLocaleDateString('es-ES');
    if (from && to)
      return `${from.toLocaleDateString('es-ES')} – ${to.toLocaleDateString(
        'es-ES'
      )}`;
    return 'Selecciona fechas';
  }

  onSearch() {
    alert(
      `Buscando ${this.tipo} para ${
        this.huespedes
      } huésped(es) en fechas: ${this.formatRangeEs()}. ¡Conectar con backend!`
    );
  }
}
