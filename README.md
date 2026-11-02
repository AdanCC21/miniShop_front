# miniShop Frontend

## Descripción

miniShop es una aplicación web para apoyar la operación de una tienda de abarrotes. Permite consultar productos, registrar ventas, administrar cuentas de fiado, revisar actividad de la tienda y gestionar usuarios. La interfaz está en español y se adapta a computadoras y dispositivos móviles.

El frontend está construido con Angular y Tailwind CSS. Se comunica con un backend REST para algunas operaciones, mientras que otras secciones todavía utilizan datos de ejemplo, memoria del navegador o `localStorage`. Por eso, el estado actual es el de un producto en desarrollo: varias funciones principales están conectadas, pero todavía hay flujos importantes que no guardan sus cambios en el servidor.

## Cómo funciona

- Angular muestra las pantallas y administra el estado de la interfaz mediante componentes independientes y señales.
- Al navegar a una sección protegida, el frontend consulta la sesión al backend. Las peticiones HTTP usan cookies de sesión.
- Las operaciones conectadas al servidor se agrupan principalmente en `src/app/api/`. Los errores de esas peticiones se presentan mediante mensajes en pantalla.
- Parte de la información de la sesión, el tema visual y algunos datos operativos se guardan en el navegador. Los datos guardados en el navegador pueden perderse, modificarse o no coincidir entre dispositivos.
- Para iniciar el frontend se configura `NG_APP_BACKEND_ROUTE` en `.env`, con la dirección base del backend.

## Roles

| Rol en la interfaz | Función prevista | Estado observado |
|---|---|---|
| **Administrador** | Consultar y administrar las tiendas de la plataforma. | La sección de administración todavía usa tiendas y miembros de ejemplo. |
| **Encargado** | Administrar una tienda, productos y empleados, además de consultar la actividad operativa. | La autenticación y varias operaciones de tienda usan el backend; la administración de empleados y algunos ajustes siguen siendo locales. |
| **Empleado** | Registrar ventas y consultar las secciones operativas permitidas. | Puede operar con servicios conectados al backend; las restricciones de ruta no se aplican por rol en el router del frontend. |
| **Empleado pendiente** | Esperar a que el encargado apruebe su acceso. | Se representa con la pantalla `/esperando`; el flujo de aprobación actual usa datos locales. |

Los nombres técnicos recibidos del servidor se traducen a los roles de la interfaz: `MANAGER` a encargado, `EMPLOYEE` a empleado, `WAITING` a empleado pendiente y `ADMIN` a administrador.

## Secciones

| Sección | Qué ofrece | Estado actual |
|---|---|---|
| **Inicio (`/dashboard`)** | Resumen e historial de ventas del día y detalle de cada venta. | Consulta ventas al backend. |
| **Productos (`/products`)** | Catálogo, búsqueda, filtro por categoría, ordenamiento y alta de productos. Incluye detalle, edición y control de inventario. | Productos y categorías se consultan o modifican mediante el backend. |
| **Cajero (`/cajero`)** | Carrito, validación de inventario, cobro en efectivo, tarjeta, pago mixto o fiado, consulta de ventas recientes y apertura de caja. | Ventas, inventario y apertura de caja usan el backend. El flujo de cierre de caja no está terminado. |
| **Fiados (`/fiados`)** | Consulta de fiadores, cuentas, abonos y ajuste de saldos. | Se conecta al backend para fiadores y créditos. |
| **Pedidos (`/pedidos`)** | Pedidos a proveedores, estados y recurrencias. | Los datos y cambios se mantienen principalmente en memoria; no hay persistencia de pedidos en el servidor desde esta interfaz. |
| **Tiendita (`/tiendita`)** | Resumen de ventas, datos de la tienda, horario y cierres. | Ventas y datos de la tienda se consultan al backend. El horario se mantiene en memoria y los cierres se guardan en el navegador. |
| **Empleados (`/empleados`)** | Aprobación, rechazo y consulta de empleados. | Las operaciones se realizan con datos locales de demostración; no representan cambios persistidos en el backend. |
| **Administrador (`/admin`)** | Listado y detalle de tiendas. | Usa un catálogo fijo de ejemplo; los botones de estado, rol y eliminación solo cambian la interfaz. |
| **Acceso (`/auth`)** | Inicio de sesión y registro de encargado o empleado. | El inicio de sesión y registro llaman al backend. El código todavía conserva una implementación local de usuarios de demostración. |
| **En espera (`/esperando`)** | Informa al empleado que su cuenta requiere aprobación. | La pantalla existe; la aprobación real debe completarse en el flujo de gestión de empleados. |

## Estado actual del proyecto

El frontend combina funciones conectadas al backend con pantallas de demostración y estado local. Productos, categorías, ventas, inventario, fiadores, créditos y datos de la tienda tienen integración con el servidor. Los pedidos, el horario, la gestión de empleados y el panel de administración todavía no tienen un flujo completo y persistente en el backend desde la interfaz.

El proyecto tiene cuatro archivos de pruebas automatizadas: pruebas de la aplicación, del servicio de carga, del servicio de notificaciones y de recurrencias de pedidos. No se observan pruebas de los flujos principales de acceso, ventas, inventario, fiados, administración o empleados.

En la última compilación observada, Angular compiló correctamente, pero el paquete inicial superó el presupuesto configurado de 500 kB por aproximadamente 43 kB. Conviene revisar el tamaño inicial y considerar carga diferida de secciones.

## Configuración y comandos

Se requiere un archivo `.env` en la carpeta `frontend` con la URL base del backend:

```env
NG_APP_BACKEND_ROUTE=http://localhost:3000
```

| Comando | Uso |
|---|---|
| `npm start` | Iniciar el servidor de desarrollo. |
| `npm run build` | Compilar y verificar plantillas y tipos de Angular. |
| `npm test` | Ejecutar las pruebas unitarias configuradas con Vitest. |
