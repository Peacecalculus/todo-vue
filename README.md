Todo App (Vue + Vite)

A Vue 3 + Vite Todo application with Pinia for state, Vue Router for routing, and Tailwind CSS for styling. The app supports authentication (register/login), client-side pagination, search and filters, todo details and editing, and accessibility improvements.

Quick start

1. Install dependencies

```bash
npm install
```

2. Run development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Preview the production build locally

```bash
npm run preview
```

Project structure (high level)

- `src/main.ts` — app entry, router and Pinia setup
- `src/App.vue` — global layout & navigation
- `src/views/` — page views (TodoListView, TodoDetailsView, LoginView, RegisterView, ProfileView)
- `src/stores/` — Pinia stores (`auth`, `todos`, `notifications`, `socket`)
- `src/components/` — reusable UI components (Notifications, etc.)
- `src/styles/` — global Tailwind CSS
- `src/api.ts` — lightweight local API shim (uses localStorage for demo)

Testing

- Unit/integration tests run with `vitest`.

```bash
npm test
```

Deployment

- Netlify: `netlify.toml` is included (build: `npm run build`, publish: `dist`).
- After pushing to your GitHub repo, Netlify should auto-deploy the `main` branch.

Notes & maintenance

- The project includes a minimal local `src/api.ts` shim for demo purposes (localStorage-backed). For a real backend, set `VITE_API_BASE_URL` and implement `src/api.ts` accordingly.
- For optional realtime updates, set `VITE_WS_URL` to your WebSocket endpoint and use the `socket` store.

Contributing & fixes

- To remove generated `dist/` from Git tracking locally, run:

```bash
git rm --cached -r dist
git add .gitignore
git commit -m "chore: ignore dist build output"
git push origin main
```

Contact

Open an issue or submit a pull request with improvements or fixes.
