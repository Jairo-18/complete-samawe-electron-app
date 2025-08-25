import { NavItem } from '../interfaces/navBar.interface';

export const NAVBAR_CONST: NavItem[] = [
  {
    title: 'Inicio',
    route: '/',
    icon: 'home'
  },
  // {
  //   title: 'Hospedajes',
  //   route: '/accommodation',
  //   icon: 'event_available'
  // },
  // {
  //   title: 'Pasadías',
  //   route: '/excursion',
  //   icon: 'beach_access'
  // },
  // {
  //   title: 'Sobre Nosotros',
  //   route: '/about-us',
  //   icon: 'person'
  // },
  {
    title: 'Iniciar Sesión',
    route: '/auth/login',
    icon: 'login'
  }
];
