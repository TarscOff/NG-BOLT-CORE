# PSX-NG-CORE – Angular 19 CORE (@cadai/psx-ng-core)

> _Last updated: 2025-09-11_

> 🚀 Modern Angular 19 project (Proximus core Angular SDK) with runtime environment configs, standalone components, NgRx state management, dynamic forms, internationalization, and full CI/CD support.

# PxsNgCore

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.6.

---

## 🧭 Quick Start for Developers

1. Set up a Keycloak client (Public + PKCE S256) and brokered IdPs if needed.
2. Update `public/assets/config.dev.json` (`auth.url/realm/clientId`).
3. `npm start` → app redirects to Keycloak and back.
4. Verify API calls include Bearer token.
5. For CSP, start with Report‑Only and review DevTools for violations.

---

## 🔗 Testing Local Changes Without Publishing

When you make changes to the core library and want to test them in a consumer app (e.g. `frontend-generic`) **before** going through CI/CD and the registry, use `npm link`.

### Step 1 — Build the library

```bash
cd path/to/PXS-NG-CORE
npm run build:core
```

### Step 2 — Register the dist folder globally

```bash
cd dist/core
npm link
```

### Step 3 — Link it into the consumer app

```bash
cd path/to/your-project
npm link @cadai/pxs-ng-core
```

### Step 4 — Fix the dual Angular instance issue

Because `npm link` uses a symlink, the bundler may resolve Angular from two different `node_modules` and throw type errors (`DestroyRef`, `FormGroup`, etc.).

Fix by adding `"preserveSymlinks": true` to the build options in `angular.json` of the consumer app:

```json
"build": {
  "builder": "...",
  "options": {
    "preserveSymlinks": true,
    ...
  }
}
```

And serve your project by this command

```bash
cd path/to/your-project
ng cache clean && ng serve
```

### Unlinking — go back to the registry version

```bash
cd path/to/your-project
npm unlink @cadai/pxs-ng-core
npm install
```

And revert `"preserveSymlinks": true` from `angular.json` if you no longer need it.

---

## 🧱 Project Overview

This repository provides a scalable, production-ready **Angular 19** setup using best practices including:

- ✅ **Standalone component architecture**
- 🌐 **Runtime environment configuration** via `public/assets/config.json`
- 🔐 **Authentication with Keycloak (Broker, PKCE, iframe‑free)**
- 🔒 **Strict Content Security Policy (CSP)** compatible with Keycloak (no iframes)
- 🔄 **NgRx** for reactive global state (Store + Effects + Actions + Selectors + Models)
- 🧩 **Dynamic Forms** via reusable `FieldConfig` pattern
- 🌍 **Internationalization** with `@ngx-translate`
- 🎨 **Angular Material + CDK** UI framework
- 🐳 **Docker + Nginx** with runtime-templated CSP
- 🦾 **CI/CD** examples (Azure Pipelines & GitLab CI)

---

## 📐 Features Used

- ✅ **Angular 19 Standalone APIs**
- ✅ **NgRx** for scalable and reactive global state
- ✅ **Reactive Forms** with dynamic schema rendering
- ✅ **Internationalization (i18n)** via `@ngx-translate`
- ✅ **Angular Material** UI with responsive layout
- ✅ **Signal-based ThemeService** Theming
- ✅ Integrated **Toasts**, **Dialogs**, and **Tooltips**
- ✅ Integrated Custom **Forms** Builder and custom reusable **Fields**
- ✅ Strict **TypeScript** config (`strict: true`) with ESLint
- ✅ **CI/CD-ready** with Azure Pipelines & GitLab CI support

## 6. 📥 Consuming the Library in Apps

In any Angular app:

```bash
npm install @cadai/pxs-ng-core
```

Since `.npmrc` is already configured, npm resolves it via the Azure feed.

---

## 📦 Dependencies

### Framework & Core

- **Angular 19** (`@angular/core`, `@angular/common`, etc.)
- **Standalone APIs** (`bootstrapApplication`, `ApplicationConfig`)
- **RxJS 7.8**

### UI & Layout

- `@angular/material` – Material Design UI components
- `@angular/cdk` – Layout utilities
- `@angular/flex-layout` – Responsive layout engine

