export interface OrderProduct {
  name: string;
  quantity: number;
  price: number;
  unit?: 'unidad' | 'kg';
  received?: number;
}

export type OrderStatus = 'pendiente' | 'finalizado';

export type RecurrenceType = 'diario' | 'semanal' | 'quincenal' | 'mensual' | 'dias_semana';

export interface Recurrence {
  type: RecurrenceType;
  days?: number[];
}

export interface Order {
  id: string;
  company: string;
  companyColor: string;
  products: OrderProduct[];
  createdDate: string;
  expectedDate: string;
  status: OrderStatus;
  recurrence?: Recurrence;
}

export const ORDERS: Order[] = [
  {
    id: 'ORD-001',
    company: 'Gamesa',
    companyColor: '#1a5fa0',
    products: [
      { name: 'Galletas Emperador Vainilla', quantity: 24, price: 18.5 },
      { name: 'Galletas Chokis', quantity: 20, price: 22.0 },
      { name: 'Galletas Marías', quantity: 30, price: 12.0 },
      { name: 'Barritas Marinela', quantity: 15, price: 15.0 }
    ],
    createdDate: '2026-08-08',
    expectedDate: '2026-08-12',
    status: 'pendiente'
  },
  {
    id: 'ORD-002',
    company: 'Bimbo',
    companyColor: '#c8102e',
    products: [
      { name: 'Pan Blanco Bimbo Grande', quantity: 40, price: 45.0 },
      { name: 'Pan Integral Bimbo', quantity: 25, price: 48.5 },
      { name: 'Medias Noches Bimbo', quantity: 30, price: 55.0 },
      { name: 'Donas Espolvoreadas', quantity: 18, price: 30.0 }
    ],
    createdDate: '2026-08-09',
    expectedDate: '2026-08-13',
    status: 'pendiente'
  },
  {
    id: 'ORD-003',
    company: 'Sabritas',
    companyColor: '#e30613',
    products: [
      { name: 'Sabritas Original 45g', quantity: 35, price: 15.5 },
      { name: 'Sabritas Adobadas 45g', quantity: 30, price: 15.5 },
      { name: 'Cheetos Poffs 55g', quantity: 25, price: 18.0 },
      { name: 'Doritos Nacho 70g', quantity: 28, price: 22.5 }
    ],
    createdDate: '2026-08-10',
    expectedDate: '2026-08-14',
    status: 'pendiente'
  },
  {
    id: 'ORD-004',
    company: 'Coca-Cola',
    companyColor: '#d02128',
    products: [
      { name: 'Coca-Cola 600ml', quantity: 48, price: 14.0 },
      { name: 'Coca-Cola Zero 600ml', quantity: 36, price: 14.0 },
      { name: 'Sprite 600ml', quantity: 24, price: 14.0 },
      { name: 'Fanta 600ml', quantity: 20, price: 14.0 }
    ],
    createdDate: '2026-08-07',
    expectedDate: '2026-08-12',
    status: 'pendiente'
  },
  {
    id: 'ORD-005',
    company: 'La Moderna',
    companyColor: '#007b3d',
    products: [
      { name: 'Pasta Espagueti La Moderna 200g', quantity: 50, price: 11.5 },
      { name: 'Pasta Penne La Moderna 200g', quantity: 40, price: 11.5 },
      { name: 'Pasta Coditos La Moderna 200g', quantity: 30, price: 11.5 }
    ],
    createdDate: '2026-08-09',
    expectedDate: '2026-08-15',
    status: 'pendiente'
  },
  {
    id: 'ORD-006',
    company: 'Lala',
    companyColor: '#4b2e83',
    products: [
      { name: 'Leche Entera Lala 1L', quantity: 60, price: 25.0 },
      { name: 'Leche Light Lala 1L', quantity: 30, price: 25.0 },
      { name: 'Yogurt de Fresa Lala 250ml', quantity: 24, price: 12.0 }
    ],
    createdDate: '2026-08-10',
    expectedDate: '2026-08-11',
    status: 'pendiente'
  },
  {
    id: 'ORD-007',
    company: 'Quaker',
    companyColor: '#0059a9',
    products: [
      { name: 'Avena Quaker Tradicional 500g', quantity: 30, price: 45.0 },
      { name: 'Avena Quaker Instantánea 300g', quantity: 20, price: 32.0 },
      { name: 'Barras de Granola Quaker', quantity: 24, price: 28.0 }
    ],
    createdDate: '2026-08-04',
    expectedDate: '2026-08-09',
    status: 'pendiente'
  },
  {
    id: 'ORD-008',
    company: 'La Costeña',
    companyColor: '#c12026',
    products: [
      { name: 'Salsa Verde La Costeña 480g', quantity: 36, price: 22.0 },
      { name: 'Salsa Roja La Costeña 480g', quantity: 36, price: 22.0 },
      { name: 'Chiles Jalapeños 780g', quantity: 18, price: 35.0 }
    ],
    createdDate: '2026-08-01',
    expectedDate: '2026-08-08',
    status: 'finalizado'
  },
  {
    id: 'ORD-009',
    company: 'Bimbo',
    companyColor: '#c8102e',
    products: [
      { name: 'Pan Blanco Bimbo Grande', quantity: 20, price: 45.0 },
      { name: 'Medias Noches Bimbo', quantity: 15, price: 55.0 }
    ],
    createdDate: '2026-08-05',
    expectedDate: '2026-08-11',
    status: 'pendiente',
    recurrence: { type: 'semanal' }
  },
  {
    id: 'ORD-010',
    company: 'Coca-Cola',
    companyColor: '#d02128',
    products: [
      { name: 'Coca-Cola 600ml', quantity: 24, price: 14.0 },
      { name: 'Sprite 600ml', quantity: 12, price: 14.0 }
    ],
    createdDate: '2026-08-01',
    expectedDate: '2026-09-15',
    status: 'pendiente',
    recurrence: { type: 'mensual' }
  }
];

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(iso));
}

