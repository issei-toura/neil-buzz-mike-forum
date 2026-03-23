/**
 * NBM Forum — source layout convention (expo-router).
 *
 * - app/: Route files and Stack layouts only. Keep each route thin; render screen UI from screens/.
 * - screens/: Full-screen UI and screen-level state (e.g. splash, welcome, signin, signup).
 * - services/: Functions that call the backend API, grouped by domain (auth, posts, …). Type return values.
 * - types/: Shared TypeScript types; split into modules (e.g. auth.ts) as the app grows.
 * - utils/: Cross-cutting helpers (HTTP client, formatters, hooks used app-wide).
 * - navigation/: Optional shared navigation helpers or constants. Primary stacks belong under app/ as _layout.tsx.
 */
export {};
