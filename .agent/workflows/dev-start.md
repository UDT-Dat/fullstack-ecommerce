---
description: How to start the development servers (frontend + backend)
---

## Start Development Servers

Both servers must run simultaneously in separate terminals.

### 1. Start the Backend (Express API)

// turbo
```bash
cd server && npx nodemon server.js
```
- Runs on `http://localhost:5000`
- Auto-restarts on file changes via Nodemon
- Requires `server/.env` to be configured with `MONGO_URI`, `JWT_SECRET`, `RESEND_API_KEY`

### 2. Start the Frontend (Vite)

// turbo
```bash
npm run dev
```
- Runs on `http://localhost:5173`
- Hot Module Replacement (HMR) enabled

### Verify
- Backend health: visit `http://localhost:5000/api` → should return `{ "message": "Citrus Stream API is running..." }`
- Frontend: visit `http://localhost:5173`
