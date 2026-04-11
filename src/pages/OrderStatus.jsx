import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const OrderStatus = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(res.data);
      } catch (err) {
        console.error("Lỗi lấy đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-32 bg-zinc-50 flex items-center justify-center">
            <div className="flex flex-col items-center">
               <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
               <p className="mt-4 font-bold text-zinc-500 tracking-widest text-xs uppercase animate-pulse">Đang định vị tài xế...</p>
            </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-32 bg-zinc-50 flex items-center justify-center">
           <div className="text-center">
             <span className="material-symbols-outlined text-6xl text-zinc-300 mb-4 block">search_off</span>
             <h2 className="text-xl font-bold text-zinc-800">Không tìm thấy đơn hàng</h2>
             <Link to="/" className="text-amber-600 mt-4 inline-block font-bold">Về trang chủ</Link>
           </div>
        </div>
      </>
    );
  }

  // Determine active step based on status
  // Status enum: ['Pending', 'Processing', 'Delivered', 'Cancelled']
  let currentStep = 0;
  if (order.status === 'Processing') currentStep = 1;
  if (order.status === 'Delivered') currentStep = 2;

  const isCancelled = order.status === 'Cancelled';

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-body">
      <Navbar />
      
      {/* Container - Mobile App Style Width */}
      <div className="pt-24 pb-20 w-full max-w-md mx-auto h-full flex flex-col bg-white shadow-2xl relative">
          
        {/* Fake Map Banner header */}
        <div className="h-44 bg-zinc-200 relative overflow-hidden shrink-0">
           {/* Static Map Background Image */}
           <img 
               src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800" 
               alt="Tracing Map" 
               className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply"
           />
           {/* Overlay Gradient */}
           <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-32">
            
            {/* Status Header */}
            <div className="text-center mb-8">
               <h1 className="font-headline text-3xl font-black text-zinc-900">
                   {isCancelled ? 'Đơn Đã Hủy' : 
                    order.status === 'Pending' ? 'Đang xác nhận' :
                    order.status === 'Processing' ? 'Tài xế đang tới' : 'Giao thành công'}
               </h1>
               <p className="text-xs text-zinc-500 font-bold mt-2 uppercase tracking-widest">
                   Mã đơn: <span className="text-amber-600">{order._id.substring(order._id.length - 8).toUpperCase()}</span>
               </p>
            </div>

            {/* Timeline */}
            {!isCancelled ? (
                <div className="mb-10 px-2">
                    {/* Step 1: Pending */}
                    <div className="flex gap-4 relative pb-8">
                        <div className="w-px h-full bg-zinc-200 absolute left-[15px] top-8"></div>
                        <div className={`w-8 h-8 rounded-full flex gap-4 items-center justify-center shrink-0 z-10 transition-colors duration-500 ${currentStep >= 0 ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/30' : 'bg-zinc-200 text-zinc-400'}`}>
                            <span className="material-symbols-outlined text-[16px] font-black">receipt_long</span>
                        </div>
                        <div>
                            <h3 className={`font-black uppercase tracking-widest text-sm ${currentStep >= 0 ? 'text-zinc-900' : 'text-zinc-400'}`}>Chờ xác nhận</h3>
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed mt-1">Cửa hàng đang kiểm tra đơn của bạn.</p>
                        </div>
                    </div>

                    {/* Step 2: Processing */}
                    <div className="flex gap-4 relative pb-8">
                        <div className="w-px h-full bg-zinc-200 absolute left-[15px] top-8"></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-500 ${currentStep >= 1 ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/30' : 'bg-zinc-200 text-zinc-400'}`}>
                            <span className="material-symbols-outlined text-[16px] font-black">local_cafe</span>
                        </div>
                        <div>
                            <h3 className={`font-black uppercase tracking-widest text-sm ${currentStep >= 1 ? 'text-zinc-900' : 'text-zinc-400'}`}>Đang chuẩn bị</h3>
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed mt-1">Tài xế đang đợi lấy món tại quán.</p>
                        </div>
                    </div>

                    {/* Step 3: Delivered */}
                    <div className="flex gap-4 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-500 ${currentStep >= 2 ? 'bg-green-500 text-white shadow-xl shadow-green-500/30' : 'bg-zinc-200 text-zinc-400'}`}>
                            <span className="material-symbols-outlined text-[16px] font-black">check_circle</span>
                        </div>
                        <div>
                            <h3 className={`font-black uppercase tracking-widest text-sm ${currentStep >= 2 ? 'text-green-600' : 'text-zinc-400'}`}>Giao thành công</h3>
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed mt-1">Cảm ơn bạn đã thưởng thức Citrus Stream!</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-10 p-6 bg-red-50 rounded-2xl border border-red-100 flex gap-4 items-center">
                    <span className="material-symbols-outlined text-4xl text-red-500">cancel</span>
                    <div>
                        <h3 className="font-black text-red-600 uppercase tracking-widest text-sm">Đơn bị huỷ</h3>
                        <p className="text-xs text-red-400 mt-1">Vui lòng liên hệ bộ phận hỗ trợ nếu cần thiết.</p>
                    </div>
                </div>
            )}

            <hr className="border-zinc-100 my-6 border-dashed" />

            {/* Order Items */}
            <div className="mb-8">
               <h3 className="font-bold text-zinc-900 uppercase tracking-widest text-xs mb-4">Chi tiết món</h3>
               <div className="space-y-4">
                  {order.products.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                          <img src={item.product?.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100&q=80'} alt="Item" className="w-14 h-14 rounded-xl object-cover shrink-0 bg-zinc-100" />
                          <div className="flex-1">
                              <p className="font-bold text-zinc-900 text-sm line-clamp-1">{item.product?.title || 'Sản phẩm không rõ'}</p>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                                Size: {item.size?.replace(/^size\s+/i, '') || 'Standard'}
                                {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                   <span> • {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}</span>
                                )}
                              </p>
                          </div>
                          <div className="text-right shrink-0">
                              <p className="font-black text-zinc-900">{formatCurrency(item.price)}</p>
                              <p className="text-xs text-zinc-400 font-bold">x {item.quantity}</p>
                          </div>
                      </div>
                  ))}
               </div>
            </div>

            {/* Address */}
            <div className="mb-8 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
               <h3 className="font-bold text-amber-900 uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                   <span className="material-symbols-outlined text-[16px]">location_on</span> Giao đến
               </h3>
               <p className="text-sm text-zinc-700 font-medium leading-relaxed pl-6">{order.shippingAddress}</p>
            </div>

        </div>

        {/* Fixed Bottom Total / Action */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-zinc-100 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
             <div className="flex justify-between items-end mb-4">
                 <p className="font-bold text-zinc-500 uppercase tracking-widest text-[10px]">Tổng cộng</p>
                 <p className="font-headline font-black text-2xl text-amber-500">{formatCurrency(order.totalPrice)}</p>
             </div>
             <Link to="/" className="w-full py-4 bg-zinc-950 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-center block">
                 Về trang chủ
             </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderStatus;
