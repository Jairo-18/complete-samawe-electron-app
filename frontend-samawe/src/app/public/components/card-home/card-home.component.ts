import { RouterLink } from '@angular/router';
import { Component, inject } from '@angular/core';
import { DashboardCard } from '../../interface/card.interface';
import { DASHBOARD_CARDS } from '../../constants/card.constants';
import { MatIconModule } from '@angular/material/icon';
import { LocalStorageService } from '../../../shared/services/localStorage.service';

@Component({
  selector: 'app-card-home',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './card-home.component.html',
  styleUrl: './card-home.component.scss'
})
export class CardHomeComponent {
  cards: DashboardCard[] = [];

  private readonly _localStorage: LocalStorageService =
    inject(LocalStorageService);

  constructor() {
    const userData = this._localStorage.getUserData();

    const userRole = userData?.roleType?.name;

    this.cards = DASHBOARD_CARDS.filter((card) =>
      card.allowedRoles?.includes(userRole)
    );
  }
}
