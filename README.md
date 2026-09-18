# Sistema de Administración para Tienditas / Abarrotes

Plataforma web para administrar una tienda de abarrotes ("tiendita"): productos e inventario, cobro en caja (POS), fiados, pedidos a proveedores, horario de apertura, empleados y un registro de tiendas para el administrador. Pensada para dos perfiles principales —el **encargado/dueño** y el **empleado (cajero)**— más un rol de **admin** de la plataforma.

## Roles del sistema

| Acción | Encargado | Empleado | Admin |
|---|:---:|:---:|:---:|
| Registrar tienda | ✅ | ❓ *(vía encargado)* | ✅ |
| Registrar empleado | ✅ | ❌ | ❌ |
| Aprobar / gestionar empleados | ✅ | ❌ | ❌ |
| Crear / editar / eliminar productos | ✅ | ❌ | ❌ |
| Editar precio de un producto | ✅ | ✅ | ❌ |
| Consultar listado de productos | ✅ | ✅ | ✅ |
| Registrar ventas (cobrar) | ✅ | ✅ | ❌ |
| Ajustar cuentas de fiados | ✅ | ✅ | ❌ |
| Generar cierre de caja | ✅ | ✅ | ❌ |
| Consultar resumen del día | ✅ | ✅ | ❌ |
| Ver resumen mensual | ✅ | ✅ | ❌ |
| Crear / recibir / finalizar pedidos a proveedores | ✅ | ✅ | ❌ |
| Configurar horario de apertura de la tiendita | ✅ | ✅ | ❌ |
| Registrar / administrar tiendas | ❌ | ❌ | ✅ |

Los roles se mapean desde el backend (`Role`): `MANAGER` → encargado, `EMPLOYEE` → empleado, `WAITING` → empleado pendiente de aprobación, `ADMIN` → admin. Un empleado recién registrado llega a la vista `/esperando` y solo opera tras ser aprobado por el encargado.

## Funcionalidad por sección

- **Dashboard** — resumen de ventas del día (total, cantidad, última venta).
- **Productos** — catálogo con categorías, código, precio, stock e imagen; alta, edición, eliminación y detalle por código.
- **Cajero (POS)** — venta tipo carrito con búsqueda por nombre/código, stock en tiempo real, métodos de pago (efectivo, tarjeta, mixto, fiado), fondo inicial y cierre de caja diario.
- **Fiados** — personas con fiado y sus créditos; desde "Ajustar cuenta" se puede incrementar, restar o pagar deuda (con modal de confirmación).
- **Pedidos (proveedores)** — pedidos a proveedores en espera / no confirmados / finalizados, filtros por fecha y proveedor, pedidos programados recurrentes (`diario` o `dias_semana`), registro de entrega recibida.
- **Tiendita** — horario de apertura semanal (con bloqueo si un pedido recurrente se recibe en un día cerrado), resumen mensual y cierres de caja del mes.
- **Empleados** — solicitudes pendientes de aprobación, listado de empleados de la tienda.
- **Admin** — registro de tienditas del sistema y detalle de cada una (solo rol `ADMIN`).

## Stack técnico

- Angular 22 (standalone components, signals, `input()`/`output()`, no NgModules).
- Tailwind CSS v4 (tema por variables CSS en `:root` / `.dark`, sin archivo de configuración).
- axios con sesión por cookies (`withCredentials`) contra un backend REST.
- Variables de entorno vía `@ngx-env/builder` (`NG_APP_BACKEND_ROUTE`).
- Pruebas con Vitest (jsdom) vía `@ngx-env/builder:unit-test`.

## Configuración

El frontend debe apuntar al backend REST. En la raíz del repositorio debe existir un archivo `.env`:

```
NG_APP_BACKEND_ROUTE=http://localhost:<puerto>  # ruta base del backend
```

## Comandos

| Comando | Descripción |
|---|---|
| `npm start` | Levanta el servidor de desarrollo |
| `npm run build` | Compila (también es el typecheck de facto) |
| `npm test` | Ejecuta los tests de Vitest |

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Encargado | carlos.ruiz@ejemplo.com | encargado123 |
| Empleado | laura.gomez@ejemplo.com | empleado123 |
| Empleado (pendiente) | ana.torres@ejemplo.com | pendiente123 |
| Admin | admin@minishop.com | admin123 |

## Estado de los datos

Los datos de producción (productos, ventas, fiados/garantes, sesión) provienen del backend REST. Los pedidos a proveedores y el horario/cierres de la tiendita aún viven en memoria y `localStorage` (`minishop_closures`), y `AuthService` mantiene usuarios demo en `localStorage` como respaldo de sesión.