---
description: How to install npm packages and fix common dependency issues
---

## Install Packages & Fix Dependency Issues

### Installing Frontend Packages

// turbo
```bash
npm install <package-name> --legacy-peer-deps
```

> **Always use `--legacy-peer-deps`** — React 19 is not yet in the peer dependency range of many libraries, causing install failures without this flag.

### Installing Backend Packages

```bash
cd server && npm install <package-name>
```

Backend uses CommonJS and Express v5, fewer peer conflicts here.

---

## Common Fixes

### Fix: Vite "Failed to resolve import" errors

This usually means a dependency is missing or Vite has stale cache.

1. Install the missing package:
```bash
npm install <missing-package> --legacy-peer-deps
```

2. Clear Vite cache:
// turbo
```bash
Remove-Item -Recurse -Force node_modules\.vite
```

3. Restart `npm run dev`

### Fix: 413 Payload Too Large

Already handled: `express.json({ limit: '50mb' })` is set in `server.js`. If limit needs increasing, edit there.

### Fix: React Quill crashes (`findDOMNode`)

Use `react-quill-new` (not `react-quill`). Import CSS from `quill/dist/quill.snow.css`.

### Fix: Mongoose deprecation warnings

Replace `{ new: true }` with `{ returnDocument: 'after' }` in `findOneAndUpdate` / `findOneAndReplace` calls.
