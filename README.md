Todo App

Project description

A React (Vite) Todo application that integrates with the public API at https://api.oluwasetemi.dev. It demonstrates pagination, routing, a details page, ErrorBoundary, search/filtering, responsive layout, and accessibility basics.

Setup

1. Install dependencies

```bash
npm install
```

2. Run development server

```bash
Todo App

Project description

This is a React (Vite) Todo application that integrates with the public API at https://api.oluwasetemi.dev. It implements client-side pagination, routing with nested detail pages, search and filters, create/edit/delete operations for authenticated users, an ErrorBoundary, accessibility improvements, and a protected profile route.

Setup

1. Install dependencies

```bash
npm install
```

2. Run development server

```bash
npm run dev
```

Build

```bash
npm run build
```

Files of interest

- src/App.jsx — routing and layout
- src/pages/TodoList.jsx — list, pagination, search, filters, create
- src/pages/TodoDetails.jsx — details route, edit/delete
- src/pages/Login.jsx, src/pages/Register.jsx — authentication flows
- src/context/AuthContext.jsx — token management and user state
- src/components/ErrorBoundary.jsx — error boundary implementation
- src/components/ProtectedRoute.jsx — guards authenticated routes

Deployment

Deploy the `dist` folder to Netlify, Vercel, or similar. On Netlify, connect the repository and set the build command to `npm run build` and output directory to `dist`.

Features

- Pagination (10 items per page, client-side)
- Todo details nested route
- Search and completion filters
- Create / Edit / Delete (authenticated users)
- Authentication (register/login) with token stored in `localStorage`
- Protected profile route
- Error boundary and custom 404
- Accessibility improvements: focus outlines, ARIA attributes, keyboard-focusable controls

Known issues & next steps

- The app currently loads the full todo list and paginates client-side. If the API offers server-side pagination, switching will improve performance on large datasets.
- Improve styling with a design system or component library (e.g., ShadCN/UI, Chakra) for production polish.
- Add tests, CI, and automated deploy previews.

Contact & submission

Deploy the app, then submit the repository URL and the deployed application URL via the provided submission form.

Continuous Integration

This repository includes a GitHub Actions workflow at `.github/workflows/ci.yml` that installs dependencies, builds the project, and runs tests on push and pull requests to `main`/`master`.

Deployment

- Netlify: `netlify.toml` is included with build command `npm run build` and publish directory `dist`.
- Netlify: connect the repository and use the build command `npm run build` with output directory `dist`.

Running tests locally

```bash
npm ci
npm test
```