### State Management

- `@ngrx/store`, `@ngrx/effects`, `@ngrx/store-devtools`
- `ngrx-store-localstorage` – persistent global state

### Forms & UX

- **Reactive Forms**
- **Custom DynamicFormComponent**
- `FieldConfigService` for reusable, schema-based field configuration

### Internationalization (i18n)

- `@ngx-translate/core`
- `@ngx-translate/http-loader`

## 📁 Project Structure Highlights

This library follows an opinionated but consistent structure to keep features isolated and exports predictable.  
Below is an overview of the main directories and their responsibilities:

---

### Root

- **ng-package.json** – Configuration for `ng-packagr`, defines build output for the library.
- **package.json** – Library metadata, dependencies, scripts, version (used for CI/CD tagging).
- **tsconfig.\*.json** – TypeScript configs for library, production build, and tests.
- **README.md** – Project overview and contributor guide.

---

### `core/`

- **core.ts** – Core entry point logic and root exports.
- **index.ts** – Barrel file re-exporting everything in `core`.
- **public-api.ts** – Public surface of the `core` module.
- **ng-package.json** – Packaging config for this submodule.

---

### `enums/`

- **roles.enum.ts** – Application role definitions (e.g., `ROLE_admin`, `ROLE_user`).
- **index.ts / public-api.ts** – Barrels to make enums available via `@cadai/pxs-ng-core/enums`.

---

### `guards/`

- **auth.guard.ts** – Route guard for authentication and role-based access.
- **index.ts / public-api.ts** – Export guard(s) to consumers.

---

### `interceptors/`

- **auth.interceptor.ts** – Injects tokens into HTTP requests.
- **http-error.interceptor.ts** – Global HTTP error handling.
- **index.ts / public-api.ts** – Exports interceptors.

---

### `interfaces/`

- **field-config.model.ts** – Schema used by the dynamic forms system.
- **auth.model.ts, user.model.ts, team-management.model.ts** – Domain models.
- **app.model.ts, core.interface.ts, keycloak.model.ts** – Core interface definitions.
- **index.ts / public-api.ts** – Export all interfaces.

---

### `services/`

- **config.service.ts** – Runtime environment configuration loader.
- **date-formats.ts** – Date adapters and format providers for Angular Material.
- **field-config.service.ts** – Utilities for dynamic form configuration.
- **http.service.ts** – Abstraction on top of Angular HttpClient.
- **keycloak.service.ts** – Keycloak auth integration (login, refresh, logout).
- **layout.service.ts** – State/control for global layout (side nav, theme, etc.).
- **theme.service.ts** – Dark/light theme switching.
- **toast.service.ts** – UI notifications.
- **user.service.ts** – User API integration.
- **index.ts / public-api.ts** – Barrel exports.

---

### `shared/`

- **index.ts / public-api.ts** – Shared exports (UI and utilities).
- **CONTRIBUTING.md** – Contribution guide for shared components.
- **README-FORMS.md** – Documentation for the dynamic form system.

#### Subfolders:

