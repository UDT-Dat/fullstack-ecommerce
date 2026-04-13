import React, { useEffect, useState, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../context/ToastContext";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [unreadOrders, setUnreadOrders] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API_URL + "/api/orders/unread");
        setUnreadOrders(res.data);
      } catch (error) {
        console.error("Error fetching unread orders:", error);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      showToast("Vui lòng đăng nhập hệ thống để vào Admin Dashboard", "error");
      navigate("/auth");
      return;
    }
    setUser(JSON.parse(userStr));
  }, [navigate]);

  if (!user) return null;

  const NavItem = ({ to, icon, label, exact = false, disabled = false }) => {
    const isActive = exact
      ? location.pathname === to
      : location.pathname.startsWith(to) && to !== "#";

    if (disabled || to === "#") {
      return (
        <div className={`flex items-center ${isSidebarOpen ? "gap-3 px-4" : "justify-center px-0"} py-3 rounded-lg text-zinc-300 font-medium cursor-not-allowed group relative overflow-hidden`}>
          <span className="material-symbols-outlined shrink-0">{icon}</span>
          {!isSidebarOpen && (
            <span className="absolute left-14 bg-zinc-900 text-xs text-white px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-50">
              {label}
            </span>
          )}
          {isSidebarOpen && <span className="text-sm">{label} (Sắp có)</span>}
        </div>
      );
    }

    return (
      <Link
        to={to}
        className={`flex items-center ${isSidebarOpen ? "gap-3 px-4" : "justify-center px-0"} py-3 rounded-lg transition-colors group relative ${isActive ? "bg-amber-500 text-zinc-900 font-bold shadow-sm" : "text-zinc-500 hover:bg-zinc-100 font-medium"}`}
      >
        <span
          className="material-symbols-outlined shrink-0"
          style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
        >
          {icon}
        </span>
        {!isSidebarOpen && (
          <span className="absolute left-14 bg-zinc-900 text-xs text-white px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-50">
            {label}
          </span>
        )}
        {isSidebarOpen && <span className="text-sm">{label}</span>}
      </Link>
    );
  };

  return (
    <div className="bg-zinc-50 text-zinc-900 min-h-screen font-body flex transition-all">
      <aside
        className={`fixed left-0 top-0 h-screen z-50 bg-white border-r border-zinc-200 flex flex-col p-4 gap-2 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"}`}
      >
        <div
          className={`mb-8 flex items-center gap-3 ${isSidebarOpen ? "px-2" : "justify-center"}`}
        >
          <div className="w-10 h-10 shrink-0 rounded-lg bg-zinc-900 flex items-center justify-center text-amber-500 shadow-md">
            <span className="material-symbols-outlined">local_bar</span>
          </div>
          {isSidebarOpen && (
            <div className="truncate">
              <h1 className="font-headline font-black text-zinc-900 text-lg leading-tight tracking-tight">
                Vitality
                <br />
                Admin
              </h1>
              <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                Menu Manager
              </p>
            </div>
          )}
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1 overflow-x-hidden">
          <NavItem
            to="/admin"
            exact={true}
            icon="dashboard"
            label="Bảng điều khiển"
          />
          <NavItem to="/admin/products" icon="local_bar" label="Sản phẩm" />
          <NavItem to="/admin/orders" icon="shopping_cart" label="Đơn hàng" />

          {user.role === "admin" && (
            <>
              <NavItem
                to="/admin/vouchers"
                icon="confirmation_number"
                label="Mã giảm giá"
              />
              <NavItem
                to="/admin/users"
                icon="manage_accounts"
                label="Người Quản Trị"
              />
              <NavItem to="/admin/members" icon="stars" label="Thẻ Hội Viên" />
              <NavItem to="/admin/posts" icon="newspaper" label="Bài Viết" />
              <NavItem to="/admin/banners" icon="photo_library" label="Banner" />
            </>
          )}
        </nav>
        <div className="mt-auto pt-4 border-t border-zinc-100 space-y-2 px-2">
          <Link
            to="/"
            className={`w-full bg-amber-500 text-zinc-900 py-3 rounded-lg font-bold shadow-md hover:bg-zinc-900 hover:text-white transition-all flex items-center gap-2 justify-center ${isSidebarOpen ? "text-sm px-4" : ""}`}
          >
            <span className="material-symbols-outlined text-xl">
              storefront
            </span>{" "}
            {isSidebarOpen && "Trở Về Shop"}
          </Link>
        </div>
      </aside>

      <div
        className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}
      >
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 flex justify-between items-center px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors flex items-center justify-center mr-2"
            >
              <span className="material-symbols-outlined">
                {isSidebarOpen ? "menu_open" : "menu"}
              </span>
            </button>
            <h2 className="font-headline font-bold text-lg hidden lg:block tracking-tight border-r border-zinc-200 pr-6 mr-2">
              Editorial Vitality
            </h2>
            <div className="bg-zinc-100/50 px-4 py-2 rounded-full border border-zinc-200 flex items-center gap-2 w-64 lg:w-96 focus-within:ring-1 focus-within:ring-amber-500 bg-white transition-all">
              <span className="material-symbols-outlined text-zinc-400 text-sm">
                search
              </span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm text-zinc-900 placeholder-zinc-400 w-full outline-none"
                placeholder="Tìm kiếm đơn hàng, khách hàng..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="text-zinc-400 hover:text-zinc-900 p-2 rounded-full transition-all hover:bg-zinc-100 flex items-center justify-center relative"
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadOrders.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
                  )}
                  {unreadOrders.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {unreadOrders.length > 9 ? '9+' : unreadOrders.length}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 overflow-hidden fade-in">
                    <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                      <h3 className="font-headline font-black text-sm text-zinc-900">Thông báo ({unreadOrders.length})</h3>
                      {unreadOrders.length > 0 && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{unreadOrders.length} Đơn mới</span>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {unreadOrders.length === 0 ? (
                        <div className="p-6 text-center text-zinc-500 text-xs">Không có thông báo mới</div>
                      ) : (
                        <div className="divide-y divide-zinc-50">
                          {unreadOrders.map(order => (
                            <div 
                              key={order._id}
                              onClick={() => {
                                setIsNotifOpen(false);
                                navigate(`/admin/orders?orderId=${order._id}`);
                              }}
                              className="p-4 hover:bg-zinc-50 transition-colors cursor-pointer group flex gap-3 items-start"
                            >
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-zinc-900 truncate">
                                  Đơn hàng từ {order.user?.name || 'Khách'}
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5 truncate">
                                  Mã: #{order._id.substring(0, 8).toUpperCase()}
                                </p>
                                <p className="text-[10px] text-zinc-400 font-medium mt-2 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[10px]">schedule</span>
                                  {new Date(order.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                              <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1"></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Link to="/admin/orders" onClick={() => setIsNotifOpen(false)} className="block w-full p-3 text-center text-xs font-bold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors border-t border-zinc-100">
                      Xem tất cả đơn hàng
                    </Link>
                  </div>
                )}
              </div>
              <button className="text-zinc-400 hover:text-zinc-900 p-2 rounded-full transition-all hover:bg-zinc-100">
                <span className="material-symbols-outlined">help</span>
              </button>
            </div>
            <div className="h-8 w-px bg-zinc-200"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-zinc-900 leading-none group-hover:text-amber-600 transition-colors">
                  {user.name}
                </p>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold mt-1 max-w-[100px] truncate">
                  {user.role === "admin" ? "Quản trị Bộ Phận" : "Nhân viên"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full border border-zinc-200 overflow-hidden shadow-sm">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt="Avatar"
                  className="w-full h-full object-cover bg-amber-100"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
