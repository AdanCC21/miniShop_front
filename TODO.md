## Pendientes urgentes

### Prioridad alta: antes de usar la caja en operación real

- [ ] **Completar el cierre de caja.** La confirmación actual muestra un mensaje de éxito, pero no llama a la operación de cierre del backend ni limpia el estado relacionado con la caja. La interfaz puede dar a entender que el cierre se registró cuando no ocurrió.
- [ ] **Conectar y corregir la gestión de empleados.** Aprobar, rechazar o eliminar empleados modifica datos guardados en el navegador, no la cuenta real del servidor. Además, las listas comparan el UUID de la tienda con su nombre, por lo que pueden aparecer vacías.
- [ ] **Conectar el panel de administración a datos reales.** La lista de tiendas, sus estados y miembros son datos fijos de ejemplo; sus acciones no se guardan en el servidor.
- [ ] **Persistir el horario de apertura.** La pantalla muestra “Cambios guardados”, pero el horario se actualiza en una señal en memoria y se pierde al recargar.
- [ ] **Completar la persistencia de pedidos.** Los pedidos y sus cambios viven en datos de ejemplo y memoria del navegador; no se conservan de forma fiable entre sesiones o dispositivos.

### Seguridad

- [ ] **Eliminar las cuentas de demostración del frontend de producción.** El formulario actual inicia sesión con el backend, pero `AuthService` conserva cuentas y contraseñas de ejemplo y escribe esos registros en `localStorage` en texto legible cuando se consultan las listas locales de empleados. No deben tratarse como credenciales reales ni servir para autorizar operaciones.
- [ ] **Añadir autorización por rol a las rutas del frontend.** `authGuard` comprueba que haya una sesión, pero no limita por rol rutas como `/admin`, `/empleados` o `/tiendita`. Ocultar enlaces en el menú no impide que se escriba una URL directamente. El backend debe seguir validando cada permiso; el control de interfaz sirve solo como complemento.
- [ ] **Revisar el uso de almacenamiento local para datos operativos.** Los pedidos, cierres, fondo de caja y datos de demostración se guardan en el navegador o en memoria. El usuario puede modificarlos desde el navegador y no son una fuente confiable para saldos ni reportes.
- [ ] **Verificar la configuración de las cookies de sesión en el servidor.** El frontend envía cookies con `withCredentials`; las opciones `HttpOnly`, `Secure` y `SameSite` dependen del backend y no se pueden confirmar en este análisis del frontend.

En la revisión estática del frontend no se identificó uso explícito de `eval`, `innerHTML` o mecanismos para omitir la sanitización de Angular. Esto no sustituye una auditoría dinámica ni una revisión del backend.

### Otras tareas pendientes

- [ ] **Corregir la información de caja derivada de historiales locales.** Hay estructuras de ventas en `localStorage` que no se actualizan con las ventas registradas en el backend; no deben utilizarse para mostrar totales oficiales.
- [ ] **Distinguir errores de carga de listas vacías.** Algunas funciones de API devuelven `[]` al fallar, igual que cuando no hay resultados. La interfaz debería conservar un estado de error separado del estado vacío.
- [ ] **Agregar pruebas de los flujos de negocio.** Priorizar acceso y permisos, cobro, cambio de inventario, cierre de caja, pago de fiados y persistencia de empleados y pedidos.
- [ ] **Revisar la pantalla de administración para que use identificadores reales.** El catálogo actual usa identificadores y UUID de ejemplo; no corresponde con tiendas registradas en el backend.

## Malas prácticas y deuda técnica

- [ ] **Reducir el uso de tipos sin validar.** Por ejemplo, el catálogo de productos usa `any[]` aunque existe un DTO para productos.
- [ ] **Retirar datos de demostración y código comentado que ya no corresponde al flujo actual.** Hay listas de usuarios, tiendas y pedidos de ejemplo, además de funciones de almacenamiento local que ya no representan la operación real.
- [ ] **Eliminar registros de depuración antes de producción.** Hay `console.log` que imprimen ventas, respuestas de API y datos de inventario en la consola del navegador.
- [ ] **Evitar recargas completas de la página después de guardar.** Algunos flujos usan `window.location.reload()` en vez de actualizar el estado de Angular o navegar de forma controlada.
- [ ] **Unificar los estados de carga y error.** Las pantallas usan distintas convenciones para representar carga, error y ausencia de datos.
- [ ] **Corregir mensajes de éxito con valores locales incorrectos.** El alta de fiadores utiliza una referencia `name` que no se toma del campo del formulario, por lo que el mensaje puede mostrar un valor vacío o ajeno.
- [ ] **Revisar la organización del código del cajero.** Aún conserva modelos e historial local de ventas junto con el flujo nuevo del backend, lo que hace difícil identificar cuál estado es la fuente oficial.