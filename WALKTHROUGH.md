# Ecommerce Full-Stack Project (MERN)

Dự án E-commerce toàn diện được xây dựng trên nền tảng MERN stack (MongoDB, Express.js, React.js, Node.js). Tài liệu này cung cấp cái nhìn tổng quan về kiến trúc, công nghệ và các tính năng cốt lõi của website.

---

## 🛠 Tech Stack (Công nghệ sử dụng)

### Frontend (User Interface & User Experience)

- **Framework:** React.js (v19) kết hợp với Vite để tối ưu hóa tốc độ build và hot-reloading.
- **Styling:** Tailwind CSS cho giao diện hiện đại, responsive và dễ dàng mở rộng.
- **Routing:** React Router DOM (v7) quản lý điều hướng.
- **UI Components & Features:**
  - `Recharts`: Vẽ biểu đồ thống kê trực quan cho Admin Dashboard.
  - `React Quill`: Rich Text Editor dùng để soạn thảo bài viết/tin tức.
- **HTTP Client:** Axios xử lý các API call tới backend một cách gọn gàng.

### Backend (Server, API & Database)

- **Runtime & Framework:** Node.js và Express.js cung cấp RESTful API.
- **Database:** MongoDB (quản lý qua Mongoose) lưu trữ dữ liệu với kiến trúc Schema linh hoạt.
- **Authentication & Security:**
  - JSON Web Token (JWT) cho xác thực người dùng an toàn.
  - `bcryptjs` để mã hóa mật khẩu.
  - `cors` xử lý Cross-Origin Resource Sharing.
- **Media Storage:** Tích hợp Cloudinary và Multer để upload và lưu trữ hình ảnh sản phẩm/banner/avatar an toàn lên cloud.
- **Email Service:** Tích hợp hệ thống gửi email tự động (như xác thực tài khoản, thông báo đơn hàng) chuyên nghiệp thông qua Brevo/Resend.

---

## Các tính năng cốt lõi (Core Features)

Dự án được phân chia rõ ràng thành hai phần: **Giao diện người dùng (Client)** và **Trang quản trị (Admin Panel)**.

### 1. Phía Người dùng (Client-Side)

- **Xác thực người dùng:** Đăng ký, đăng nhập an toàn, xác minh email và quên mật khẩu.
- **Quản lý Hồ sơ & Hạng thành viên (Loyalty System):**
  - Cập nhật thông tin cá nhân.
  - Hệ thống theo dõi khách hàng trung thành, phân hạng thành viên (Membership Tiers) dựa trên chi tiêu và tích lũy.
- **Trải nghiệm mua sắm:**
  - Hiển thị danh mục sản phẩm (Menu) với các bộ lọc phân loại.
  - Xem chi tiết sản phẩm (`ProductDetail`).
  - Quản lý giỏ hàng (`Cart`).
  - Áp dụng mã giảm giá (`Promotions/Discounts`).
  - Thanh toán mượt mà (`Checkout`) và theo dõi trạng thái đơn hàng (`OrderStatus`).
- **Tin tức & Tương tác:** Trang tin tức (`News`, `NewsDetail`) hiển thị bài viết mới, cập nhật từ thương hiệu.

### 2. Phía Quản trị viên (Admin Dashboard)

- **Tổng quan thống kê:** Bảng điều khiển (`AdminDashboard`) với biểu đồ trực quan (Recharts) hiển thị báo cáo doanh thu, số lượng đơn hàng, người dùng mới.
- **Quản lý Đơn hàng (Order Management):**
  - Hệ thống thông báo **Real-time** và icon hiển thị **đơn hàng mới** ở Header.
  - Chỉ báo (Indicator) giúp Admin nhận diện ngay lập tức những đơn chưa xem.
  - Thay đổi trạng thái đơn hàng (Đang xử lý, Đã giao, Hủy...).
- **Quản lý Sản phẩm & Banners:**
  - Thêm, sửa, xóa sản phẩm kèm tính năng hiển thị tag ("Bán chạy", "Sản phẩm mới" - `NewFace`).
  - Upload banner trực tiếp lên Cloudinary.
- **Quản lý Khách hàng:** Xem danh sách người dùng, thay đổi quyền hoặc điều chỉnh hạng thành viên theo cách thủ công.
- **Quản lý Content/Blog:** Đăng và chỉnh sửa bài viết nội dung sử dụng React Quill.

---

## 📂 Tổ chức mã nguồn (Project Structure)

Dự án áp dụng mô hình chuẩn phân tách Frontend và Backend rõ ràng:

- **Ngôn ngữ chung:** JavaScript.
- **/src**: Chứa mã nguồn Frontend (React components, Pages, Utils...).
- **/server**: Chứa mã nguồn Backend (Controllers, Models, Routes, Services, Middlewares). Thiết kế logic Model-View-Controller (MVC) với Routes tách biệt, Controllers xử lý nghiệp vụ, DB tương tác thông qua Models.

---

## 🌟 Điểm nổi bật dành cho Nhà tuyển dụng

- **Xử lý Logic phức tạp:** Quản lý quy trình Checkout kết hợp Coupon/Giảm giá, Tracking Loyalty Tiers.
- **Khả năng Scale & Real-time:** Ứng dụng hệ thống Notification Counter cho Admin khi có đơn hàng mới; nâng cấp bảo mật từ SMTP thuần lên Rest API bằng Brevo.
- **Clean Code & UX/UI Focus:** Tổ chức Component React gọn gàng kết hợp Tailwind (Utility-first) mang lại sự duy trì mã dễ dàng và giao diện đẹp, đồng bộ trên nhiều kích thước màn hình.
- **Thực tế:** Các quyết định kiến trúc như sử dụng Cloudinary cho resource hoặc Brevo API cho email cho thấy việc định hướng tới môi trường Production thực tế.
