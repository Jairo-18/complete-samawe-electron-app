import { SearchField } from '../../shared/interfaces/search.interface';

export const searchFieldsProducts: SearchField[] = [
  {
    name: 'search',
    label: 'Código, nombre, unidades o precios',
    type: 'text',
    placeholder: ' '
  },
  {
    name: 'categoryType',
    label: 'Categoría',
    type: 'select',
    options: [],
    placeholder: 'Buscar por categoría'
  },
  {
    name: 'isActive',
    label: 'Estado',
    type: 'select',
    options: [
      { value: true, label: 'Activo' },
      { value: false, label: 'Inactivo' }
    ],
    placeholder: 'Buscar por estado'
  }
];

export const searchFieldsAccommodations: SearchField[] = [
  {
    name: 'search',
    label: 'Código, nombre, baños, habitaciones, capacidad o precios',
    type: 'text',
    placeholder: ' '
  },
  {
    name: 'categoryType',
    label: 'Categoría',
    type: 'select',
    options: [],
    placeholder: 'Buscar por categoría'
  },
  {
    name: 'bedType',
    label: 'Camas',
    type: 'select',
    options: [],
    placeholder: 'Buscar por camas'
  },
  {
    name: 'stateType',
    label: 'Estado',
    type: 'select',
    options: [],
    placeholder: 'Buscar por estado'
  },
  {
    name: 'jacuzzi',
    label: 'Jacuzzi',
    type: 'select',
    options: [
      { value: true, label: 'Sí' },
      { value: false, label: 'No' }
    ],
    placeholder: 'Buscar por jacuzzi'
  }
];

export const searchFieldsExcursions: SearchField[] = [
  {
    name: 'search',
    label: 'Código, nombre, precios',
    type: 'text',
    placeholder: ' '
  },

  {
    name: 'categoryType',
    label: 'Categoría',
    type: 'select',
    options: [],
    placeholder: 'Buscar por categoría'
  },

  {
    name: 'stateType',
    label: 'Estado',
    type: 'select',
    options: [],
    placeholder: 'Buscar por estado'
  }
];
