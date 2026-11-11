# Pendientes para terminar miniShop

Alcance de esta revisión: frontend y backend para los roles `EMPLOYEE`, `MANAGER`, `WAITING` y `ADMIN`. Se excluyen las funciones de proveedores/pedidos a proveedores.

## Antes del deploy

### P0 — Seguridad y aislamiento de datos

- [ ] **Cerrar el acceso al API de usuarios.** `UsersController` no tiene guardas: listado, consulta, alta, edición y eliminación quedan expuestos. `getUsers` y `createUser` además pueden devolver el hash de contraseña. Exigir autenticación y permisos por operación, limitar consultas al ámbito autorizado y nunca serializar `password`.
- [ ] **Asegurar las rutas de administración de tiendas.** `PATCH /shop/byid/:uuid` y `DELETE /shop/:uuid` no tienen autenticación ni rol; protegerlas para `ADMIN` y exigir confirmación/registro de auditoría para operaciones destructivas.
- [ ] **Aplicar autorización y propiedad por tienda en todo el API.** `CreditController` no tiene guardas. `ShopRegisterController`, `ProductController` y `CategoryController` solo verifican JWT en el controlador y varios métodos aceptan IDs arbitrarios sin comprobar rol ni que el recurso pertenezca a `req.user.shopUuid`. Aplicar guardas por rol y validar dueño/tienda en cada lectura y mutación; no confiar en el guard del frontend.
- [ ] **Revisar límites en ventas y fiados.** `SaleController` permite `EMPLOYEE`, `MANAGER` y `ADMIN` a nivel de clase, y varias operaciones trabajan por ID o por query de tienda. Comprobar que un usuario solo vea o modifique datos de su tienda y decidir explícitamente qué acciones puede hacer cada rol.
- [ ] **Endurecer las transiciones de empleados.** El servidor debe aceptar solicitudes solo para cuentas elegibles y de una tienda válida; al aprobar/rechazar/remover, comprobar rol actual y pertenencia a la tienda para impedir trasladar cuentas entre tiendas arbitrariamente.
- [ ] **Revisar sesión para producción.** El backend ya configura la cookie como `HttpOnly`, `Secure` y `SameSite=None`. Confirmar HTTPS, CORS con origen explícito y credenciales, expiración/renovación y borrado de cookie en el entorno de deploy.

### P1 — Roles y flujos operativos

- [x] **Proteger la navegación de cuentas en espera en el frontend.** `roleGuard` redirige a `WAITING` a `/esperando` y solo permite esa vista (además de `/auth` y la ruta inicial, que redirige allí). El backend todavía necesita los controles del bloque P0.
- [ ] **Restringir rutas de encargado en frontend.** `/empleados` y `/tiendita` usan el guard, pero no declaran roles permitidos; un `EMPLOYEE` puede abrirlas por URL aunque el menú o la pantalla escondan acciones. Declarar permisos por ruta (`MANAGER` para gestión de empleados y horario; `EMPLOYEE` solo donde corresponda).
- [x] **Conectar la pantalla de empleados a datos reales.** Carga solicitudes/empleados desde `/shop/myshop` y usa endpoints de aceptar, rechazar y quitar acceso; ya no depende de listas locales ni compara el UUID con el nombre.
- [ ] **Permitir que una cuenta removida vuelva a solicitar acceso.** Backend deja `shopUuid: null` y `role: WAITING`, pero el frontend no ofrece un flujo para encontrar/solicitar otra tienda; definir una pantalla de cuenta sin tienda y la solicitud correspondiente.
- [ ] **Persistir los días de apertura.** `TienditaComponent.save()` solo actualiza `StoreService` en memoria, aunque confirma que guardó. Crear endpoint y persistencia en backend, cargar el horario al entrar y distinguir error de éxito.
- [x] **Registrar el cierre de caja en el backend.** El cajero invoca `PATCH /shopregister/close` y refresca los datos tras éxito. Revisar autorización por rol/tienda del endpoint (ver P0) antes de producción.
- [ ] **Completar apertura/fondo de caja y reportes con fuente única.** Aclarar qué campos se mantienen en backend y retirar `CAJA_HISTORY_KEY`, ventas/productos locales y cálculos oficiales basados en `localStorage`; el historial de cierres ya tiene endpoints, pero validar consistencia de totales y saldos.
- [ ] **Completar estados de carga, error y vacío.** Varias funciones convierten fallos en `[]` o `null`, y vistas como empleados pueden mostrar “sin resultados” en vez de error. Mantener estados separados y permitir reintentar.

