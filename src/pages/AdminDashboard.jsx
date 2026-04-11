import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Quick auth check for testing the Admin panel
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert("Vui lòng đăng nhập hệ thống để vào Admin Dashboard");
      navigate('/auth');
      return;
    }
    const parsedUser = JSON.parse(userStr);
    setUser(parsedUser);
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="bg-surface font-body text-zinc-900 min-h-screen flex">
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full w-64 z-50 bg-zinc-950 flex flex-col p-4 gap-2">
        <div className="px-4 py-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950">
              <span className="material-symbols-outlined">local_bar</span>
            </div>
            <div>
              <h1 className="font-black text-white text-lg leading-tight">Vitality Admin</h1>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Quản Lý Hệ Thống</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 bg-amber-500 text-zinc-950 rounded-lg font-bold transition-all duration-300">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>dashboard</span>
            <span className="text-sm">Tổng quan</span>
          </Link>
          <Link to="#" className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-lg">
            <span className="material-symbols-outlined">local_bar</span>
            <span className="text-sm">Danh mục</span>
          </Link>
          <Link to="#" className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-lg">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="text-sm">Đơn hàng</span>
          </Link>
        </nav>
        <div className="mt-auto p-4 border-t border-white/10">
          <button className="w-full bg-white text-zinc-950 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-amber-500 transition-colors active:scale-95">
            <span className="material-symbols-outlined">add</span>
            Đơn hàng mới
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 ml-64 relative">
        <header className="absolute top-0 w-full z-40 bg-white border-b border-outline flex justify-between items-center h-16 px-6">
          <div className="flex items-center gap-8">
            <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight">Editorial Vitality</h2>
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-zinc-500 text-sm">search</span>
              </div>
              <input className="bg-surface border-none rounded-lg pl-10 pr-4 py-2 text-sm w-72 focus:ring-1 focus:ring-amber-500 bg-zinc-100 transition-all placeholder:text-zinc-400 outline-none" placeholder="Tìm kiếm đồ uống, đơn hàng..." type="text"/>
            </div>
          </div>
          <div className="flex items-center gap-4 py-2">
            <Link to="/" className="p-2 rounded-full hover:bg-zinc-100 transition-all active:scale-95 text-zinc-500 flex items-center gap-2 text-xs font-bold uppercase tracking-widest mr-4">
              <span className="material-symbols-outlined text-lg">storefront</span> Đến giao diện Shop
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-outline">
              <div className="text-right">
                <p className="text-sm font-bold text-zinc-950 leading-none">{user.name}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Quản trị viên</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-outline bg-amber-500 text-zinc-950 flex items-center justify-center font-bold uppercase">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="pt-24 px-8 pb-12 w-full max-w-7xl">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black text-zinc-950 tracking-tighter mb-2">Chào buổi sáng, {user.name.split(' ')[0] || user.name}.</h1>
              <p className="text-zinc-500 text-lg max-w-xl">Đây là báo cáo tổng hợp tồn kho và doanh thu thực tế dựa trên giao diện thiết kế.</p>
            </div>
            <div className="flex gap-3">
               <button className="px-6 py-2.5 bg-amber-500 text-zinc-950 font-bold rounded-lg shadow-sm hover:shadow-md transition-shadow">
                Xem thống kê trực tiếp
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-zinc-950 rounded-lg text-amber-500">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="text-xs font-black text-green-600">+12.5%</span>
              </div>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Tổng doanh thu</p>
              <h3 className="text-3xl font-black text-zinc-950">1.095.000.000 ₫</h3>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-zinc-950 rounded-lg text-amber-500">
                  <span className="material-symbols-outlined">shopping_bag</span>
                </div>
                <span className="text-xs font-black text-green-600">+8%</span>
              </div>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Đơn hàng mới</p>
              <h3 className="text-3xl font-black text-zinc-950">1,204</h3>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-zinc-950 rounded-lg text-amber-500">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <span className="text-xs font-black text-zinc-500">Ổn định</span>
              </div>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Khách hàng mới</p>
              <h3 className="text-3xl font-black text-zinc-950">8,542</h3>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-zinc-950 rounded-lg text-amber-500">
                  <span className="material-symbols-outlined">confirmation_number</span>
                </div>
                <span className="text-xs font-black text-red-600">Cao</span>
              </div>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Voucher chờ duyệt</p>
              <h3 className="text-3xl font-black text-zinc-950">43</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-xl border-2 border-zinc-950">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-black text-zinc-950 uppercase tracking-tight">Biểu đồ doanh thu tuần (UI Mẫu)</h3>
                  <p className="text-sm text-zinc-500">Hiệu suất trên tất cả danh mục sản phẩm</p>
                </div>
              </div>
              <div className="h-64 flex items-end justify-between gap-4">
                {[60, 45, 85, 95, 70, 40, 55].map((height, index) => {
                  const days = ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'];
                  const isMax = height === 95;
                  return (
                    <div key={index} className="flex flex-col items-center gap-2 w-full group">
                      <div className={`w-full rounded-t transition-all ${isMax ? 'bg-zinc-950 shadow-xl' : 'bg-zinc-200 group-hover:bg-amber-500'}`} style={{ height: `${height}%` }}></div>
                      <span className={`text-[10px] uppercase ${isMax ? 'font-black text-zinc-950' : 'font-bold text-zinc-500'}`}>{days[index]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-zinc-950 p-8 rounded-xl flex flex-col justify-between text-white relative overflow-hidden">
              <div className="absolute -top-4 -right-4 opacity-10">
                <span className="material-symbols-outlined text-[160px]">insights</span>
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-amber-500 mb-4 uppercase tracking-tighter">Gợi ý tồn kho</h3>
                <p className="text-gray-300 leading-relaxed font-medium">Lô hàng Cold Brew nguyên chất đang hết. Nhập thêm trước đợt cao điểm chiều nay.</p>
              </div>
              <button className="relative z-10 w-full bg-amber-500 text-zinc-950 font-black py-4 rounded-lg mt-6 hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95 uppercase text-xs tracking-widest">
                Tối ưu ngay
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
