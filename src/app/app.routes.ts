import { Routes } from '@angular/router';

import { AuthPageComponent } from './views/auth-page/auth-page';
import { DashboardComponent } from './views/dashboard/dashboard';
import { EsperandoComponent } from './views/esperando/esperando';
import { OrdersComponent } from './views/orders/orders';
import { ProductsComponent } from './views/products/products';
import { ProductDetailsComponent } from './views/products/product-details/product-details';
import { CajeroComponent } from './views/cajero/cajero';
import { FiadosComponent } from './views/fiados/fiados';
import { TienditaComponent } from './views/tiendita/tiendita';
import { EmpleadosComponent } from './views/empleados/empleados';
import { AdminComponent } from './views/admin/admin';
import { StoreDetailsComponent } from './views/admin/store-details/store-details';
import { AdminUsersComponent } from './views/admin/users/users';
import { SalesComponent } from './views/sales/sales';
import { NoAutorizadoComponent } from './views/no-autorizado/no-autorizado';

import { roleGuard } from './auth/role.guard';
import { Role } from './entities/Role';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'auth', component: AuthPageComponent },
  { path: 'no-autorizado', component: NoAutorizadoComponent },
  { path: 'esperando', component: EsperandoComponent, canActivate: [roleGuard] },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [roleGuard]
  },
  {
    path: 'products',
    component: ProductsComponent,
    canActivate: [roleGuard]
  },
  {
    path: 'products/:code',
    component: ProductDetailsComponent,
    canActivate: [roleGuard]
  },
  {
    path: 'cajero',
    component: CajeroComponent,
    canActivate: [roleGuard]
  },
  {
    path: 'ventas',
    component: SalesComponent,
    canActivate: [roleGuard]
  },
  {
    path: 'fiados',
    component: FiadosComponent,
    canActivate: [roleGuard]
  },
  {
    path: 'pedidos',
    component: OrdersComponent,
    canActivate: [roleGuard]
  },
  {
    path: 'tiendita',
    component: TienditaComponent,
    canActivate: [roleGuard]
  },
  {
    path: 'empleados',
    component: EmpleadosComponent,
    canActivate: [roleGuard]
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [roleGuard],
    data: { roles: [Role.ADMIN] }
  },
  {
    path: 'admin/:id',
    component: StoreDetailsComponent,
    canActivate: [roleGuard],
    data: { roles: [Role.ADMIN] }
  },
  {
    path: 'usuarios',
    component: AdminUsersComponent,
    canActivate: [roleGuard],
    data: { roles: [Role.ADMIN] }
  }
];
