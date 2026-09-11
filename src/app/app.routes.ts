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

import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'auth', component: AuthPageComponent },
  { path: 'esperando', component: EsperandoComponent, canActivate: [authGuard] },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'products',
    component: ProductsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'products/:code',
    component: ProductDetailsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'cajero',
    component: CajeroComponent,
    canActivate: [authGuard]
  },
  {
    path: 'fiados',
    component: FiadosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'pedidos',
    component: OrdersComponent,
    canActivate: [authGuard]
  },
  {
    path: 'tiendita',
    component: TienditaComponent,
    canActivate: [authGuard]
  },
  {
    path: 'empleados',
    component: EmpleadosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/:id',
    component: StoreDetailsComponent,
    canActivate: [authGuard]
  }
];
