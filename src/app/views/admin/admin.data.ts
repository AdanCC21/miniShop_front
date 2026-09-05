export type TiendaStatus = 'Activa' | 'Desactivada';

export interface StoreMember {
  id: number;
  name: string;
  email: string;
  role: 'Encargado' | 'Empleado';
  joinedAt: string;
}

export interface Tienda {
  id: string;
  name: string;
  address: string;
  uuid: string;
  status: TiendaStatus;
  members: StoreMember[];
}

export const TIENDAS: Tienda[] = [
  {
    id: 'tienda-001',
    name: 'Centro',
    address: 'Av. Juárez 123, Col. Centro',
    uuid: 'ST-0001',
    status: 'Activa',
    members: [
      { id: 1, name: 'Carlos Ruiz', email: 'carlos.ruiz@ejemplo.com', role: 'Encargado', joinedAt: '2026-01-15' },
      { id: 2, name: 'Laura Gómez', email: 'laura.gomez@ejemplo.com', role: 'Empleado', joinedAt: '2026-03-02' },
      { id: 3, name: 'Pedro Sánchez', email: 'pedro.sanchez@ejemplo.com', role: 'Empleado', joinedAt: '2026-05-20' }
    ]
  },
  {
    id: 'tienda-002',
    name: 'Mini Market Norte',
    address: 'Calle Reforma 45, Col. Norte',
    uuid: 'ST-0002',
    status: 'Activa',
    members: [
      { id: 1, name: 'Rosa Martínez', email: 'rosa.martinez@ejemplo.com', role: 'Encargado', joinedAt: '2026-02-10' },
      { id: 2, name: 'Jorge Herrera', email: 'jorge.herrera@ejemplo.com', role: 'Empleado', joinedAt: '2026-04-18' },
      { id: 3, name: 'Silvia Castro', email: 'silvia.castro@ejemplo.com', role: 'Empleado', joinedAt: '2026-06-01' },
      { id: 4, name: 'Miguel Ángel Díaz', email: 'miguel.diaz@ejemplo.com', role: 'Empleado', joinedAt: '2026-07-22' }
    ]
  },
  {
    id: 'tienda-003',
    name: 'Tienda Del Sol',
    address: 'Paseo del Sol 88, Col. Del Valle',
    uuid: 'ST-0003',
    status: 'Desactivada',
    members: [
      { id: 1, name: 'Beatriz Fuentes', email: 'beatriz.fuentes@ejemplo.com', role: 'Encargado', joinedAt: '2026-01-30' },
      { id: 2, name: 'Fernando Ríos', email: 'fernando.rios@ejemplo.com', role: 'Empleado', joinedAt: '2026-03-15' }
    ]
  },
  {
    id: 'tienda-004',
    name: 'Abarrotes Primavera',
    address: 'Calle Primavera 210, Col. Jardín',
    uuid: 'ST-0004',
    status: 'Desactivada',
    members: [
      { id: 1, name: 'Gabriela Núñez', email: 'gabriela.nunez@ejemplo.com', role: 'Encargado', joinedAt: '2025-11-05' },
      { id: 2, name: 'Héctor Vázquez', email: 'hector.vazquez@ejemplo.com', role: 'Empleado', joinedAt: '2026-01-25' }
    ]
  }
];

export function findTiendaById(id: string): Tienda | undefined {
  return TIENDAS.find((tienda) => tienda.id === id);
}
