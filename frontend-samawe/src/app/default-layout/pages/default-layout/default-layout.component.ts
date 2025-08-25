import { Component, inject, OnInit } from '@angular/core';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { filter, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LocalStorageService } from '../../../shared/services/localStorage.service';
import { UserInterface } from '../../../shared/interfaces/user.interface';
import { LogOutInterface } from '../../../auth/interfaces/logout.interface';
// import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
// import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-default-layout',
  standalone: true,
  imports: [
    SideBarComponent,
    // NavBarComponent,
    // FooterComponent,
    RouterOutlet,
    CommonModule
  ],
  templateUrl: './default-layout.component.html',
  styleUrl: './default-layout.component.scss'
})
export class DefaultLayoutComponent implements OnInit {
  // Inyección de dependencias usando el nuevo API de Angular
  private readonly _authService: AuthService = inject(AuthService);
  private readonly _router: Router = inject(Router);
  private readonly _localStorage: LocalStorageService =
    inject(LocalStorageService);
  private _localStorageService: LocalStorageService =
    inject(LocalStorageService);
  private _subscription: Subscription = new Subscription();

  // Indica si el usuario ha iniciado sesión
  isLoggedUser: boolean = false;

  // Información del usuario actual
  userInfo?: UserInterface;

  // Estado del sidebar (colapsado o no)
  isCollapsedSideBar: boolean = true;

  // Indica si se está viendo desde un dispositivo móvil
  isPhone: boolean = false;

  // Información completa del usuario
  user?: UserInterface;

  // Controla si se debe cerrar el sidebar (solo aplica para mobile)
  closeSideBar: boolean = false;

  constructor() {
    // Detectar si el dispositivo es móvil al momento de cargar el layout
    this.isPhone = window.innerWidth <= 768;
  }

  /**
   * Método que se ejecuta al inicializar el componente.
   * Se suscribe a cambios de estado de autenticación y eventos de navegación.
   */
  ngOnInit(): void {
    // Escucha cambios en el observable que indica si hay sesión activa
    this._subscription.add(
      this._authService._isLoggedSubject.subscribe((isLogged) => {
        this.isLoggedUser = isLogged;
        this.userInfo = this._localStorage.getUserData();
      })
    );

    // Se valida la autenticación actual
    this.isLoggedUser = this._authService.isAuthenticated();

    // Cada vez que cambia la ruta, se vuelve a comprobar el estado de login
    this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isLoggedUser = this._authService.isAuthenticated();
        this.userInfo = this._localStorage.getUserData();
      });

    // Se obtiene el usuario al cargar el componente
    this.userInfo = this._localStorage.getUserData();
  }

  /**
   * Método que escucha el evento emitido desde el `SideBarComponent`
   * para alternar el estado del sidebar (expandido o colapsado).
   *
   * @param event Estado emitido desde el sidebar
   */
  listenEvent(event: boolean): void {
    this.isCollapsedSideBar = event;
    this.closeSideBar = false;
  }

  /**
   * Cierra sesión del usuario actual.
   * Valida que existan los datos mínimos requeridos para realizar la petición de logout,
   * y luego limpia el almacenamiento local y redirige al login.
   */
  logout(): void {
    // Si no hay sesión, redirige directamente al login
    if (!this.isLoggedUser) {
      this._router.navigateByUrl('/auth/login');
    } else {
      const allSessionData = this._localStorageService.getAllSessionData();

      // Validación de datos mínimos para cerrar sesión
      if (
        !allSessionData?.user?.userId ||
        !allSessionData?.tokens?.accessToken ||
        !allSessionData?.session?.accessSessionId
      ) {
        console.error('Faltan datos de sesión para cerrar sesión');
        this._authService.cleanStorageAndRedirectToLogin();
        return;
      }

      // Construcción del objeto de logout requerido por el backend
      const sessionDataToLogout: LogOutInterface = {
        userId: allSessionData.user.userId,
        accessToken: allSessionData.tokens.accessToken,
        accessSessionId: allSessionData.session.accessSessionId
      };

      // Solicita cerrar sesión al backend
      this._authService.logout(sessionDataToLogout).subscribe({
        next: () => {
          this._authService.cleanStorageAndRedirectToLogin();
          this.user = undefined;
        },
        error: () => {
          this._authService.cleanStorageAndRedirectToLogin();
        }
      });
    }
  }
}
