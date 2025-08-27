import { MenuInterface } from '../interfaces/menu.interface';

export const MENU_CONST: MenuInterface[] = [
  {
    module: 'Panel de Recepcionista',
    icon: 'view_list',
    order: 1,
    items: [
      {
        name: 'Inicio',
        route: '/home',
        icon: 'home',
        order: 1,
        subItems: []
      },
      {
        name: 'Clientes',
        route: '/organizational/users/list',
        icon: 'supervised_user_circle',
        order: 2,
        subItems: []
      },
      {
        name: 'Productos y servicios',
        route: '/service-and-product/general',
        icon: 'add_shopping_cart',
        order: 3,
        subItems: []
      },
      {
        name: 'Facturas',
        route: '/invoice/invoices/list',
        icon: 'notes',
        order: 4,
        subItems: []
      },
      {
        name: 'Reportes / Ganancias',
        route: '/sales/earnings-sumary',
        icon: 'attach_money',
        order: 5,
        subItems: []
      }
    ]
  },
  // {
  //   module: 'Panel de administrador',
  //   icon: 'work',
  //   order: 1,
  //   items: [
  //     {
  //       name: 'Gestión',
  //       route: '/organizational/types/manage',
  //       icon: 'category',
  //       order: 1
  //     }
  //   ]
  // }
];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  Usuario: [''],
  Recepcionista: [
    'Clientes',
    'Productos y servicios',
    'Facturas',
    'Reportes / Ganancias',
    'Inicio'
  ],
  Administrador: [
    'Clientes',
    'Productos y servicios',
    'Gestión',
    'Facturas',
    'Reportes / Ganancias',
    'Inicio'
  ]
};

// export const ROUTE_MAP: Record<string, string> = {
//   'Crear usuario': '/organizational/users/create',
//   'Ver usuarios': '/organizational/users/list',
//   'Crear productos': '/products/create-products',
//   'Ver productos': '/products/see-products',
//   'Crear facturas': '/invoices/create-invoices',
//   'Ver facturas': '/invoices/see-invoices',
//   Usuarios: '/organizational/users/list' // del panel de admin
// };
