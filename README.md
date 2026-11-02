# RupeeLog

Personal daily-expense tracker with weekly/monthly category-wise summaries.
FastAPI backend + React (Vite) frontend, built as an installable PWA so the
same app runs as a website and as a "native-feeling" app on your phone.

## Stack

- **Backend:** FastAPI + SQLAlchemy + SQLite (`backend/`)
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + vite-plugin-pwa (`frontend/`)

## Run locally

### 1. Backend

```bash
cd backend
uv venv venv && source venv/bin/activate   # or: python3 -m venv venv
uv pip install -r requirements.txt         # or: pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

This creates `backend/expenses.db` (SQLite) on first run and seeds 8 default
categories (Food, Transport, Shopping, Bills, Fun, Health, Groceries, Other).

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — the dev server proxies `/api/*` to the backend
on port 8000 automatically (see `vite.config.ts`).

### 3. Try it on your phone (same Wi-Fi)

The dev server prints a `Network:` URL (e.g. `http://192.168.0.9:5173`).
Open that on your phone's browser while it's on the same Wi-Fi as this
machine. From there:

- **Android (Chrome):** menu → "Add to Home screen" / "Install app"
- **iOS (Safari):** Share → "Add to Home Screen"

The app then opens full-screen, icon on your home screen, no browser chrome —
indistinguishable from a native app for day-to-day use.

## Project structure

```
backend/
  app/
    main.py          FastAPI app, CORS, router registration, DB seeding
    models.py         Category, Expense, Settings (SQLAlchemy)
    schemas.py         Pydantic request/response models
    crud.py             DB queries + weekly/monthly summary logic
    routers/            categories, expenses, summary, dashboard, settings
frontend/
  src/
    api/                axios client + TypeScript types
    components/          BottomNav (shared tab bar)
    pages/                Dashboard, AddExpense, Summary, Categories
    lib/format.ts         INR currency + date formatting
```

## API summary

| Method | Path | Purpose |
|---|---|---|
| GET/POST | `/api/categories` | list / create categories |
| PUT/DELETE | `/api/categories/{id}` | edit / delete a category |
| GET/POST | `/api/expenses` | list (filterable by date/category) / create an expense |
| PUT/DELETE | `/api/expenses/{id}` | edit / delete an expense |
| GET | `/api/summary?period=weekly\|monthly` | total + category breakdown for the current period, with % change vs the previous one |
| GET | `/api/dashboard` | home-screen snapshot: month total, week total, top category, recent transactions |
| GET/PUT | `/api/settings` | monthly budget (optional, used for the dashboard progress bar) |

## Not yet built (discussed, deferred)

- Screenshot upload with auto-parsing of UPI payment screenshots (Phase 2)
- Android notification-listener companion app for automatic capture (Phase 3)

## Deploying for real (next step)

Once you're happy with it locally, cheap hosting options we discussed:
a small VPS (Hetzner/DO, ~$4-6/mo) running both services behind Caddy/Nginx,
or free-tier split hosting (frontend on Netlify/Vercel/Cloudflare Pages,
backend on Fly.io/Railway's free tier). We'll firm this up once the app's
confirmed working for you.