- **forms/** – Dynamic form engine
  - `dynamic-form.component.ts/html/scss` – Main dynamic form container.
  - `field-host/field-host.component.ts` – Resolves a field config to its UI component dynamically.
  - `fields/` – Library of input components (`text-input`, `chips`, `select`, `datepicker`, `toggle`, etc.).
- **dialog/** – Reusable dialog component.
- **layout/** – Application layout wrapper (header, sidenav, content).
- **seo/** – SEO meta component for setting `<title>` and meta tags.

---

### `store/`

- **app.actions.ts / app.reducer.ts / app.effects.ts / app.selectors.ts** – Root NgRx store setup.
- **features/** – Feature-based state slices:
  - `auth/` – Auth-related actions, reducer, effects, selectors.
  - `user/` – User-related store logic.
  - `team-management/` – Team management state slice.
- **index.ts / public-api.ts** – Export NgRx store setup.

---

### `tokens/`

- **core-options.token.ts** – Angular `InjectionToken` for providing global core options.
- **index.ts / public-api.ts** – Token exports.

---

### `utils/`

- **form-validators.ts** – Reusable validators for dynamic forms.
- **index.ts / public-api.ts** – Utility exports.

---

### `src/`

- **public-api.ts** – Global entry point of the SDK.
- **CONTRIBUTING.md** – Contribution guide at the library root.

---

## 🧭 Conventions

- **Barrels (`index.ts` / `public-api.ts`)**  
  Every folder has an `index.ts` and/or `public-api.ts` that re-exports symbols. Always import from the SDK root (`@cadai/pxs-ng-core/...`) instead of deep paths.
- **Ng-Packagr configs**  
  Each subfolder is its own entry-point with its own `ng-package.json`. This ensures consumers can tree-shake and only import what they need.
- **Dynamic Form system**  
  New form fields must be declared inside `shared/forms/fields`, exported in its local `index.ts`, and mapped inside `field-host.component.ts`.

## 🎯 Project Roadmap – Ordered Checklist (Angular 19 + NgRx + Keycloak)

> _Last updated: 2025-08-22_

Legend: **✅ Done** · **🟡 In progress** · **❌ To do**  
Severity: **P0 Critical**, **P1 High**, **P2 Medium**, **P3 Low**  
Workload (est.): **S ≤1d**, **M 2–3d**, **L 4–7d**, **XL >1wk**

> Update **Status**, **Owner**, and **Next Actions** as you progress. Add links to PRs or wiki when relevant.

## ✅ Summary Table (Done → In Progress → To Do)

| Category | Item                                                                                 | Status | Severity | Workload | Summary                                                                                                                        | Key Files / Paths                                                                                      | Next Actions                                              | Owner |
| -------- | ------------------------------------------------------------------------------------ | -----: | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ----- |
| Core     | Barrels and config                                                                   |     ✅ | P1       | XL       | App uses standalone components, strict TS/ESLint. Also imports are done via barels `@cadai/pxs-ng-core/*`                      | `See core repository on Azure actifacts https://dev.azure.com/cadai/Socle/_artifacts/feed/PXS-NG-CORE` | —                                                         | FE    |
| Core     | Theming                                                                              |     ✅ | P2       | XL       | Customize app theming by providing primary, secondary, error, success, infor, danger,etc.. colors `*.scss*`                    | `See theming docs`                                                                                     | to be implement                                           | FE    |
| Core     | CI/CD                                                                                |     ✅ | P1       | M        | Automatic builds and deployments + Bumping versions                                                                            | `azure-pipelines.ylm`                                                                                  | -------                                                   | FE    |
| Core     | TS linter                                                                            |     ✅ | P1       | S        | Lint implementation to prevent from committing unsecure scripts + lint bfrore commit                                           | `husky`                                                                                                | --                                                        | FE    |
| Core     | Pre-commit Lints all over the project                                                |     ✅ | P1       | S        | use ling before commit                                                                                                         | `husky`                                                                                                | -----                                                     | FE    |
| Core     | Versionning                                                                          |     ✅ | P1       | S        | Auto upgrade version by bumping a Tag and pushing it when commiting a new release + creating a release note + CI/CD            | ---                                                                                                    |                                                           | FE    |
| Core     | Storybook                                                                            |     ❌ | P2       | XL       | Storybook implementation for every custom component in the app                                                                 | `projects/core/shared/*`                                                                               | TO BE IMPLEMENTED                                         | FE    |
| Core     | Theme , Ai Selectors and LangSwitchers should be persisted                           |     ✅ | P2       | s        | Persist data in the Store NGRX                                                                                                 | `projects/core/store/*`                                                                                | TO BE IMPLEMENTED                                         | FE    |
| Core     | Dynamic Workflow Builder                                                             |     ✅ | P2       | M        | Build flows using Swimlane charts or similar                                                                                   | `projects/core/shared/charts/*`                                                                        | TO BE IMPLEMENTED                                         | FE    |
| Core     | Smart Tables                                                                         |     ✅ | P1       | M        | Display Tables with different types and fully customizable + includes HTTP requests for paginationg or querying data on search | `projects/core/shared/smart-table/*`                                                                   | TO BE IMPLEMENTED                                         | FE    |
| Core     | Charts                                                                               |     ✅ | P1       | M        | Display charts using D3 js or chartsJs or similar                                                                              | `projects/core/shared/*`                                                                               | TO BE IMPLEMENTED                                         | FE    |
| Core     | Typings `<any>` to be correctly typed + Linter enhanced also                         |     ✅ | P2       | M        | ------                                                                                                                         | see `REAMD-ENV-CONFIG-UPGRADE-V2-BFF`                                                                  | TO BE IMPLEMENTED                                         | FE    |
| Core     | ngFor and ngIf to be removed and replaced with the new implementations of Angular 19 |     ✅ | P2       | M        | -------                                                                                                                        | see `REAMD-ENV-CONFIG-UPGRADE-V2-BFF`                                                                  | TO BE IMPLEMENTED                                         | FE    |
| Core     | Env Vars                                                                             |     ✅ | P1       | XL       | Adapt the ENV configuration multitenant and multi feature                                                                      | `REAMD-ENV-CONFIG-ASIS`                                                                                | ---                                                       | FE    |
| Core     | Docs                                                                                 |     ✅ | P1       | M        | ---                                                                                                                            | ---                                                                                                    | Inprogress                                                | FE    |
| Forms    | Validators (custom + built-in)                                                       |     ✅ | P2       | M        | Email TLD, password strength, phone digits, etc.                                                                               | `projects/core/utils/form-validators.ts`                                                               | —                                                         | FE    |
| Forms    | Dynamic Forms system                                                                 |     ✅ | P2       | L        | `FieldConfigService`, `DynamicFormComponent`, `FieldHostComponent`,`field-config.service.ts`.                                  | `projects/core/shared/forms/**` (Barrels system)                                                       | Need to customize the inputs of different field generator | FE    |
| Core     | Responsiveness                                                                       |     ❌ | P3       | M        | Make all components responsive and flexible.                                                                                   | `styles`                                                                                               | Enable Responsive mode for menus, etc...                  | FE    |
| Core     | PWA Mode (optional)                                                                  |     ❌ | P3       | M        | Offline shell + asset caching.                                                                                                 | `ngsw-config.json`, `manifest.webmanifest`                                                             | Enable PWA; exclude auth routes from cache                | FE    |
| Core     | RuntimeConfig                                                                        |     ✅ | P2       | M        | Make modules Optional and only run if provided by the RUntime cofnog.                                                          | `projects/core/core/core.ts`                                                                           | Enable custom config                                      | FE    |
| UI       | Luxon Date formatting                                                                |     ✅ | P2       | s        | Include Luxon to manage all dates                                                                                              | `utils/**`                                                                                             | customize dates display and management                    | FE    |

## 📃 Documentation Index

Legend: **✅ Done** · **🟡 Ongoing** · **❌ To do**

- [[✅] - Global Readme](./README.md)
- [[✅] - App Layout component](./docs/README-LAYOUT.md)
- [[✅] - Theming, Assets and translattions](./docs/README-ASSETS-TRANSLATIONS.md)
- [[✅] - Theming colors ](./docs/README-THEMING.md)
- [[✅] - Contribution Guide](./CONTRIBUTING.md)
- [[✅] - Custom Form Builder and custom fields](./docs/README-FORMS.md)
- [[✅] - Contributing on Forms Core](./docs/README-FORMS-CONTRIBUTING.md)
- [[✅] - Workflow Builder and Flow charts](./docs/README-WORKFLOWBUILDER.md)
- [[✅] - SmartTables](./docs/README-SmartTables.md)
- [[✅] - Graphs and Charts](./docs/ChartsJs.md)
- [[✅] - Authentication and NGRX state management](./docs/README-STORE.md)
- [[✅] - Authentication Flow](./docs/README-CURRENT-AUTH.md)
- [[✅] - Security Posture & Migration Plan – SPA](./docs/README-SECURITY.md)
- [[✅] - Environment Config Custom AS IS](./docs/README-ENV-CONFIG-ASIS.md)
- [[🟡] - Content Security Policy CSP](./docs/README-CSP.md)

## 🧑‍💻 Author

**Angular Product Skeleton**  
Built by **Tarik Haddadi** using Angular 19+and modern best practices (2025).
