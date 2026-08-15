# Sukhad-Journey: Running the Wired Backend + Frontend

## 1. Backend (FastAPI)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed               # populates attractions, hotels, food, emergency
                                  # services, scams, phrasebook, itineraries, MMR
                                  # areas, stations/lines, and 1 demo police officer
uvicorn app.main:app --reload --port 8000
```
Backend runs at `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

Demo police login: **badge `MUM-1024`, password `demo1234`**.

## 2. Frontend (Next.js)

```bash
cd Sukhad-Journey
cp .env.local.example .env.local   # points NEXT_PUBLIC_API_URL at localhost:8000
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`. Visit `/police` for the officer dashboard.

## What changed from the original mock version

- **`app/tourist/page.tsx`**: all 8 hardcoded arrays (stations, emergency services,
  scams, phrasebook, itineraries, attractions, hotels, food) now fetch from the
  backend on load. Phone OTP registration calls real `/api/auth` endpoints and
  issues a real tourist pass. The SOS button captures geolocation and posts a real
  alert that instantly appears on the police dashboard. The train pathfinder calls
  a real BFS route-finder that correctly detects interchanges (e.g. Dadar, Kurla).
- **`app/police/page.tsx`**: replaced with a real login screen + live alert feed
  (polls every 10s) backed by `/api/police/*`. Officers can mark alerts resolved.
- **`components/MMRAreaGuide.tsx`**: fetches area data from `/api/content/mmr-areas`
  instead of a hardcoded array.
- **`lib/api.ts`** (new): typed client wrapping every backend endpoint.

## Verified

- TypeScript: `npx tsc --noEmit` passes with zero errors.
- ESLint: zero *new* issues introduced (all remaining warnings/errors predate
  these changes — confirmed via `git stash` diff).
- Backend: full flow tested end-to-end — OTP login → profile → tourist pass →
  fare estimate → train routing → SOS trigger → police login → alert appears
  live on the dashboard.

## Known gaps / next steps

- Social login buttons (Google/Apple) are still UI-only placeholders — only
  phone OTP is backend-wired.
- User-built itineraries (`/api/itineraries`) exist on the backend but aren't
  yet wired into the frontend UI (the "Smart Itineraries" you see are the
  curated/editorial ones from `/api/content/smart-itineraries`).
- The fare estimator slider still computes client-side using the same formula
  as the backend (kept for slider responsiveness) rather than calling
  `/api/fare/estimate` on every drag — functionally identical, just not a
  network round-trip per pixel.
- SMS OTP delivery is stubbed (logs to console in dev) — swap in a real
  provider (Twilio, MSG91, etc.) in `otp_service.py`'s `_dispatch_sms`.
- Production DB: currently SQLite for simplicity — swap `DATABASE_URL` in
  `.env` for Postgres and this all keeps working unchanged (SQLAlchemy).
