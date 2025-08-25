import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavItem } from '../../../shared/interfaces/navBar.interface';
import { NAVBAR_CONST } from '../../../shared/constants/navbar.constans';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatMenuModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
  navBarItems: NavItem[] = NAVBAR_CONST;
}
