# Fitness Admin Dashboard

A Vite + React admin console for managing workout programs, exercises, and user feedback. The UI now loads data directly from MongoDB so administrators always interact with live content.

## Requirements

- Node.js 18+
- MongoDB instance with the `fitness_app` database (default connection: `mongodb://127.0.0.1:27017/fitness_app`)

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the API server (connects to MongoDB and exposes `/api` routes)

   ```bash
   npm run api
   ```

   Environment variables:

   - `MONGODB_URI` – override the MongoDB connection string (optional)
   - `MONGODB_DB` – override the database name (optional)
   - `PORT` – API port (defaults to `4000`)

3. In a separate terminal, run the Vite dev server

   ```bash
   npm run dev
   ```

   The Vite server proxies `/api` requests to the API server on `http://localhost:4000`. You can override the proxy target by setting `VITE_PROXY_TARGET` before starting Vite.

4. Open the dashboard at <http://localhost:5173> (default Vite port).

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```