## Administración (`ADMIN`)

- [ ] **Reemplazar el catálogo demo de tiendas por datos reales.** `admin.data.ts`, `AdminComponent` y `StoreDetailsComponent` usan `TIENDAS` ficticias; la API ya expone `GET /shop` y `GET /shop/byid/:uuid`, pero falta conectar las vistas y sus DTOs.
- [ ] **Definir qué significa activar/desactivar una tienda.** La UI cambia un estado local; el modelo Prisma `Shop` no tiene campo de estado. Decidir si se requiere suspensión y sus efectos, agregar migración/validación/API, o retirar esa acción del alcance inicial.
- [ ] **Completar gestión administrativa de miembros.** La vista demo permite cambiar encargado/empleado y remover miembros localmente. Definir política de cambio de rol, proteger al menos un encargado, exponer endpoints autorizados y reflejar los cambios persistidos.
- [ ] **Definir el alcance del panel admin para el MVP.** Mínimo recomendado: listar/buscar tiendas, detalle real (dirección, encargado, empleados, fechas), indicadores calculados de datos reales y acciones administrativas explícitas con confirmación y auditoría.
- [ ] **Crear el primer administrador de forma segura.** `backend/prisma/seed.ts` está vacío y el registro público bloquea el rol `ADMIN`, lo cual es adecuado. Usar un comando/seed de bootstrap idempotente con correo y contraseña desde secretos del entorno, contraseña hasheada con el mismo servicio, sin credenciales por defecto en el repo; documentar cómo rotar o recuperar el acceso.
- [ ] **Asegurar el bootstrap antes de abrir el registro público.** Evitar que el despliegue quede sin administrador; comprobar el resultado del seed y tener un procedimiento de restauración de acceso probado.

## Revisión funcional por rol

- **`WAITING`:** pantalla de espera y redirección frontend implementadas. Falta garantizar que ningún endpoint del backend acepte este rol para operaciones de tienda y terminar el flujo cuando la cuenta no tiene tienda.
- **`EMPLOYEE`:** ya puede acceder a operaciones comunes del negocio y su menú no muestra gestión de tienda. Falta denegar esas rutas también por guard de frontend y, sobre todo, definir y aplicar permisos/propiedad en backend; evaluar acceso de empleado a ventas, fiados, caja y datos sensibles.
- **`MANAGER`:** gestión de solicitudes y empleados conectada; horario, pedidos y parte de los datos de tienda siguen en estado local/demo. Falta persistencia del horario y asegurar en servidor que solo administre su tienda.
- **`ADMIN`:** guard frontend limita `/admin`; el panel es demo y el API administrativo está incompleto y parcialmente desprotegido. Priorizar primero seguridad de API y después modelo/endpoints/UI reales.

## Calidad y preparación para producción

- [ ] **Agregar pruebas de autorización y flujos críticos.** Cubrir matriz rol × endpoint/ruta, acceso cruzado entre tiendas, WAITING, aprobación/remoción, cobro, cierre de caja y fiados.
- [ ] **Eliminar o acotar datos demo que siguen visibles.** El login usa backend y no se encontró el antiguo `AuthService`/almacenamiento de cuentas demo; quedan tiendas falsas en admin y otras pantallas con datos de muestra.
- [ ] **Quitar logs de depuración del frontend.** Hay `console.log` en login, dashboard, caja, ventas, fiados y tiendita.
- [ ] **Eliminar dependencias de datos locales para cifras oficiales.** El cajero mantiene historiales/cantidades en `localStorage`; conservar local solo para preferencias o borradores, no para caja ni reportes.
- [ ] **Tipar los datos de productos y respuestas.** `ProductsComponent` todavía usa `any[]` aunque hay `ProductDTO`.
- [ ] **Evitar recargas completas y mensajes falsos.** Producto editado usa `window.location.reload()`; revisar errores de UX y respuestas falsas de éxito. En fiados, `submitGuarantor()` muestra `${name}` sin que esa variable exista en el método.
- [ ] **Unificar manejo de carga y error y revisar accesibilidad.** Añadir reintentos, deshabilitar acciones durante peticiones y comprobar teclado/foco en modales y formularios.
- [ ] **Hacer una pasada final de configuración de deploy.** Variables de entorno frontend/backend, CORS/cookies, migraciones Prisma, seed de admin, HTTPS, logs, backups y procedimiento de rollback.
