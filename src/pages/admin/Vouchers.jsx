import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const Vouchers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [formData, setFormData] = useState({ code: '', discountPercentage: '', expiryDate: '' });
  const { showToast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const fetchDiscounts = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/discounts');
      setDiscounts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchDiscounts(); }, []);

  const handleCreate = async () => {
    try {
      await axios.post(import.meta.env.VITE_API_URL + '/api/discounts', {
         code: formData.code,
         discountPercentage: Number(formData.discountPercentage),
         expiryDate: formData.expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // default 1 year
      });
      setIsModalOpen(false);
      setFormData({ code: '', discountPercentage: '', expiryDate: '' });
      fetchDiscounts();
      showToast("Tạo mã khuyên mãi thành công", "success");
    } catch (err) {
      console.error("Error creating discount", err);
      showToast("Lỗi: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const confirmDelete = async () => {
     if(deleteConfirm.id) {
         try {
             await axios.delete(`${import.meta.env.VITE_API_URL}/api/discounts/${deleteConfirm.id}`);
             fetchDiscounts();
             showToast("Đã xóa mã khuyên mãi", "success");
         } catch(err) { 
             console.error(err); 
             showToast("Lỗi xóa mã", "error");
         } finally {
             setDeleteConfirm({ show: false, id: null });
         }
     }
  };

  return (
    <div className="fade-in space-y-10 relative">
      <ConfirmModal 
         isOpen={deleteConfirm.show} 
         onClose={() => setDeleteConfirm({show: false, id: null})} 
         onConfirm={confirmDelete} 
         title="Xóa mã giảm giá này?" 
         description="Toàn bộ lịch sử sử dụng và dữ liệu mã sẽ bị xóa vĩnh viễn khỏi Database." 
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Marketing & Phát triển</p>
          <h1 className="text-4xl font-headline font-extrabold text-zinc-900 tracking-tight mb-2">
            Mã giảm giá <span className="text-amber-400">Khuyến mãi</span>
          </h1>
          <p className="text-zinc-500 text-sm max-w-xl leading-relaxed">Quản lý các chiến dịch theo mùa và phần thưởng tri ân khách hàng trực tiếp từ Database.</p>
        </div>
        <div className="flex gap-3 text-sm font-bold">
          <button className="bg-white border border-zinc-200 text-zinc-900 px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-zinc-50 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">assessment</span>
            Xem báo cáo
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-zinc-900 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-md hover:bg-amber-400 hover:text-zinc-900 transition-colors">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tạo mã mới
          </button>
        </div>
      </div>

      {/* Top Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Live Campaign Card */}
         <div className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h3 className="font-headline font-bold text-lg text-zinc-900">Chiến dịch API</h3>
               <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Đang hoạt động</span>
            </div>
            <p className="text-xs text-zinc-500 mb-8">Tổng số mã giảm giá trong Database</p>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Mã đang có</p>
                  <p className="text-3xl font-headline font-black text-zinc-900">{discounts.length}</p>
               </div>
               <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Lượt sử dụng toàn hệ thống</p>
                  <p className="text-3xl font-headline font-black text-zinc-900">{discounts.reduce((sum, d) => sum + d.usedCount, 0)}</p>
               </div>
            </div>
         </div>

         {/* Tip Card */}
         <div className="bg-amber-400 p-8 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -bottom-10 -right-10 opacity-20">
               <span className="material-symbols-outlined text-[200px]">star</span>
            </div>
            <div className="relative z-10">
               <h3 className="font-headline font-bold text-xl text-zinc-900 mb-4">Mẹo chiến dịch</h3>
               <p className="text-zinc-800 text-sm leading-relaxed mb-6 font-medium">Bạn có thể tạo giới hạn mã hoặc thời gian hết hạn thông qua form API để kích thích mua sắm.</p>
            </div>
            <button className="text-zinc-900 font-bold text-sm flex items-center gap-2 hover:underline w-max relative z-10">
               Đọc hướng dẫn Marketing <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
         </div>
      </div>

      {/* Vouchers List */}
      <div>
         <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline font-extrabold text-2xl text-zinc-900">Danh sách mã từ DB</h2>
            <div className="flex gap-2">
               <button className="p-2 text-zinc-400 hover:text-zinc-900"><span className="material-symbols-outlined">filter_list</span></button>
               <button className="p-2 text-zinc-900 bg-zinc-100 rounded-lg"><span className="material-symbols-outlined">grid_view</span></button>
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {discounts.map(voucher => {
               const isActive = new Date(voucher.expiryDate) > new Date();
               return (
            <div key={voucher._id} className={`bg-white border border-zinc-200 rounded-2xl p-6 flex items-center justify-between group transition-colors shadow-sm ${isActive ? 'hover:border-amber-400' : 'opacity-60 cursor-not-allowed'}`}>
               <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-zinc-50 rounded-xl border border-zinc-100 flex flex-col items-center justify-center shrink-0">
                     <span className="text-2xl font-black font-headline text-zinc-900">{voucher.discountPercentage}%</span>
                     <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Giảm</span>
                  </div>
                  <div>
                     <div className="flex items-center gap-3 mb-1">
                        <h4 className={`font-bold text-lg uppercase ${isActive ? 'text-zinc-900' : 'text-zinc-400 line-through'}`}>{voucher.code}</h4>
                        {isActive ? (
                           <span className="bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex gap-1 items-center"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Hoạt động</span>
                        ) : (
                           <span className="bg-zinc-200 text-zinc-500 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex gap-1 items-center"> Hết hạn</span>
                        )}
                     </div>
                     <div className="flex gap-6 mt-3 text-xs text-zinc-500 font-medium">
                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">group</span> {voucher.usedCount} / {voucher.usageLimit} Đã dùng</span>
                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">event</span> Hết hạn: {new Date(voucher.expiryDate).toLocaleDateString('vi-VN')}</span>
                     </div>
                  </div>
               </div>
               <button onClick={() => setDeleteConfirm({show: true, id: voucher._id})} className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors z-10">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
               </button>
            </div>
            )})}

            {/* Create New Voucher Card */}
            <div onClick={() => setIsModalOpen(true)} className="bg-transparent border-2 border-dashed border-zinc-200 rounded-2xl p-6 flex items-center gap-6 group hover:border-amber-400 hover:bg-amber-50/50 transition-colors cursor-pointer">
               <div className="w-20 h-20 bg-white rounded-full border border-zinc-100 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-zinc-400 group-hover:text-amber-500 text-[32px]">add</span>
               </div>
               <div>
                  <h4 className="font-bold text-zinc-900 text-lg mb-1 group-hover:text-amber-600 transition-colors">Thiết kế ưu đãi mới</h4>
                  <p className="text-xs text-zinc-500 font-medium">Gọi API POST để tạo xuống MongoDB</p>
               </div>
            </div>

         </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center fade-in text-zinc-900">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl mx-4">
            <h3 className="font-headline font-extrabold text-2xl mb-6">Tạo Danh Mục Mã Mới</h3>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleCreate(); }}>
               <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Mã Khuyến Mãi *</label>
                  <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} type="text" className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-amber-400 bg-zinc-50 font-bold font-headline uppercase" placeholder="VD: SUMMER_SALE" />
               </div>
               <div className="flex gap-4">
                   <div className="flex-1">
                      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Loại (%) giảm</label>
                      <input required value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: e.target.value})} type="number" max="100" min="1" className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-amber-400 bg-zinc-50" placeholder="20" />
                   </div>
                   <div className="flex-1">
                      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Ngày hết hạn (Tuỳ chọn)</label>
                      <input value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} type="date" className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-amber-400 bg-zinc-50" />
                   </div>
               </div>
               <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors">Hủy</button>
                  <button type="submit" className="px-6 py-3 font-bold bg-amber-400 text-zinc-900 rounded-xl hover:bg-amber-500 transition-colors">Lưu DB</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vouchers;
