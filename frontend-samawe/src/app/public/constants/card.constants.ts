import { DashboardCard } from '../interface/card.interface';

export const DASHBOARD_CARDS: DashboardCard[] = [
  {
    icon: 'person',
    title: 'Usuarios',
    description: 'Administra usuarios, roles y permisos del sistema',
    route: '/organizational/users/list',
    iconNext: 'navigate_next',
    allowedRoles: ['Empleado', 'Administrador']
  },
  {
    icon: 'store',
    title: 'Productos',
    description: 'Gestión de inventario y productos',
    route: '/service-and-product/general',
    queryParams: { editProduct: true },
    iconNext: 'navigate_next',
    allowedRoles: ['Empleado', 'Administrador']
  },
  {
    icon: 'hotel',
    title: 'Hospedajes',
    description: 'Estado de las habitaciones y su información',
    route: '/service-and-product/general',
    queryParams: { editAccommodation: true },
    iconNext: 'navigate_next',
    allowedRoles: ['Empleado', 'Administrador']
  },
  {
    icon: 'tour',
    title: 'Pasadías',
    description: 'Crea tus pasadías y administra tus pasadías',
    route: '/service-and-product/general',
    queryParams: { editExcursion: true },
    iconNext: 'navigate_next',
    allowedRoles: ['Empleado', 'Administrador']
  },
  {
    icon: 'note',
    title: 'Facturación',
    description: 'Genera y gestiona facturas, pagos y cobros',
    route: '/invoice/invoices/list',
    iconNext: 'navigate_next',
    allowedRoles: ['Empleado', 'Administrador']
  },
  {
    icon: 'attach_money',
    title: 'Reportes / Ganancias',
    description: 'Analiza el rendimiento con reportes detallados',
    route: '/sales/earnings-sumary',
    iconNext: 'navigate_next',
    allowedRoles: ['Empleado', 'Administrador']
  },
  {
    icon: 'settings',
    title: 'Gestión general',
    description: 'Configuración y administración del sistema',
    route: '/organizational/types/manage',
    iconNext: 'navigate_next',
    allowedRoles: ['Administrador']
  }
];
