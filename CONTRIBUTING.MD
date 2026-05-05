# 📝 Contributing Guide – `@cadai/pxs-ng-core`
>_Last updated: 2025-09-04_

Welcome! This document explains how to work with the **PXS-NG-CORE** library: setup, development, versioning, and publishing to the private GitLab Package Registry.

This document is the **source of truth** for how to work in this repository. It explains the folder structure, barrel usage, contribution workflow, and a pre‑push checklist to keep everything aligned.

---

## 1. 🚀 Prerequisites

- [Node.js LTS](https://nodejs.org/) (v18+ or v20+ recommended)  
- [Angular CLI](https://angular.dev/cli):  
  ```bash
  npm install -g @angular/cli
  ```
- For package consumption outside GitLab CI, a GitLab Deploy Token or Personal Access Token with `read_package_registry`.
- For release tagging in GitLab CI, a masked `GITLAB_TAG_TOKEN` variable backed by a Project Access Token with `write_repository`.
---

## 2. 🛠 Development

- Source code lives in `projects/core/`  
- Build output goes to `dist/core/`  

1. **Install**:
   ```bash
   npm ci
   ```

2. **Lint (CI rules)**:
   ```bash
   npm run lint:ci
   ```

3. **Build**:
   ```bash
   npm run build:core
   ```

4. **Pack (preview the artifact)**:
   ```bash
   cd dist/core
   npm pack --dry-run
   ```

> The library uses `ng-packagr`. Only `tslib` is allowed as a non-peer dependency; all Angular/NgRx/Translate/Keycloak/RxJS are **peers** (provided by consumers).


### Core Layer

**Purpose:** framework-agnostic services, models, guards, interceptors, and the **single init point**.
> We use **barrel files** (`index.ts`) so consumers import from a single entry per layer. This keeps imports stable and avoids deep relative paths.

```text
projects/
└─ core/
   ├─ core/                           # Framework-agnostic building blocks
   ├─ services/                    # Config, Http, Keycloak, Layout, Theme, Toast, User, etc.
   ├─ directives/                  # Shared TS Directives
   ├─ providers/                  # Custom providers (Such as provideCharts)
   ├─ factories/                  # Shared TS Factories
   ├─ interfaces/                  # Shared TS interfaces & models
   ├─ enums/                       # Shared enums (e.g., UserRole)
   ├─ utils/                       # Pure helpers & validators & other helpers for custom components such as (charts, tables, etc...)
   ├─ guards/                      # Route guards (e.g., authGuard)
   ├─ interceptors/                # Http interceptors (auth, error)
   │
   ├─ shared/                         # Reusable UI + headless components
   │  ├─ charts/                      # Reusable charts with different types.
   │  ├─ smart-table/                 # Reusable Tables fully customizables `see relatedDocs`.
   │  ├─ dialog/                      # Confirm dialogs, etc.
   │  ├─ forms/                       # Form system & fields
   │  ├─ fields/                      # Input, select, chips, autocomplete, etc.
   │  ├─ dynamic-form-builder/        # Dynamic form engine/components
   │  ├─ seo/                         # SEO component / meta service
   │  ├─ layout/                      # AppLayoutComponent (standalone)
   │  ├─ public-api.ts/             # barrels definition
   │  ├─ index.ts/                  # exposes public-api
   │  └─ ng-package.json/           # used for building the Core SDK Module
   │
   ├─ realtime/                       # Realtime CLients to use depending on the configuration
   │  ├─ pushClient.ts/
   │  ├─ SseClient.ts/
   │  ├─ WebSocketClient.ts/
   │  ├─ public-api.ts/             # barrels definition
   │  ├─ index.ts/                  # exposes public-api
   │  └─ ng-package.json/           # used for building the Core SDK Module
   │
   └─ store/                          # NgRx (root + features)
   │   ├─ features/
   │   │  ├─ auth/ {actions,effects,reducer,selectors}/
   │   │  ├─ team/ {actions,effects,reducer,selectors}/
   │   │  └─ user/ {actions,effects,reducer,selectors}/
   │   ├─ app.actions.ts               # Global app actions (optional)
   │   ├─ app.effects.ts               # Global effects (optional)
   │   ├─ app.reducer.ts               # Root reducer map
   │   ├─ app.selectors.ts             # Root selectors (optional)
   │   ├─ app.state.ts                 # Root state
   │   └─ index.ts                     # Barrel: provideAppStore(), actions, selectors
   │
   ├─ tokens/                       # App configurations
   │  ├─ usertCtx/
   │  ├─ public-api.ts/             # barrels definition
   │  ├─ index.ts/                  # exposes public-api
   │  ├─ ng-package.json/           # used for building the Core SDK Module
   │  └─ CoreOpts
   │
   ├─ public-api.ts/             # barrels definition
   ├─ index.ts/                  # exposes public-api
   └─ ng-package.json/           # used for building the Core SDK Module
   
```

### Path Aliases (tsconfig)

Make sure these exist so barrel imports work:

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@cadai/pxs-ng-core": ["projects/core/src/public-api.ts"],
      "@cadai/pxs-ng-core/*": ["projects/core/*/public-api.ts"]
    },
  }
}
```

### ESLint (Flat Config) Barrel Policy

- **Allowed deep alias imports**: `@cadai/pxs-ng-core/core`, `@cadai/pxs-ng-core/shared`, and so on (interfaces, interceptors, guards, enums, services, etc......)

(See `eslint.config.js` in repo for exact rules.)

### Example Imports

```ts
// Allowed deep @core/@shared
import {{ KeycloakService }} from '@cadai/pxs-ng-core/services';
import {{ AppLayoutComponent }} from '@cadai/pxs-ng-core/shared';
```

### Key Files

- `core/core.ts` – registers HttpClient (interceptors), i18n, date providers, loads runtime config, initializes Keycloak, hydrates store.
- `services/keycloak.service.ts` – PKCE, `login-required` (no auto-login in refresh loop), `ensureFreshToken`.
- `interceptors/auth.interceptor.ts` – injects token, skips KC endpoints, only redirects to login on API `401`.
- `guards/auth.guard.ts` – waits for Keycloak readiness and authorizes; with `login-required`, it does not call `login()`.

---

## 3. 📦 Versioning

We follow **semantic versioning** (`MAJOR.MINOR.PATCH`):

- **Patch**: Bug fixes, no breaking changes → `1.0.0 → 1.0.1`
- **Minor**: Backward-compatible features → `1.0.0 → 1.1.0`
- **Major**: Breaking changes → `1.0.0 → 2.0.0`

For normal releases, do **not** bump the version locally. GitLab CI bumps `projects/core/package.json` before publishing and tagging.

The default CI bump is `patch`. For another release type, set the `RELEASE_BUMP` CI/CD variable to `minor` or `major` before running the release pipeline.

The local scripts still exist for emergency/manual maintenance, but they are not the standard release path:

```bash
npm run version:patch   # 1.0.0 → 1.0.1
npm run version:minor   # 1.0.0 → 1.1.0
npm run version:major   # 1.0.0 → 2.0.0
```


## 4. ⚙️ Routing & Roles (on Host App)

```ts
// app.routes.ts
import {{ Routes }} from '@angular/router';
import {{ authGuard, UserRole }} from '@core';
import { AppLayoutComponent } from '@shared/layout/app-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: '{customPath}', pathMatch: 'full' },
  {
    path: '',
    component: AppLayoutComponent,
    canActivateChild: [authGuard],
    children: [
      {
        path: '{customPath}',
        canActivate: [featureGuard('{customPath}', { forbid: '/403' })],
        data: { roles: [UserRole.ROLE_admin, UserRole.ROLE_user] },
        loadComponent: () =>
          import('./features/{customComponent}/{customComponent}.component').then(m => m.DashboardComponent),
      },
      { path: '403', loadComponent: () => import('@cadai/pxs-ng-core/shared').then(m => m.ForbiddenComponent) },
      { path: '**', loadComponent: () => import('@cadai/pxs-ng-core/shared').then(m => m.NotFoundComponent) },
    ]
  },
];
```

## 5. ⚡ package.json Scripts

Available at the repo root:

```json
{
  "scripts": {
    "build:core": "ng build core",
    "version:patch": "npm version patch --prefix projects/core",
    "version:minor": "npm version minor --prefix projects/core",
    "version:major": "npm version major --prefix projects/core",
    "publish:core": "ng build core && copy .npmrc dist\\core\\.npmrc && cd dist/core && npm publish"
  }
}
```

---

## 6. 🚀 Contributing & Publishing — Core SDK (`@cadai/pxs-ng-core`)

This document explains **how CI/CD works** for the Core SDK and **what contributors must do** to keep builds green and releases smooth.

> **TL;DR**  
> - Target branches: `develop` (integration), `master` (release).  
> - CI runs **lint + build** on PRs that touch `projects/core/**`.  
> - Merges into `main` or `master` automatically **bump the package version**, **publish** `@cadai/pxs-ng-core` to the GitLab Package Registry, and **create a git tag** `PXS-NG-CORE@<version>`.
> - The CI bumps `projects/core/package.json` before build/publish/tag. Default bump is `patch`.


### How to Release

1. From latest `develop`, open a PR: **`develop` → `main`** or **`develop` → `master`**. Wait for **Build & Test** to pass.

2. Merge the PR. On `main` or `master`:
   - CI bumps `projects/core/package.json`.
   - CI commits the bumped version back to the release branch with `[skip ci]`.
   - CI builds the library using the bumped version.
   - CI publishes to GitLab Package Registry if the version does not already exist.
   - CI creates tag `PXS-NG-CORE@x.y.z`.

---
---

## 7. 👣 Branching & PR Policy

- Work on **feature branches** cut from `develop`.
- Open PRs **into `develop`** for regular work.  
- When preparing a release:
  1. Merge `develop` → `main` or `master` via PR.
  2. Let CI bump `projects/core/package.json`, publish the package, and create the tag.
- CI is **triggered only for changes** to:
  - `projects/core/**` (library code),
  - pipeline files and workspace configs (`.gitlab-ci.yml`, `package.json`, `package-lock.json`, `tsconfig*.json`, `projects/**`).

### Required checks on PRs
- **ESLint (CI)** must pass.
- **Library build** must succeed (`ng build core --configuration production`).

> CI also runs on PRs targeting `main`, `master`, or `develop` if they modify `projects/core/**`.

---

## 8. 🚀 CI/CD Overview (GitLab CI)

| Stage            | When it runs                                   | What it does                                                                                                                                              |
|------------------|------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Build & Test** | On any commit/PR that matches the path filters | Uses Node `20.x`, `npm ci`, runs `npm run lint:ci`, builds the library (`npm run build:core`). Publishes `dist/core` as artifact `pxs-ng-core`.          |
| **Version bump** | **Only** on `main` or `master` after Build & Test | Runs `npm version <RELEASE_BUMP> --prefix projects/core --no-git-tag-version`, commits the bumped `projects/core/package.json`, and pushes it with `[skip ci]`. |
| **Release build** | **Only** on `main` or `master` after Version bump | Rebuilds the library from the bumped `projects/core/package.json`, so the package artifact contains the release version. |
| **Publish**      | **Only** on `main` or `master` after Release build | Publishes `dist/core` to the GitLab Package Registry using `CI_JOB_TOKEN`. Skips if the version already exists; otherwise publishes.                     |
| **Tag**          | **Only** on `main` or `master` after publish   | Reads the bumped version from `projects/core/package.json`, creates git tag `PXS-NG-CORE@<version>` and pushes it to origin using `GITLAB_TAG_TOKEN`.    |

### Environments / Variables
- Node version: `20.x`
- Package registry: `${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/npm/`
- Required CI variable: `GITLAB_TAG_TOKEN` with `write_repository`
- Release bump type: `RELEASE_BUMP`, default `patch`. Supported values: `patch`, `minor`, `major`, `prepatch`, `preminor`, `premajor`, `prerelease`.
- Artifact name: `pxs-ng-core`
- Library paths: `projects/core` → `dist/core`

---

### Recommended commit style
We follow **Conventional Commits**:
- `feat(core): add X`
- `fix(core): handle Y`
- `chore(release): bump to 1.2.3`

---

## 9. 📝 Publishing Details

### Authentication
The pipeline creates a **scoped `.npmrc` inside the artifact directory** and authenticates with GitLab's built-in `CI_JOB_TOKEN`. This ensures `npm publish` uses the current project's GitLab Package Registry.

### Idempotent publish
Before publishing, CI checks if `@cadai/pxs-ng-core@<version>` already exists in the GitLab Package Registry:
- If **exists** → **skip** publish gracefully.
- If **not found** → `npm publish --ignore-scripts --registry <GITLAB_NPM_REGISTRY>`.

> Lifecycle scripts are disabled for safety during CI publishing.

### Tagging
- CI uses `GITLAB_TAG_TOKEN` to push the tag.  
- The tag format is **`PXS-NG-CORE@<version>`**.
- The tag is created after the CI version bump commit, so the tag points to the committed package version.

---

## 10. 📥 Consuming the Package (Host Apps)

Host applications consume `@cadai/pxs-ng-core` from the SDK project's GitLab Package Registry. The SDK registry is private, so every consumer needs a read token for installs.

### Consumer `.npmrc`

Commit this `.npmrc` in each consuming application:

```npmrc
# Default public registry
registry=https://registry.npmjs.org/

# Core SDK GitLab Package Registry
@cadai:registry=https://teamhub-se.telindus.lu/api/v4/projects/281/packages/npm/
//teamhub-se.telindus.lu/api/v4/projects/281/packages/npm/:_authToken=${NPM_TOKEN}
always-auth=true
```

Do not replace `${NPM_TOKEN}` with a real token in the repository. The committed file must stay generic and safe to share.

The project id in this URL is the GitLab project id of the SDK package registry. For this SDK, use:

```text
281
```

Do not use `frontend-angular-core-sdk` in the npm registry URL. The numeric project id is the reliable GitLab npm registry endpoint.

### Token creation

Create the read token in the **SDK project**, because that is where the package is published.

Recommended token:

- Type: GitLab Project Access Token or Deploy Token
- Scope: `read_package_registry`
- Role: `Reporter` is enough for read-only package installation
- Expiration: prefer an explicit expiration date if your GitLab policy allows it

The token value is copied once when GitLab creates it. Store it immediately in the consumer application CI/CD variables and, if needed, in local developer environments.

### Consumer CI/CD variable

In every consuming GitLab project, add this CI/CD variable:

```text
Key: NPM_TOKEN
Value: <token-created-in-the-SDK-project>
```

Recommended settings:

- `Masked`: enabled
- `Protected`: enable only if the consuming pipeline runs on protected branches

If the pipeline runs on `develop` and `develop` is not protected, a protected `NPM_TOKEN` will not be injected and `npm ci` will fail.

### Consumer GitLab CI

Before every `npm ci`, verify that `NPM_TOKEN` is available:

```yaml
before_script:
  - node --version
  - npm --version
  - |
    if [ -z "${NPM_TOKEN:-}" ]; then
      echo "ERROR: NPM_TOKEN is required to install @cadai packages from GitLab Package Registry."
      exit 1
    fi
```

If the consumer project does not commit the `.npmrc`, the pipeline must generate it before `npm ci`:

```yaml
before_script:
  - node --version
  - npm --version
  - |
    set -euo pipefail

    if [ -z "${NPM_TOKEN:-}" ]; then
      echo "ERROR: NPM_TOKEN is required to install @cadai packages from GitLab Package Registry."
      exit 1
    fi

    {
      echo "registry=https://registry.npmjs.org/"
      echo ""
      echo "@cadai:registry=https://teamhub-se.telindus.lu/api/v4/projects/281/packages/npm/"
      echo "//teamhub-se.telindus.lu/api/v4/projects/281/packages/npm/:_authToken=${NPM_TOKEN}"
      echo "always-auth=true"
    } > .npmrc
```

The preferred approach is to commit the generic `.npmrc` and only keep `NPM_TOKEN` as a secret variable.

### Local developer setup

GitLab CI/CD variables are not available on a developer machine. After cloning a consuming application, developers must define `NPM_TOKEN` locally before running `npm install`.

On Windows PowerShell:

```powershell
[Environment]::SetEnvironmentVariable("NPM_TOKEN", "<token-created-in-the-SDK-project>", "User")
```

Then close and reopen the terminal, verify the variable, and install:

```powershell
echo $env:NPM_TOKEN
npm install
```

On Linux/macOS:

```bash
export NPM_TOKEN="<token-created-in-the-SDK-project>"
npm install
```

For a permanent Linux/macOS setup, add the export to the user's shell profile.

### Generic template

```npmrc
@cadai:registry=https://<gitlab-host>/api/v4/projects/<project-id>/packages/npm/
//<gitlab-host>/api/v4/projects/<project-id>/packages/npm/:_authToken=${NPM_TOKEN}
always-auth=true
```

For local development, `NPM_TOKEN` should be a GitLab Deploy Token, Project Access Token, or Personal Access Token with `read_package_registry`.

For another GitLab CI project, use a masked CI/CD variable or a Deploy Token with `read_package_registry`.

If cross-project `CI_JOB_TOKEN` access is enabled in GitLab, the host project can use:

```npmrc
@cadai:registry=https://<gitlab-host>/api/v4/projects/<project-id>/packages/npm/
//<gitlab-host>/api/v4/projects/<project-id>/packages/npm/:_authToken=${CI_JOB_TOKEN}
always-auth=true
```

This is CI-only. It does not solve local `npm install` for developers, so `NPM_TOKEN` remains the recommended convention for host apps.

Install:
```bash
npm i @cadai/pxs-ng-core@^<major>.<minor>.<patch>
```

Host apps must satisfy the **peer dependencies** (Angular/NgRx/Translate/Keycloak/RxJS/Chart.js/Luxon).

---

## 11. 🪲 Troubleshooting

- **Publish skipped**: The exact version already exists. Check the `RELEASE_BUMP` value and retry a `develop → main/master` merge or manual pipeline.
- **Auth errors (`npm publish`)**: Ensure the package registry is enabled and the job uses the scoped `.npmrc` generated in `dist/core`.
- **Auth errors (`npm install` in host apps)**: Ensure the token has `read_package_registry` and the `.npmrc` project id points to this SDK project.
- **Tag push failed**: Confirm `GITLAB_TAG_TOKEN` exists, is masked, and has `write_repository`.
- **Version bump failed**: Confirm `GITLAB_TAG_TOKEN` can push to the protected `main`/`master` branch, or allow the token identity to push to that branch.
- **Build fails on missing types**: Ensure the **SDK workspace** has peer packages in **devDependencies** (they are required for type-checking during build). This does not affect published peers.

---

## 12. 🛡️ Security Notes

- Do **not** print tokens or `.npmrc` contents in logs.  
- Use **`--ignore-scripts`** on `npm publish` in CI to avoid executing arbitrary lifecycle scripts.  
- Tags are created by CI using the GitLab token configured in `GITLAB_TAG_TOKEN`.

---

###  ✅ Checklist Before Publishing

- [ ] **Build passes**: `npm run build:core`
- [ ] **Lint passes**: `pnpm lint` (or `npm run lint`)
- [ ] **No deep relative imports** into `core/shared/features/store` (respect barrel policy)
- [ ] **Release bump type is correct**: default is `patch`; set `RELEASE_BUMP` for `minor` or `major` releases.
- [ ] **Barrels updated**: new public APIs re‑exported via `index.ts`
- [ ] **Store wired**: reducer registered, effects provided, selectors exported
- [ ] **i18n keys** added/updated
- [ ] **Types**: no `any`; strict mode friendly
- [ ] **Changelog/commit messages** follow Conventional Commits

---


## 🧑‍💻 Author

**Angular Product Skeleton**  
Built by **Tarik Haddadi** using Angular 19+and modern best practices (2025).
