# PROJECT_RULES.md

Đây là tài liệu tổng hợp quy chuẩn dự án, tech stack, cấu trúc thư mục và luồng xử lý code dựa trên 70% source code đã hoàn thành. Hãy bám sát các quy chuẩn này để phát triển 30% chặng đường còn lại của dự án.

## 1. Công nghệ sử dụng (Tech Stack)

### Frontend (Client-side)
- **Framework**: React 19 kết hợp với Vite.
- **Styling**: Tailwind CSS v4, sử dụng file `index.css` và `App.css` cho cấu hình chung.
- **Routing**: React Router DOM (v7).
- **HTTP Client**: Axios (v1.13) để gửi request HTTP.
- **State Management**: React Context API (`CartContext`, `ToastContext`) và React Hooks (`useState`, `useEffect`).

### Backend (Server-side)
- **Runtime & Framework**: Node.js với Express (v5.2).
- **Database**: MongoDB thông qua thư viện Mongoose (v9.3).
- **Authentification**: JSON Web Token (JWT) và `bcryptjs` để băm mật khẩu.
- **Cấu hình & Middleware**: `dotenv` (quản lý biến môi trường), `cors` (cho phép Cross-Origin Request).

---

## 2. Quy chuẩn Code & Đặt tên (Naming Conventions)

### Frontend
- **Components & Pages**: Sử dụng PascalCase (VD: `BestSellers.jsx`, `Auth.jsx`, `VietnamAddressSelect.jsx`).
- **Context Files**: Sử dụng PascalCase kèm hậu tố "Context" (VD: `CartContext.jsx`, `ToastContext.jsx`).
- **Thư mục**: Sử dụng chữ thường, lowercase hoặc kebab-case (VD: `components`, `pages`, `admin`).

### Backend
- **Models (Database Schemas)**: Sử dụng PascalCase, số ít (VD: `User.js`, `Product.js`, `Order.js`).
- **Controllers**: Sử dụng camelCase với hậu tố "Controller" (VD: `productController.js`, `authController.js`).
- **Routes**: Sử dụng camelCase với hậu tố "Routes" (VD: `productRoutes.js`, `userRoutes.js`).
- **Middlewares**: Sử dụng camelCase (VD: `authMiddleware.js`).

### Quy chuẩn chung
- **Biến và Hàm (Functions & Variables)**: Luôn dùng camelCase (VD: `getAllProducts`, `handleSubmit`, `isLogin`).
- **Code logic**: Luôn sử dụng cú pháp ES6+ (Arrow functions, Destructuring, Async/Await ở cả Frontend và Backend).

---

## 3. Cấu trúc thư mục hiện tại (Directory Structure)

```text
fullstack-project/
├── frontend/ (thư mục src)
│   ├── assets/        # Hình ảnh, file tĩnh (.png, .svg)
│   ├── components/    # Components UI dùng chung (Navbar, Footer, Modal...)
│   ├── context/       # React Context API để quản lý global state
│   └── pages/         # Tầng giao diện chính (Views) mapping với React Router
│       └── admin/     # Thư mục con chứa các giao diện CMS/Dashboard cho Admin
│
└── server/            # Backend (Node.js/Express)
    ├── controllers/   # Chứa logic xử lý API (nhận req, xử lý, trả res)
    ├── middleware/    # Middleware (VD: Xác thực JWT token Auth)
    ├── models/        # Định nghĩa Mongoose schema tương tác với DB MongoDB
    ├── routes/        # Định nghĩa API endpoints (ánh xạ đến Controller tương ứng)
    └── server.js      # File Entry-point dùng khởi tạo Express server và cấu hình
```

---

## 4. Luồng xử lý gọi API (API Call Flow)

### Phía Client (Frontend)
1. **Trigger sự kiện**: Người dùng tương tác trên UI gọi một hàm xử lý sự kiện trong Component (VD: `handleSubmit`, `useEffect` để fetch lúc load trang).
2. **Call API**: Dùng `axios` (với url mặc định hướng đến `http://localhost:5000/api/...`) truyền tải object payload.
3. **Quản lý Token**: 
   - Token xác thực được lưu trữ tại `localStorage.setItem('token', ...)` khi login đăng nhập thành công.
   - Trạng thái user cũng lưu tại `localStorage.setItem('user', ...)`.
4. **Xử lý Response / Lỗi**: 
   - Dùng khối `try/catch` bọc axios call, nếu lỗi sẽ đọc thông báo từ server thông qua `err.response?.data?.message`.
   - Hiển thị Toast thông báo trạng thái thao tác (`showToast`) từ `ToastContext`.

*Ví dụ gọi hàm tại Frontend:*
```javascript
const response = await axios.post(`http://localhost:5000/api/auth/login`, payload);
localStorage.setItem('token', response.data.token);
showToast("Đăng nhập thành công!", "success");
```

### Phía Server (Backend)
1. **Entry Point & Routing**: Bắt đầu bằng việc `server.js` map yêu cầu vào các files nằm ở `routes/` (vd `/api/products` dùng `productRoutes.js`).
2. **Xử lý tại Routes**: Route tương ứng sẽ xác định phương thức HTTP (GET, POST, PUT, DELETE), chạy bảo mật (ví dụ `authMiddleware`) và gọi hàm định nghĩa bên `controllers`.
3. **Logic Controller**:
    - Luôn bọc logic backend bên trong khối `try/catch`.
    - Gọi truy vấn đến Mongoose Model (VD: `Product.find()`, `Product.findById()`, `new Product(...).save()`).
    - Trả về JSON thành công thông qua `res.status(200/201).json(...)`.
4. **Trả lỗi (Error Handling)**: 
    - Nếu tham số không hợp lệ hoặc không tìm thấy, Server trả code 404 hoặc 400.
    - Nếu Exception xảy ra, bắt vào khối `catch`, trả về mã 500 kèm thông báo cấu trúc lỗi: `res.status(500).json({ message: error.message })`.

*Ví dụ logic tại Backend:*
```javascript
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
```
