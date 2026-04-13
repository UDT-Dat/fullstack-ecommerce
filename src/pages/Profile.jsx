import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useToast } from "../context/ToastContext";
import VietnamAddressSelect from "../components/VietnamAddressSelect";
import { TIER_BADGE } from "../components/Navbar";

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    email: "",
    dob: "",
    gender: "Nam",
    address: "",
    province: "",
    district: "",
    ward: "",
  });
  const [myOrders, setMyOrders] = useState([]);
  const [memberBadge, setMemberBadge] = useState(null);
  const [isMember, setIsMember] = useState(true);
  const [ordersCount, setOrdersCount] = useState(0);
  const [effectiveTier, setEffectiveTier] = useState('Mới');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userStr || !token) {
      navigate("/auth");
      return;
    }

    setUser(JSON.parse(userStr));
    fetchProfileData(token);
    fetchMyOrders(token);

    axios.get(import.meta.env.VITE_API_URL + '/api/users/membership', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setIsMember(res.data.isMember);
      if (res.data.ordersCount !== undefined) {
         setOrdersCount(res.data.ordersCount);
      }
      if (res.data.tier) {
         setEffectiveTier(res.data.tier);
         if (TIER_BADGE[res.data.tier]) {
           setMemberBadge(res.data.tier);
         }
      }
    }).catch(() => {});
  }, [navigate]);

  const getMembershipProgress = () => {
    const TIER_BASES = { 'Chưa tham gia': 0, 'Mới': 0, 'Đồng': 10, 'Vàng': 20, 'Kim Cương': 30 };
    const baseOrders = TIER_BASES[effectiveTier] || 0;
    const visualOrders = Math.max(ordersCount, baseOrders);
    const percent = Math.min((visualOrders / 30) * 100, 100);

    if (visualOrders >= 30) return { next: 'Kim Cương', current: ordersCount, target: 30, percent, remaining: 0, maxed: true, visualOrders };
    if (visualOrders >= 20) return { next: 'Kim Cương', current: ordersCount, target: 30, percent, remaining: 30 - ordersCount, maxed: false, visualOrders };
    if (visualOrders >= 10) return { next: 'Vàng', current: ordersCount, target: 20, percent, remaining: 20 - ordersCount, maxed: false, visualOrders };
    return { next: 'Đồng', current: ordersCount, target: 10, percent, remaining: 10 - ordersCount, maxed: false, visualOrders };
  };

  const fetchProfileData = async (token) => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + "/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedInfo = res.data;
      setProfileData({
        name: fetchedInfo.name || "",
        phone: fetchedInfo.phone || "",
        email: fetchedInfo.email || "",
        dob: fetchedInfo.dob
          ? new Date(fetchedInfo.dob).toISOString().split("T")[0]
          : "",
        gender: fetchedInfo.gender || "Nam",
        address: fetchedInfo.address || "",
        province: fetchedInfo.province || "",
        district: fetchedInfo.district || "",
        ward: fetchedInfo.ward || "",
      });
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      showToast("Không thể tải thông tin profile", "error");
      setIsLoading(false);
    }
  };

  const fetchMyOrders = async (token) => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + "/api/orders/myorders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyOrders(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(import.meta.env.VITE_API_URL + "/api/users/profile", profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Đã cập nhật cấu hình tài khoản!", "success");

      const currentUserStr = localStorage.getItem("user");
      if (currentUserStr) {
        const usr = JSON.parse(currentUserStr);
        usr.name = profileData.name;
        usr.phone = profileData.phone;
        usr.email = profileData.email;
        localStorage.setItem("user", JSON.stringify(usr));
        setUser(usr);
      }
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Lỗi cập nhật", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showToast("Đã đăng xuất khỏi hệ thống.", "success");
    navigate("/auth");
  };

  if (!user || isLoading)
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-amber-500 animate-spin"></div>
      </div>
    );

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
        <header className="mb-12 border-b border-zinc-200 pb-8 relative">
          <div className="flex gap-4 items-center mb-2">
            <div className="relative">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-amber-500 text-2xl font-black shadow-lg border-2 border-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {memberBadge && TIER_BADGE[memberBadge] && (
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-lg ${TIER_BADGE[memberBadge].cls}`}
                  title={TIER_BADGE[memberBadge].title}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{TIER_BADGE[memberBadge].icon}</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="font-headline text-4xl font-extrabold text-zinc-900 tracking-tight leading-none uppercase">
                {user.name}
              </h1>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-1">
                {memberBadge && TIER_BADGE[memberBadge] ? TIER_BADGE[memberBadge].title : (user.role === "admin" ? "Quản Trị Tối Cao" : user.role === "staff" ? "Nhân viên Mạng Lưới" : "Thành viên Khách")}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-start">
          {/* Sidebar */}
          <aside className="md:col-span-1 space-y-2 sticky top-24">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full text-left px-5 py-4 font-bold rounded-2xl transition-all flex items-center gap-4 text-sm uppercase tracking-widest ${activeTab === "profile" ? "bg-zinc-900 text-amber-500 shadow-md translate-x-2" : "bg-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"}`}
            >
              <span className="material-symbols-outlined text-[20px]">
                manage_accounts
              </span>{" "}
              Thông tin
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left px-5 py-4 font-bold rounded-2xl transition-all flex items-center gap-4 text-sm uppercase tracking-widest ${activeTab === "orders" ? "bg-zinc-900 text-amber-500 shadow-md translate-x-2" : "bg-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"}`}
            >
              <span className="material-symbols-outlined text-[20px]">
                inventory_2
              </span>{" "}
              Đơn hàng
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full text-left px-5 py-4 font-bold rounded-2xl transition-all flex items-center gap-4 text-sm uppercase tracking-widest ${activeTab === "security" ? "bg-zinc-900 text-amber-500 shadow-md translate-x-2" : "bg-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"}`}
            >
              <span className="material-symbols-outlined text-[20px]">
                shield_lock
              </span>{" "}
              Bảo mật
            </button>
            {(user.role === "admin" || user.role === "staff") && (
              <Link
                to="/admin"
                className="w-full text-left px-5 py-4 text-amber-600 bg-amber-50 hover:bg-amber-100 font-bold rounded-2xl transition-all flex items-center gap-4 text-sm uppercase tracking-widest mt-2"
              >
                <span className="material-symbols-outlined text-[20px]">
                  admin_panel_settings
                </span>{" "}
                Quản trị
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left px-5 py-4 text-red-500 hover:bg-red-50 font-bold rounded-2xl transition-colors flex items-center gap-4 text-sm uppercase tracking-widest mt-8 border border-red-100"
            >
              <span className="material-symbols-outlined text-[20px]">
                logout
              </span>{" "}
              Đăng xuất
            </button>
            {!isMember && (
              <Link to="/promos" className="block mt-4 bg-zinc-900 rounded-2xl p-5 border border-zinc-800 hover:border-amber-500/50 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-amber-500 text-xl">diamond</span>
                  <span className="font-black text-white text-sm uppercase tracking-wider">Gói Hội Viên</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">Ưu đãi 15% trọn đời và giao hàng miễn phí mọi hóa đơn.</p>
                <span className="inline-block bg-amber-500 text-zinc-900 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
                  Đăng ký ngay
                </span>
              </Link>
            )}
          </aside>

          {/* Content */}
          <div className="md:col-span-3 space-y-8 min-h-[500px]">
            {activeTab === "profile" && (
              <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                
                {isMember && (() => {
                  const progress = getMembershipProgress();
                  return (
                    <div className="mb-10 bg-zinc-900 p-6 sm:p-8 rounded-2xl relative overflow-hidden group shadow-xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 rounded-bl-full opacity-10"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-end mb-6">
                          <div>
                             <h4 className="flex items-center gap-2 font-headline font-black text-amber-500 text-xl uppercase tracking-widest mb-1">
                                <span className="material-symbols-outlined mb-0.5 text-[22px]">military_tech</span>
                                Tiến trình Hội Viên
                             </h4>
                             {progress.maxed ? (
                               <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mt-2">Bạn đã đạt hạng <span className="text-amber-500 font-bold">Kim Cương</span> cao nhất!</p>
                             ) : (
                               <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mt-2">Còn <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">{progress.remaining} đơn hàng</span> nữa để thăng hạng <span className="text-amber-500 font-bold">{progress.next}</span>.</p>
                             )}
                          </div>
                          <div className="text-right bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                             <span className="text-3xl font-black text-white leading-none">{progress.current}</span>
                             <span className="text-zinc-500 text-sm font-bold"> / {progress.target}</span>
                          </div>
                        </div>
                        <div className="h-4 w-full bg-black rounded-full overflow-hidden shadow-inner border border-zinc-700/50">
                          <div className="h-full bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(245,158,11,0.5)]" style={{ width: `${progress.percent}%` }}></div>
                        </div>
                        <div className="mt-4 flex justify-between text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-zinc-600">
                           <span className={ordersCount >= 0 ? "text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.6)]" : ""}>Mới</span>
                           <span className={progress.visualOrders >= 10 ? "text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.6)]" : ""}>Đồng (10+)</span>
                           <span className={progress.visualOrders >= 20 ? "text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.6)]" : ""}>Vàng (20+)</span>
                           <span className={progress.visualOrders >= 30 ? "text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.6)]" : ""}>Kim Cương (30+)</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <h3 className="font-headline text-2xl font-black text-zinc-900 mb-8 uppercase tracking-tighter">
                  Cập nhật hồ sơ
                </h3>

                <form className="space-y-6" onSubmit={handleUpdateProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        required
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                        className="w-full border border-zinc-200 rounded-xl p-4 bg-zinc-50 outline-none focus:border-amber-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        value={profileData.dob}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            dob: e.target.value,
                          })
                        }
                        className="w-full border border-zinc-200 rounded-xl p-4 bg-zinc-50 outline-none focus:border-amber-500 font-bold uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phone: e.target.value,
                          })
                        }
                        className="w-full border border-zinc-200 rounded-xl p-4 bg-zinc-50 outline-none focus:border-amber-500 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        className="w-full border border-zinc-200 rounded-xl p-4 bg-zinc-50 outline-none focus:border-amber-500 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                        Giới tính
                      </label>
                      <select
                        value={profileData.gender}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            gender: e.target.value,
                          })
                        }
                        className="w-full border border-zinc-200 rounded-xl p-4 bg-zinc-50 outline-none focus:border-amber-500 font-bold"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác / Không tiết lộ</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-zinc-100">
                    <h4 className="text-sm font-black text-zinc-900 mb-4 uppercase tracking-widest">
                      Địa chỉ giao hàng
                    </h4>

                    <VietnamAddressSelect
                      province={profileData.province}
                      district={profileData.district}
                      ward={profileData.ward}
                      onChange={(val) => setProfileData({ ...profileData, ...val })}
                    />

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                        Địa chỉ cụ thể
                      </label>
                      <textarea
                        value={profileData.address}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            address: e.target.value,
                          })
                        }
                        className="w-full border border-zinc-200 rounded-xl p-4 bg-zinc-50 outline-none focus:border-amber-500 font-bold"
                        rows="2"
                        placeholder="Số nhà, tên đường..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      type="submit"
                      className="bg-zinc-900 text-white px-8 py-4 rounded-xl font-black tracking-widest uppercase hover:bg-amber-500 hover:text-zinc-900 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm fade-in">
                <h3 className="font-headline text-2xl font-black text-zinc-900 mb-8 uppercase tracking-tighter">
                  Lịch sử giao dịch
                </h3>

                {myOrders.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-zinc-50 rounded-2xl border border-dashed border-zinc-300">
                    <span className="material-symbols-outlined text-zinc-300 text-6xl mb-4">
                      shopping_bag
                    </span>
                    <h4 className="font-bold text-zinc-500 text-lg">
                      Bạn chưa có đơn hàng nào
                    </h4>
                    <Link
                      to="/menu"
                      className="mt-4 inline-block text-amber-600 font-black uppercase tracking-widest text-sm hover:underline"
                    >
                      Khám phá Thực Đơn →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {myOrders.map((order) => (
                      <div
                        key={order._id}
                        className="border border-zinc-200 rounded-2xl overflow-hidden hover:border-amber-300 transition-colors bg-zinc-50"
                      >
                        <div className="p-4 border-b border-zinc-200 bg-white flex justify-between items-center sm:px-6">
                          <div>
                            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-1">
                              Mã đơn #
                              {order._id.substring(order._id.length - 8)}
                            </span>
                            <span className="text-sm font-bold text-zinc-900">
                              {new Date(order.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === "Completed" || order.status === "Delivered" ? "bg-green-100 text-green-700" : order.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="space-y-3 mb-4 border-b border-zinc-200 pb-4">
                            {order.products.map((item) => (
                              <div
                                key={item._id}
                                className="flex justify-between items-center text-sm"
                              >
                                <span className="font-bold text-zinc-700">
                                  {item.quantity}x{" "}
                                  {item.product?.title || "Sản phẩm đã bị xóa"}{" "}
                                  <span className="text-zinc-400 text-xs ml-2 uppercase">
                                    ({item.size})
                                  </span>
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                              Tổng Thanh Toán
                            </span>
                            <span className="font-headline font-black text-amber-500 text-xl">
                              {order.totalPrice.toLocaleString()}đ
                            </span>
                          </div>
                          
                          <div className="mt-6 pt-4 border-t border-zinc-200 border-dashed flex justify-end">
                             <Link to={`/order-status/${order._id}`} className={`px-6 py-2.5 rounded-xl font-bold tracking-widest uppercase text-[10px] transition-all flex items-center gap-2 ${order.status === 'Pending' || order.status === 'Processing' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:-translate-y-0.5' : 'bg-zinc-100 border border-zinc-200 text-zinc-600 hover:bg-zinc-200'}`}>
                                 <span className="material-symbols-outlined text-[14px]">
                                    {order.status === 'Pending' || order.status === 'Processing' ? 'route' : 'receipt_long'}
                                 </span>
                                 {order.status === 'Pending' || order.status === 'Processing' ? 'Theo dõi hành trình' : 'Xem chi tiết'}
                             </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                <h3 className="font-headline text-2xl font-black text-zinc-900 mb-2 uppercase tracking-tighter">
                  Đổi mật khẩu
                </h3>
                <p className="text-sm text-zinc-500 mb-8">Cập nhật mật khẩu đăng nhập cho tài khoản của bạn.</p>

                <form className="space-y-6 max-w-md" onSubmit={async (e) => {
                  e.preventDefault();
                  if (passwordData.newPassword !== passwordData.confirmPassword) {
                    return showToast('Mật khẩu xác nhận không khớp.', 'error');
                  }
                  if (passwordData.newPassword.length < 6) {
                    return showToast('Mật khẩu mới cần ít nhất 6 ký tự.', 'error');
                  }
                  try {
                    const token = localStorage.getItem('token');
                    const res = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/change-password', {
                      currentPassword: passwordData.currentPassword,
                      newPassword: passwordData.newPassword
                    }, { headers: { Authorization: `Bearer ${token}` } });
                    showToast(res.data.message, 'success');
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  } catch (err) {
                    showToast(err.response?.data?.message || 'Lỗi đổi mật khẩu.', 'error');
                  }
                }}>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <input type={showCurrentPw ? 'text' : 'password'} required value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full border border-zinc-200 rounded-xl p-4 bg-zinc-50 outline-none focus:border-amber-500 font-bold pr-12" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-500 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">{showCurrentPw ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Mật khẩu mới</label>
                    <div className="relative">
                      <input type={showNewPw ? 'text' : 'password'} required minLength="6" value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full border border-zinc-200 rounded-xl p-4 bg-zinc-50 outline-none focus:border-amber-500 font-bold pr-12" placeholder="Ít nhất 6 ký tự" />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-500 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">{showNewPw ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Xác nhận mật khẩu mới</label>
                    <input type="password" required minLength="6" value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full border border-zinc-200 rounded-xl p-4 bg-zinc-50 outline-none focus:border-amber-500 font-bold" placeholder="Nhập lại mật khẩu mới" />
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="bg-zinc-900 text-white px-8 py-4 rounded-xl font-black tracking-widest uppercase hover:bg-amber-500 hover:text-zinc-900 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all">
                      Cập nhật mật khẩu
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Profile;
