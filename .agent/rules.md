# Project Rules

## 1. Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **State Management**: React Context API (`CartContext`, `ToastContext`) + React Hooks
- **Charts**: Recharts
- **Rich Text Editor**: `react-quill-new` (Quill 2 compatible with React 18/19)
- **Module System**: ESM (`"type": "module"` in root package.json)

### Backend
- **Runtime**: Node.js with Express v5
- **Database**: MongoDB via Mongoose v9
- **Authentication**: JWT (`jsonwebtoken`) + `bcryptjs`
- **Email**: Resend SDK
- **File Uploads**: Multer (stored locally in `server/uploads/`)
- **Module System**: CommonJS (`"type": "commonjs"` in server package.json)
- **Dev Server**: Nodemon

---

## 2. Naming Conventions

### Frontend
| Element         | Convention   | Example                        |
|-----------------|-------------|--------------------------------|
| Components      | PascalCase  | `BestSellers.jsx`, `Auth.jsx` |
| Pages           | PascalCase  | `Menu.jsx`, `Checkout.jsx`    |
| Admin Pages     | PascalCase  | `Orders.jsx`, `Products.jsx`  |
| Context Files   | PascalCase + "Context" | `CartContext.jsx`   |
| Directories     | lowercase / kebab-case | `components`, `pages`, `admin` |

### Backend
| Element         | Convention        | Example                   |
|-----------------|------------------|---------------------------|
| Models          | PascalCase, singular | `User.js`, `Order.js`  |
| Controllers     | camelCase + "Controller" | `authController.js` |
| Routes          | camelCase + "Routes" | `orderRoutes.js`       |
| Services        | camelCase + "Service" | `emailService.js`     |
| Middleware      | camelCase         | `authMiddleware.js`       |

### General
- Variables & functions: **camelCase** (`getAllProducts`, `handleSubmit`)
- Always use **ES6+** syntax: arrow functions, destructuring, async/await
- All async controller/service functions **must** be wrapped in `try/catch`
- Log errors with `console.error()` including descriptive prefix

---

## 3. Architecture Patterns

### Backend: MVC + Services
```
Request → Route → (Middleware) → Controller → (Service) → Model → Response
```
- **Routes**: Define HTTP method, path, middleware, and map to controller functions
- **Controllers**: Handle `req`/`res`, validate input, delegate to models/services
- **Services**: Reusable business logic (e.g., `emailService.js`), exportable across controllers
- **Models**: Mongoose schemas only — no business logic
- **Middleware**: Cross-cutting concerns (auth, upload)

### Frontend: Component-Based
```
App.jsx (Router) → Pages → Components
                 → Context Providers (Cart, Toast)
```
- Pages are full views mapped to routes
- Components are reusable UI pieces
- Global state lives in Context API

---

## 4. API Contract Standards

### Request Flow (Frontend → Backend)
1. Use `axios` with base URL `http://localhost:5000/api/...`
2. Auth token stored in `localStorage.getItem('token')`
3. Pass token via `headers: { Authorization: \`Bearer ${token}\` }`
4. Wrap calls in `try/catch`, read errors from `err.response?.data?.message`
5. Display user feedback via `showToast()` from `ToastContext`

### Response Format (Backend)
- **Success**: `res.status(200|201).json(data)` or `res.status(200).json({ message: "..." })`
- **Client Error**: `res.status(400|404).json({ message: "..." })`
- **Auth Error**: `res.status(401|403).json({ message: "..." })`
- **Server Error**: `res.status(500).json({ message: error.message })`

---

## 5. Coding Rules

1. **No hardcoded data** in frontend components. All display data must come from API calls to MongoDB.
2. **No inline styles** — use Tailwind CSS utility classes exclusively.
3. **Every controller function** must use `async/await` with `try/catch` and return proper status codes.
4. **Environment variables** go in `server/.env` — never commit secrets to version control.
5. **File uploads** go to `server/uploads/` and are served statically via `/uploads/` path.
6. **OTP records** use MongoDB TTL index (auto-expire after 5 minutes) — never manually clean up.
7. **JWT duration**: 30 days if "remember me" is checked, otherwise 1 day.
8. Use `--legacy-peer-deps` when installing frontend npm packages to avoid React 19 peer conflicts.

---

## 6. UI/UX Standards

- **Design language**: Dark premium aesthetic with amber/gold (#f59e0b) accent color
- **Background**: Zinc-950 (#09090b) dark theme for auth/admin, light zinc (#fafafa) for public pages
- **Typography**: Google Fonts — headline font for titles, body font for content
- **Components**: Rounded corners (rounded-2xl), subtle shadows, glassmorphism effects
- **Interactions**: Hover scale effects, smooth transitions, toast notifications for all actions
- **Icons**: Material Symbols Outlined (Google)
- **Admin panel**: Sidebar layout with collapsible navigation
