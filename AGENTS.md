# AGENTS.md

Angular 22 + Tailwind CSS v4 "miniShop" admin UI for a tiendita/abarrotes: products, cajero/POS, fiados, orders (pedidos a proveedores), tiendita schedule, employees and an admin store registry. Mixed state: production data (products, sales, guarantors, session) comes from a real REST backend via axios (cookie sessions); some state is still in-memory signals + localStorage (orders, open days, closures, demo user fallback).

## Commands
- `npm run build` — build AND the de-facto typecheck (Angular AOT + strict template checking). Run after any change; there is no separate `lint`/`typecheck` script.
- `npm test` — Vitest (jsdom) via `@ngx-env/builder:unit-test`; runs every `src/**/*.spec.ts`.
- `npm start` — dev server (default development config).
- npm only (`packageManager: npm@11.5.2`).
- The build requires `.env` in the repo root with `NG_APP_BACKEND_ROUTE` (consumed via `@ngx-env/builder`, see `src/app/constants/global.ts`).

## Architecture
- Standalone components only, no NgModules. Each view is a folder under `src/app/views/<feature>/` with `<name>.ts` + `<name>.html` (`templateUrl`, never inline templates); sub-features nest as folders (e.g. `products/product-details/`, `products/product-card/`, `admin/store-details/`, `cajero/scripts/`). State via `input()` / `output()` / `signal()` / `computed()`.
- Reusable UI lives in `src/app/ui/<name>/` and is imported per-component: Button, Input, Select, Modal, ConfirmModal, Toast, SearchSuggestions, AuthTabs, Header, Sidebar, ThemeToggle, Loader (with `LoaderService`).
- Layering: `src/app/api/` holds per-resource axios wrappers (`api/auth.ts`, `api/user.ts`, `api/products.ts`, `api/category.ts`, `api/guarantor.ts`, `api/sales.ts`); `src/app/dto/` holds request/response interfaces; `src/app/entities/` holds enums (Role, PaymentMethod, CreditStatus); `src/app/scripts/` holds pure helpers (`error.ts` `showError`, `date.ts` `getDate`, `guarantor.ts`); `src/app/constants/global.ts` exports `backendRoute = import.meta.env['NG_APP_BACKEND_ROUTE']`.
- Backend convention: axios with `withCredentials: true` (cookie session). `api/auth-errors.ts` (`registerAuthErrorHandler`, wired in `App`'s constructor) installs a response interceptor that logs out and redirects to `/auth` on any 401 (except `/auth/profile` while already on `/auth`). `scripts/error.ts` `showError` maps status codes to toasts and 401/403 redirects.
- `app.html` renders sidebar/header only when NOT on `/auth` or `/esperando` (`isBarePage` in `app.ts`). `<app-toast />` and `<app-loader />` sit at the app root so `ToastService` / `LoaderService` work on every page.
- `app-search-suggestions` is generic (`SearchSuggestionsComponent<T>`): pass `items`, an `itemTemplate` (`<ng-template #tpl let-item>` with `$implicit` context), bind `queryChange`/`selected`. Dropdown closes on outside click / Escape / selection — it owns that logic.
- `StoreService` (`src/app/store.service.ts`) is the shared in-memory store: `orders`, `openDays` and `closures` (daily closures, persisted to `localStorage` key `minishop_closures`) signals. Both `views/orders/orders.ts` and `views/tiendita/tiendita.ts` inject it for order/open-day mutations. Fiados are NOT here anymore — they hit the backend via `api/guarantor.ts`.
- Modal content area is `overflow-y-auto`; absolutely-positioned dropdowns inside a modal scroll/clip with it.
- Animations: keyframes/classes are `ms-*` in `src/styles.css`. The `animate.enter="ms-*"` attributes used across templates are inert (no directive registered) — to actually animate, add the `.ms-*` class directly (as `toast.html` does).

## State & auth
- Real login/register/session goes through the backend (`api/auth.ts`, `api/user.ts`). `AuthService` (`src/app/auth/auth.service.ts`) still keeps a localStorage fallback (`minishop_session`, `minishop_users`, `minishop_users_version` = 2; bump the version to re-seed demo users) and maps backend roles: `MANAGER`→encargado, `EMPLOYEE`→empleado, `WAITING`→empleado(status pending), `ADMIN`→admin. `SessionService` (thin wrapper over `validateSession`) is what `authGuard` calls.
- There is a single route guard, `authGuard` in `src/app/auth/auth.guard.ts`: shows the Loader, validates the session against the backend, and redirects to `/auth` if invalid. Roles available: `encargado | empleado | admin` (backend enum `Role` in `entities/Role.ts`). New `empleado` registrations land in `WAITING` and only reach `/esperando` until the encargado approves (`approveEmployee` in `AuthService`, UI in `views/empleados/`).
- Routes (in `src/app/app.routes.ts`): `/dashboard`, `/products`, `/products/:code`, `/cajero`, `/fiados`, `/pedidos`, `/tiendita`, `/empleados`, `/admin`, `/admin/:id`, `/auth`, `/esperando`.
- Static/demo data lives in co-located `*.data.ts` files (e.g. `views/orders/orders.data.ts` exports `Order`, `ORDERS`, `SUPPLIERS`, `findSupplierByName`, `formatDate`; `views/admin/admin.data.ts` exports `TIENDAS`; `views/tiendita/tiendita.data.ts` exports `MONTHLY_SALES`; `views/cajero/cajero.data.ts` exports `CartLine`/`SaleRecord` types). Order recurrence helpers are pure functions in `views/orders/recurrence.ts` (`nextOccurrence` clamps monthly dates). The cajero view keeps focused pure helpers in `views/cajero/scripts/` (cart, dates, formatters, inventory, sales, storage, validations).

## Conventions
- All UI text and code identifiers are in Spanish (commit messages too, e.g. "Implementa autenticación por roles y control de acceso").
- Tailwind v4: theme colors are CSS vars in `:root`/`.dark` (`--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--surface`, `--card`, `--text`, etc.); use arbitrary syntax like `bg-(--primary)`. No Tailwind config file; `@import 'tailwindcss'` in `src/styles.css`.
- Dates for static data are ISO `YYYY-MM-DD` strings (compare/sort lexicographically) and formatted for display with `Intl.DateTimeFormat('es-MX', ...)` (`formatDate`). The backend returns JS `Date` objects; `scripts/date.ts` `getDate` formats them.
- Recurring orders (`Order.recurrence`, e.g. `diario` / `dias_semana` with `days`) are excluded from the normal waiting/unconfirmed/finalized lists and rendered only in the "Pedidos programados" section of the "En espera" tab, with `expectedDate` rolled forward to the next future occurrence. The tiendita view blocks saving an open-days schedule that conflicts with any active recurring order.

## Testing
- Specs use Vitest globals (no `import` for `describe/it/expect`), `TestBed`, and real routes (`provideRouter(routes)`); tests that touch auth clear `localStorage` in `beforeEach`.
- Currently 4 spec files / 28 tests (count drifts; don't rely on it): `app.spec.ts`, `ui/toast/toast.service.spec.ts`, `ui/loader/loader.service.spec.ts`, `views/orders/recurrence.spec.ts`.