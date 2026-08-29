# Task Management Tool — Frontend

React 18 single-page app (Create React App, MUI 6) for the
[taskmanagementtool](https://github.com/SuryaKiran434/taskmanagementtool) Spring
Boot API. Handles JWT login with refresh, role-gated admin screens, task list /
kanban / detail views, and light–dark theming.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Run Locally](#run-locally)
4. [Environment Variables](#environment-variables)
5. [Testing](#testing)
6. [Performance](#performance)
7. [Known Cruft](#known-cruft)

## Features

- **Tasks** — table and kanban views of the same data, drag-and-drop between
  kanban columns to change status, multi-select with bulk actions, status and
  priority filters, search, and a detail drawer with comments, subtasks and the
  task's activity log.
- **Auth** — login, admin login, self-registration, password reset, and silent
  access-token refresh on a 401.
- **Roles** — four routes are `ROLE_ADMIN`-only and bounce everyone else to
  `/dashboard`; the admin panel link is hidden for non-admins.
- **Admin** — dashboard over all tasks, create users, edit users, manage a
  user's tasks.
- **Theming** — MUI 6 light and dark palettes from `theme/theme.js`, with the
  choice persisted to `localStorage`.
- **Notifications** — a bell in the app bar polling the unread count every 30s.

## Architecture

### Layering

```
 index.js
   └── App.js
        ├── AppProviders  ThemeProvider ▸ ToastProvider ▸ AuthProvider
        │                 ▸ UserProvider ▸ TaskProvider
        └── AppRoutes     react-router-dom v6, Suspense boundaries
                │
                ▼
   ┌──────────────────────────────────────────────────────────────┐
   │ pages/         route-level screens                           │
   │   Home, AllTasks, CreateTask, NotFound                       │
   ├──────────────────────────────────────────────────────────────┤
   │ components/    everything reusable or route-adjacent         │
   │   layout/      AppLayout (sidebar + app bar), ErrorBoundary  │
   │   auth/        Login, AdminLogin, UserRegistrationForm,      │
   │                ResetPassword, UserInfo, EditUserInfo,        │
   │                LogoutButton, AuthInput                       │
   │   Dashboard/   Dashboard, AdminDashboard, CreateUserDialog   │
   │   Tasks/       TaskDetailDrawer, TaskFilters                 │
   │   notifications/ NotificationBell                            │
   │   (root)       EditTasks, EditUser, ManageUser,              │
   │                ManageUserTasks, DropdownMenu, ThemeSwitcher  │
   ├──────────────────────────────────────────────────────────────┤
   │ contexts/      cross-screen state                            │
   │   AuthContext     session, login/logout, token refresh       │
   │   TaskContext     split into TaskDataContext /               │
   │                   TaskActionsContext (see below)             │
   │   userContext     user list and mutations                    │
   │   ThemeContext    light/dark mode, persisted                 │
   │   ToastContext    snackbar API, referentially stable         │
   ├──────────────────────────────────────────────────────────────┤
   │ services/      one module per API domain — the ONLY place    │
   │                that talks HTTP                               │
   │   authService, taskService, userService, commentService,     │
   │   subtaskService, activityService, notificationService,      │
   │   labelService                                               │
   ├──────────────────────────────────────────────────────────────┤
   │ utils/axiosInstance.js   the single axios client:            │
   │   request  → attach `Authorization: Bearer <token>`          │
   │   response → on 401, refresh once and replay                 │
   └────────────────────────────┬─────────────────────────────────┘
                                ▼
                  Spring Boot API (default :8081/api)
```

Supporting modules: `theme/theme.js` (MUI theme factory) and
`theme/taskColors.js`, `utils/dates.js` and `utils/helpers.js`,
`testUtils/mockApi.js` (an axios stand-in the test suites mount against).

### Routing map

16 routes. Only `Home` and `Login` are in the initial bundle — the cold-entry
pages. Everything else, **including `AppLayout` itself**, is a `React.lazy`
chunk behind a `Suspense` boundary.

| Path | Component | Loading | Guard |
| --- | --- | --- | --- |
| `/` | `Home` | eager | public |
| `/login` | `Login` | eager | public |
| `/admin-login` | `AdminLogin` | lazy | public |
| `/register` | `UserRegistrationForm` | lazy | public |
| `/reset-password` | `ResetPassword` | lazy | public |
| `/dashboard` | `Dashboard` | lazy | auth |
| `/view-tasks` | `AllTasks` | lazy | auth |
| `/create-task` | `CreateTask` | lazy | auth |
| `/edit-tasks/:taskId` | `EditTasks` | lazy | auth |
| `/view-information/:userId?` | `UserInfo` | lazy | auth |
| `/edit-user-info/:userId` | `EditUserInfo` | lazy | auth |
| `/admin-dashboard` | `AdminDashboard` | lazy | **admin** |
| `/edit-user/:userId` | `EditUser` | lazy | **admin** |
| `/manage-user-tasks/:userId` | `ManageUserTasks` | lazy | **admin** |
| `/manage-user/:userId` | `ManageUser` | lazy | **admin** |
| `*` | `NotFound` | lazy | public |

`PrivateRoute` (defined in `App.js`) does the gating: no session → redirect to
`/login`; a session without `ROLE_ADMIN` on an admin route → redirect to
`/dashboard`. Otherwise it renders the page inside two nested `Suspense`
boundaries — an outer one for the `AppLayout` chunk showing a `LinearProgress`,
and an inner one for the page's own chunk showing a skeleton that matches the
layout the page is about to draw. The chunk fetch and the data fetch therefore
read as one continuous loading state rather than a spinner followed by
skeletons.

### Auth and token refresh

1. `Login` calls `AuthContext.login`, which calls `authService.login` →
   `POST /authenticate`. The access and refresh tokens go into `localStorage`.
2. `AuthContext` decodes the access token with `jwt-decode` for `userId`, `sub`
   (email) and `roles`, and mirrors the resulting user object into
   `localStorage.currentUser`.
3. On a reload, `AuthProvider` hydrates synchronously from
   `localStorage.currentUser` when it is present, otherwise it runs `checkAuth`,
   which refreshes an expired token before deciding the session is dead.
   Children do not render until that settles, so no screen ever flashes the
   logged-out state for an authenticated user.
4. `axiosInstance` attaches the bearer token to every request. On a `401` it
   sets `_retry` on the failed config, calls `authService.refreshToken`
   (`POST /refresh-token`), and replays the original request exactly once. If
   the refresh fails it clears storage and hard-redirects to `/login`.

The API base URL comes from `REACT_APP_API_BASE_URL`, defaulting to
`http://localhost:8081/api`. Cross-origin calls need that origin listed in the
backend's `app.cors.allowed-origins`; `http://localhost:3000` is there already.

### TaskContext split

`TaskContext.js` publishes three contexts from one provider:

| Context | Value | Changes when |
| --- | --- | --- |
| `TaskDataContext` | `{ tasks, error }` | task data actually changes |
| `TaskActionsContext` | the eight mutators | **never** — every function is `useCallback`-stable and the object is `useMemo`'d over them |
| `TaskContext` | both, merged | either changes |

The point is that a component which only *dispatches* — `CreateTask`,
`AdminDashboard`, `ManageUserTasks` — subscribes to `useTaskActions()` and does
not re-render when someone else loads a task list. `TaskContext` is still
exported and still carries the combined value, so pre-existing
`useContext(TaskContext)` call sites (`AllTasks`, `EditTasks`) keep working
unchanged; the split is opt-in, not a migration.

## Run Locally

### Prerequisites

- **Node 20** (`node -v`). This is what CI uses; older majors are untested.
- The [backend](https://github.com/SuryaKiran434/taskmanagementtool) running and
  reachable — the app is useless without it, since every screen past the landing
  page reads from the API.

### 1. Install

```bash
npm ci
```

`npm ci` rather than `npm install`: it installs exactly what `package-lock.json`
pins, which is what CI does.

### 2. Configure

```bash
cp .env.example .env.local
```

`.env.local` is gitignored. The one variable is:

| Variable | Default | Purpose |
| --- | --- | --- |
| `REACT_APP_API_BASE_URL` | `http://localhost:8081/api` | Base URL of the backend API |

**It must point at a running backend.** `8081` is the backend's default port
because its `dev` profile is active out of the box — not `8080`. If you start
the backend under another profile, or behind a proxy, change this to match.

> ⚠️ **Never put a secret in a `REACT_APP_*` variable.** Create React App
> inlines every `REACT_APP_*` value into the JavaScript bundle at build time.
> Whatever you put there is shipped to the browser in plain text and readable by
> anyone who opens devtools or curls the bundle. API keys, client secrets and
> tokens belong on the server, behind an endpoint this app calls — never in
> `.env.local`, `.env.production` or the build environment. The only safe
> contents are public, non-sensitive values like this base URL.

### 3. Start

```bash
npm start
```

Serves on **http://localhost:3000** with hot reload. That origin is already in
the backend's allowed CORS origins.

### 4. Test

```bash
CI=true npm test
```

`CI=true` makes `react-scripts` run the suite once and exit instead of dropping
into interactive watch mode. Without it the command never returns, which is why
CI sets it. **33 tests across 4 suites**, all passing.

### 5. Build

```bash
npm run build
```

Emits a hashed, minified production bundle to `build/`. Serve it with any static
file server; there is also a `Dockerfile` that builds and serves it behind nginx
on port 80 (note it still pins `node:18` in the build stage while CI and this
README target Node 20).

## Environment Variables

Only `REACT_APP_*` variables reach the app — CRA ignores everything else. They
are read at **build** time, not run time, so changing one means restarting
`npm start` or rebuilding.

| File | Committed | Use |
| --- | --- | --- |
| `.env.example` | yes | template, placeholder values only |
| `.env.local` | **no** — gitignored | your local values |
| `.env`, `.env.*.local` | **no** — gitignored | |

Re-read the warning above before adding a second variable: everything here ends
up in the shipped bundle.

## Testing

Jest + React Testing Library via `react-scripts`, with `testUtils/mockApi.js`
standing in for `axiosInstance` so nothing hits the network.

| Suite | Covers |
| --- | --- |
| `src/routes.lazy.test.js` | every one of the 16 routes resolves its lazy chunk and renders — public routes anonymously, private routes behind a hydrated session — plus the unauthenticated and non-admin redirects |
| `src/pages/AllTasks.memo.test.js` | `TaskCard`, `TaskTableRow` and `UserTaskRow` are wrapped in `React.memo`, do not re-render on an unrelated parent render, do re-render when their own props change, and are defeated by an unstable callback prop (which is why the handlers are `useCallback`-stabilised) |
| `src/contexts/contexts.test.js` | `TaskActionsContext` keeps a stable identity while task data changes, the combined `TaskContext` still exposes the original API, and the toast API does not churn |
| `src/App.test.js` | the landing page renders for an anonymous visitor, and no user-list request is made before login |

CI (`.github/workflows/ci.yml`, job **Frontend (Node 20)** — a required check on
`main`) runs `npm ci`, the tests, `npm run build`, and prints per-chunk gzip
sizes to the job summary so bundle regressions are visible on every run.
Dependency updates arrive weekly through Dependabot
(`.github/dependabot.yml`).

## Performance

- **Route-level code splitting.** Fourteen of the sixteen routes are
  `React.lazy` chunks. Pulling **`AppLayout`** out was the significant one: the
  authenticated shell — sidebar, app bar, notification bell, and the MUI surface
  they drag in — is only ever rendered behind a login, so it has no business
  being in the download an anonymous visitor pays for. The initial `main.js`
  dropped **~19% gzip**; the current build is **134 kB gzip** for `main.js`
  across 30 emitted chunks.
- **Memoised list rows.** `TaskCard`, `TaskTableRow`, `TableView`,
  `KanbanColumn`, `UserTaskRow` and the `DueDateBadge`s are `React.memo`-wrapped,
  and every handler passed down to them is `useCallback`-stabilised — a fresh
  arrow function on each parent render defeats `memo` entirely, which
  `AllTasks.memo.test.js` asserts explicitly. Selecting one row in a long list
  no longer re-renders the others.
- **Split task context.** See [TaskContext split](#taskcontext-split) — dispatch-only
  screens stop re-rendering when task data loads.
- **Fixed refetch loop.** An effect dependency that changed identity on every
  render was refetching in a loop; stabilising the actions context ended it.

The test suite went from **1 failing test to 33 passing across 4 suites**
alongside this work.

## Known Cruft

Worth clearing out; noted here rather than silently carried:

- **Dependencies in `package.json` that no file imports** — dead install weight
  and dead Dependabot surface:
  `@mui/icons-material`, `@tanstack/react-query`, `framer-motion`,
  `react-hook-form`, `@hookform/resolvers`, `yup`, `@dnd-kit/sortable`,
  `@dnd-kit/utilities`.
  (`@dnd-kit/core` *is* used — by the kanban board. `@emotion/react`,
  `@emotion/styled` and `web-vitals` are also import-free in `src/` but are
  genuinely required: the first two are MUI peer dependencies and the third is
  loaded by a dynamic `import()` in `reportWebVitals.js`. Icons come from
  `lucide-react`, which is why `@mui/icons-material` is unused despite MUI
  being the component library.)
- **`src/services/labelService.js`** has no callers, even though the backend
  exposes the label endpoints and tasks can carry labels.
- **`src/components/auth/PrivateRoute.js`** is orphaned — `App.js` defines its
  own `PrivateRoute` and nothing imports the file.
- **`Dockerfile`** builds on `node:18` while CI and this README target Node 20.
