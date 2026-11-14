# AURA Frontend

Standalone React/Vite operations desk for the AURA FastAPI services. This folder does not replace the existing root-level app.

## Run locally

1. Install the frontend dependencies from this directory:

   ```sh
   npm install
   ```

2. Start the AURA API from the repository root:

   ```sh
   python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

3. Start this frontend from `frontend/`:

   ```sh
   npm run dev
   ```

   Open the Vite URL shown in the terminal (default `http://localhost:5173`).

The dev server proxies `/api`, `/health`, and `/ws` to `http://127.0.0.1:8000`. To use another backend address, set `AURA_API_URL` before starting Vite. All portfolio, market, risk, ML, and research data is loaded from the API; the frontend does not fabricate fallback market values.

## Build checks

```sh
npm run typecheck
npm run build
```

Paper orders are sent only to AURA's paper-book endpoint. The interface deliberately has no live-order form.
