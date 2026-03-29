# BimtekKita

Platform Pelatihan & Sertifikasi Tenaga Konstruksi Indonesia — a Next.js 16 web application.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Runtime**: Bun
- **Database**: SQLite (local file via `@libsql/client` + Drizzle ORM)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

## Running the App

```bash
bun run dev    # starts on port 5000
bun run build
bun run start  # production on port 5000
```

## Database

The SQLite database is stored locally at `.data/app.db` (not committed to git).

To apply schema migrations:
```bash
bun run db:migrate
```

To generate new migrations after schema changes:
```bash
bun run db:generate
```

### Schema (src/db/schema.ts)

Key tables: `users`, `sessions`, `offline_events`, `event_participants`, `certificates`, `bimtek_progress`, `bimtek_lessons`, `quiz_scores`, `bookmarks`, `activities`, `achievements`, `streak`, `profile`, `favorites`, `settings`, `user_progress`, `user_quiz_scores`

## API Routes (src/app/api/)

- `GET/POST /api/auth` — login, register, logout, me, update, getAllUsers, updateUserRole, deleteUser
- `GET/POST /api/events` — CRUD for offline BIMTEK events, registration, attendance, certificates
- `GET/POST /api/admin` — admin operations
- `GET /api/leaderboard` — leaderboard data
- `GET /api/user` — user data

## Replit Migration Notes

- Dev/start scripts bind to `0.0.0.0:5000` for Replit preview compatibility
- `allowedDevOrigins` set to `*.replit.dev` in `next.config.ts` to prevent HMR loop
- Database migrated from remote HTTP SQLite (`@kilocode/app-builder-db`) to local SQLite (`@libsql/client`) — no external credentials required
