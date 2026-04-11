# Project Memory

Accumulated knowledge, decisions, and lessons learned during development.

---

## Development History (Chronological)

### Phase 1: Core Foundation
- Built MERN stack scaffold: React 19 + Vite frontend, Express v5 + MongoDB backend
- Implemented product catalog, cart system (CartContext), and checkout flow
- Created admin dashboard with sidebar layout and CRUD for products, users, orders
- Designed premium dark-theme UI with amber accent color

### Phase 2: User & Membership System
- Built auth system (email/phone + password login)
- Implemented membership tiers (Đồng/Vàng/Kim Cương) with auto and manual assignment
- Added stacking discount logic: membership discount → voucher discount → shipping

### Phase 3: Order Tracking
- Created `OrderStatus.jsx` with a Grab/ShopeeFood-style tracking page
- Added order history page so users can view past orders (newest first)
- Ensured order data persists and is accessible via `/order-status/:id`

### Phase 4: CMS / Blog System
- Built Posts CRUD in admin with slug-based routing
- Migrated from Markdown textarea to `react-quill` WYSIWYG editor
- Upgraded to `react-quill-new` (Quill 2) to fix `findDOMNode` crash on React 18/19
- CSS import path: use `quill/dist/quill.snow.css` (not `react-quill-new/dist/...`) to avoid Vite resolution errors
- Implemented local image upload via Multer (`/api/upload` → `server/uploads/`)
- `NewsDetail.jsx` renders HTML from Quill + dynamically injects heading IDs for TOC

### Phase 5: Email & OTP Security
- Integrated Resend SDK for transactional email
- Created `server/services/emailService.js` as a shared service layer
- Built OTP model with MongoDB TTL (auto-delete after 5 minutes)
- Auth flow: register requires OTP → login sends OTP → verify OTP to get JWT
- "Remember Me" checkbox: JWT 30d (skip future OTP) vs 1d (require OTP each login)
- Order creation triggers non-blocking email notification to buyer

### Phase 6: Code Cleanup
- Removed hardcoded `mockProducts` array from `Menu.jsx`
- All product/category data now pulled exclusively from MongoDB API
- Increased Express body size limit to 50MB for rich text with embedded images

---

## Known Gotchas & Pitfalls

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| `findDOMNode` crash | `react-quill` v2 incompatible with React 18+ | Switch to `react-quill-new` |
| Quill CSS 404 in Vite | Vite can't resolve `react-quill-new/dist/quill.snow.css` | Import from `quill/dist/quill.snow.css` instead |
| `react-is` missing | `recharts` depends on it, not auto-installed | `npm install react-is` |
| 413 Payload Too Large | Quill embeds images as base64 in HTML content | Set `express.json({ limit: '50mb' })` |
| npm peer dep conflicts | React 19 not yet in peer range of many libs | Always use `--legacy-peer-deps` flag |
| Vite stale cache | Old deps cached in `node_modules/.vite/deps/` | Delete `node_modules/.vite` and restart |
| Mongoose `new` deprecation | Mongoose v9 deprecates `{ new: true }` option | Use `{ returnDocument: 'after' }` instead |

---

## Design Decisions & Rationale

1. **Resend over Nodemailer**: Simpler API, better deliverability, no SMTP config needed
2. **OTP in MongoDB (not Redis)**: Project already uses Mongo; TTL index handles expiry natively — zero added infrastructure
3. **`crypto.randomInt` for OTP**: Built into Node.js, cryptographically secure, no extra dependency
4. **Service layer (`services/`)**: Enables controllers to share business logic (email, etc.) without coupling
5. **Local file uploads**: Sufficient for development/small scale; migrate to S3/Cloudinary for production
6. **JWT in localStorage**: Simple for SPA; consider httpOnly cookies for production security hardening
7. **Tailwind v4 via Vite plugin**: Zero PostCSS config needed, faster builds

---

## Pending / Future Considerations

- [ ] Image compression on upload (server-side)
- [ ] Delete orphaned uploaded images
- [ ] Forgot password flow (send reset link via Resend)
- [ ] Server-side services layer for Product & Order logic (currently inline in controllers)
- [ ] Migrate hardcoded payment methods in Checkout to configurable options
- [ ] Production deployment config (CORS origins, HTTPS, env management)
- [ ] Rate limiting on OTP endpoint to prevent abuse
- [ ] Input sanitization for Quill HTML content (XSS prevention)
