import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useToast } from '../context/ToastContext';

const Promotions = () => {
  const [membership, setMembership] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (isLoggedIn) {
        fetchMembership();
    }
  }, [isLoggedIn]);

  const fetchMembership = async () => {
      try {
          const token = localStorage.getItem('token');
          const res = await axios.get(import.meta.env.VITE_API_URL + '/api/users/membership', {
              headers: { Authorization: `Bearer ${token}` }
          });
          setMembership(res.data);
      } catch (err) {
          console.error(err);
      }
  };

  const handleJoinMembership = async () => {
      if (!isLoggedIn) {
          showToast("Vui lòng đăng nhập để tham gia Hệ thống Hội viên", "error");
          navigate('/auth');
          return;
      }
      setIsLoading(true);
      try {
          const token = localStorage.getItem('token');
          const res = await axios.put(import.meta.env.VITE_API_URL + '/api/users/join-membership', {}, {
              headers: { Authorization: `Bearer ${token}` }
          });
          showToast(res.data.message, "success");
          fetchMembership();
      } catch (err) {
          showToast(err.response?.data?.message || "Lỗi đăng ký", "error");
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="bg-zinc-950 font-body text-white min-h-screen">
      <Navbar />
      
      <main className="pt-32 pb-24">
         <section className="relative px-6 max-w-7xl mx-auto mb-20 text-center">
             <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none fade-in"></div>
             
             <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter uppercase leading-none drop-shadow-2xl fade-in slide-up relative z-10">
                 Citrus <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Premium</span>
             </h1>
             <p className="mt-6 text-zinc-400 max-w-2xl mx-auto text-lg md:text-xl font-medium tracking-wide fade-in slide-up" style={{ animationDelay: '0.1s' }}>
                 Hệ thống khách hàng thân thiết với các đặc quyền vượt trội. Tích lũy đơn hàng, nhận chiết khấu trực tiếp không giới hạn.
             </p>

             <div className="mt-12 flex justify-center fade-in slide-up relative z-10" style={{ animationDelay: '0.2s' }}>
                {membership?.isMember ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-amber-400 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-zinc-900 rounded-[2rem] px-8 py-10 ring-1 ring-white/10">
                             <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <span className="material-symbols-outlined text-amber-500 text-3xl">verified</span>
                             </div>
                             <h3 className="font-headline text-3xl font-black mb-2 uppercase tracking-tighter">Thẻ V.I.P</h3>
                             <p className="text-sm font-bold text-zinc-400 mb-6 tracking-widest uppercase">Hạng hiện tại: <span className="text-amber-500">{membership.tier}</span></p>
                             
                             <div className="bg-black/50 rounded-2xl p-6 mb-6">
                                 <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-1">Mức Giảm Giá Trực Tiếp</p>
                                 <p className="text-4xl font-headline font-black text-amber-500">{membership.discountPercentage}%</p>
                             </div>

                             <div className="flex justify-between items-center text-sm font-bold border-t border-zinc-800 pt-6 mt-4">
                                <span className="text-zinc-500">Đơn đã giao thành công</span>
                                <span className="text-white px-3 py-1 bg-zinc-800 rounded-full">{membership.ordersCount}</span>
                             </div>
                        </div>
                    </div>
                ) : (
                    <button 
                       onClick={handleJoinMembership} 
                       disabled={isLoading}
                       className="group relative px-10 py-5 bg-amber-500 text-zinc-950 font-black text-lg uppercase tracking-widest rounded-full overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                           {isLoading ? 'Đang kích hoạt thẻ...' : 'Mở thẻ Hội Viên miễn phí'}
                           {!isLoading && <span className="material-symbols-outlined font-black group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    </button>
                )}
             </div>
         </section>

         <section className="px-6 max-w-6xl mx-auto mb-20 fade-in slide-up" style={{ animationDelay: '0.3s' }}>
             <div className="text-center mb-12">
                 <h2 className="font-headline text-3xl font-black uppercase tracking-tight">Quyền Lợi Thăng Hạng</h2>
                 <p className="text-zinc-500 text-sm mt-3 font-bold tracking-widest uppercase">Tự động cộng dồn ưu đãi với mã Voucher</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Bronze */}
                 <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-amber-700/50 transition-colors">
                     <div className="w-12 h-12 rounded-xl bg-orange-900/30 text-orange-500 flex items-center justify-center font-black mb-6 border border-orange-500/20">
                         <span className="material-symbols-outlined">military_tech</span>
                     </div>
                     <h3 className="font-headline text-2xl font-black uppercase mb-2">Đồng</h3>
                     <p className="text-zinc-400 text-sm mb-6">Dành cho khách hàng khởi đầu hành trình tươi mát.</p>
                     
                     <div className="space-y-4">
                         <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-3">
                             <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Điều kiện</span>
                             <span className="font-bold text-white">10 Đơn Hàng</span>
                         </div>
                         <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-3">
                             <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Đặc quyền</span>
                             <span className="font-black text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full">-5% Tổng Bill</span>
                         </div>
                     </div>
                 </div>

                 {/* Gold */}
                 <div className="bg-zinc-900 border border-amber-500/30 rounded-3xl p-8 relative overflow-hidden transform md:-translate-y-4 shadow-[0_10px_40px_rgba(245,158,11,0.1)]">
                     <div className="absolute top-0 right-0 bg-amber-500 text-zinc-950 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">Phổ Biến</div>
                     <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black mb-6 border border-amber-500/50">
                         <span className="material-symbols-outlined">social_leaderboard</span>
                     </div>
                     <h3 className="font-headline text-2xl font-black uppercase mb-2">Vàng</h3>
                     <p className="text-zinc-400 text-sm mb-6">Đã chứng minh niềm đam mê thức uống bất tận.</p>
                     
                     <div className="space-y-4">
                         <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-3">
                             <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Điều kiện</span>
                             <span className="font-bold text-white">20 Đơn Hàng</span>
                         </div>
                         <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-3">
                             <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Đặc quyền</span>
                             <span className="font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">-10% Tổng Bill</span>
                         </div>
                     </div>
                 </div>

                 {/* Diamond */}
                 <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-blue-500/50 transition-colors">
                     <div className="w-12 h-12 rounded-xl bg-blue-900/30 text-blue-400 flex items-center justify-center font-black mb-6 border border-blue-500/20">
                         <span className="material-symbols-outlined">diamond</span>
                     </div>
                     <h3 className="font-headline text-2xl font-black uppercase mb-2">Kim Cương</h3>
                     <p className="text-zinc-400 text-sm mb-6">Trở thành thượng khách cao cấp nhất của hệ thống.</p>
                     
                     <div className="space-y-4">
                         <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-3">
                             <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Điều kiện</span>
                             <span className="font-bold text-white">30 Đơn Hàng</span>
                         </div>
                         <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-3">
                             <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Đặc quyền</span>
                             <span className="font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">-15% Tổng Bill</span>
                         </div>
                     </div>
                 </div>
             </div>
         </section>
      </main>

      <Footer />
    </div>
  );
};

export default Promotions;