export interface SupplierProduct {
  name: string;
  price: number;
}

export interface Supplier {
  name: string;
  color: string;
  products: SupplierProduct[];
}

export const SUPPLIERS: Supplier[] = [
  {
    name: 'Gamesa',
    color: '#1a5fa0',
    products: [
      { name: 'Galletas Emperador Vainilla', price: 18.5 },
      { name: 'Galletas Chokis', price: 22.0 },
      { name: 'Galletas Marías', price: 12.0 },
      { name: 'Galletas Príncipe', price: 19.0 },
      { name: 'Barritas Marinela', price: 15.0 },
      { name: 'Galletas Saladitas', price: 10.0 }
    ]
  },
  {
    name: 'Bimbo',
    color: '#c8102e',
    products: [
      { name: 'Pan Blanco Bimbo Grande', price: 45.0 },
      { name: 'Pan Integral Bimbo', price: 48.5 },
      { name: 'Medias Noches Bimbo', price: 55.0 },
      { name: 'Donas Espolvoreadas', price: 30.0 },
      { name: 'Mantecadas Bimbo', price: 25.0 },
      { name: 'Bimbollos Rellenos', price: 35.0 }
    ]
  },
  {
    name: 'Sabritas',
    color: '#e30613',
    products: [
      { name: 'Sabritas Original 45g', price: 15.5 },
      { name: 'Sabritas Adobadas 45g', price: 15.5 },
      { name: 'Cheetos Poffs 55g', price: 18.0 },
      { name: 'Doritos Nacho 70g', price: 22.5 },
      { name: 'Churrumais 45g', price: 12.0 },
      { name: 'Runners 45g', price: 14.0 }
    ]
  },
  {
    name: 'Coca-Cola',
    color: '#d02128',
    products: [
      { name: 'Coca-Cola 600ml', price: 14.0 },
      { name: 'Coca-Cola Zero 600ml', price: 14.0 },
      { name: 'Sprite 600ml', price: 14.0 },
      { name: 'Fanta 600ml', price: 14.0 },
      { name: 'Fresca 600ml', price: 14.0 },
      { name: 'Sidral Mundet 600ml', price: 14.0 }
    ]
  },
  {
    name: 'La Moderna',
    color: '#007b3d',
    products: [
      { name: 'Pasta Espagueti La Moderna 200g', price: 11.5 },
      { name: 'Pasta Penne La Moderna 200g', price: 11.5 },
      { name: 'Pasta Coditos La Moderna 200g', price: 11.5 },
      { name: 'Pasta Fideo La Moderna 200g', price: 11.5 },
      { name: 'Pasta Macarrón La Moderna 200g', price: 11.5 }
    ]
  },
  {
    name: 'Lala',
    color: '#4b2e83',
    products: [
      { name: 'Leche Entera Lala 1L', price: 25.0 },
      { name: 'Leche Light Lala 1L', price: 25.0 },
      { name: 'Yogurt de Fresa Lala 250ml', price: 12.0 },
      { name: 'Yogurt Natural Lala 250ml', price: 12.0 },
      { name: 'Crema Lala 360g', price: 32.0 }
    ]
  }
];

export function findSupplierByName(name: string): Supplier | undefined {
  return SUPPLIERS.find((supplier) => supplier.name.toLowerCase() === name.trim().toLowerCase());
}
