---
description: How to debug errors in this project
---

## Debugging Workflow

### Step 1: Identify the Error Source

| Symptom | Source | Where to Look |
|---------|--------|---------------|
| White screen / crash | Frontend React error | Browser DevTools Console |
| Network error (CORS, 4xx, 5xx) | Backend API | Browser Network tab + Server terminal |
| "Failed to resolve import" | Missing dependency / Vite cache | Vite terminal output |
| MongoDB connection error | Database | Server terminal (`MongoDB Connection Error:`) |
| 401 Unauthorized | JWT expired or missing | Check `localStorage.getItem('token')` |

### Step 2: Check Terminals

- **Frontend terminal** (`npm run dev`): Shows Vite compilation errors, missing imports
- **Backend terminal** (`npx nodemon server.js`): Shows Express errors, MongoDB issues, `console.error` logs

### Step 3: Common Fixes

#### Frontend White Screen
1. Open browser DevTools → Console tab
2. Read the error message and stack trace
3. Common causes:
   - Missing import → install package with `--legacy-peer-deps`
   - Stale cache → delete `node_modules/.vite` and restart
   - Component crash → check for undefined data (add `?.` optional chaining)

#### Backend 500 Error
1. Check server terminal for the `catch` block output
2. Common causes:
   - Invalid MongoDB ObjectId → validate `req.params.id`
   - Missing required field → check `req.body` contents
   - Database connection drop → check `MONGO_URI` in `.env`

#### CORS Error
- Ensure `app.use(cors())` is in `server.js` (already configured)
- Check that the frontend is calling `http://localhost:5000` (correct port)

#### Email/OTP Not Working
1. Check `RESEND_API_KEY` in `server/.env`
2. Check server terminal for `"Lỗi khi gửi email OTP:"` log
3. On Resend free tier, you can only send to the email you registered with

### Step 4: Hot Reload

- Frontend: Vite auto-reloads on save
- Backend: Nodemon auto-restarts on save
- If changes don't appear: hard refresh browser (`Ctrl+Shift+R`)
