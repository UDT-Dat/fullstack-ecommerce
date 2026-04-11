import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart, updateQuantity, removeFromCart } = useContext(CartContext);
  const cartTotal = getCartTotal();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', address: '', paymentMethod: 'card' });
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [membership, setMembership] = useState(null);

  useEffect(() => {
     const token = localStorage.getItem('token');
     if (token) {
         axios.get('http://localhost:5000/api/users/membership', {
             headers: { Authorization: `Bearer ${token}` }
         }).then(res => setMembership(res.data)).catch(err => console.error(err));

         axios.get('http://localhost:5000/api/users/profile', {
             headers: { Authorization: `Bearer ${token}` }
         }).then(res => {
             const user = res.data;
             let fullAddress = user.address || '';
             if (user.ward) fullAddress += (fullAddress ? ', ' : '') + user.ward;
             if (user.district) fullAddress += (fullAddress ? ', ' : '') + user.district;
             if (user.province) fullAddress += (fullAddress ? ', ' : '') + user.province;

             setFormData(prev => ({
                 ...prev,
                 fullName: user.name || prev.fullName,
                 phone: user.phone || prev.phone,
                 email: user.email || prev.email,
                 address: fullAddress || prev.address
             }));
         }).catch(err => console.error(err));
     }
  }, []);

  const shippingFee = 15000;
  
  const getMembershipProgress = () => {
    if (!membership || !membership.isMember) return null;
    const count = membership.ordersCount || 0;
    const TIER_BASES = { 'Chưa tham gia': 0, 'Mới': 0, 'Đồng': 10, 'Vàng': 20, 'Kim Cương': 30 };
    const effectiveTier = membership.tier || 'Mới';
    const baseOrders = TIER_BASES[effectiveTier] || 0;
    const visualOrders = Math.max(count, baseOrders);

    if (visualOrders >= 30) return { next: 'Kim Cương', remaining: 0, gapBase: 30, maxed: true };
    if (visualOrders >= 20) return { next: 'Kim Cương', remaining: 30 - count, gapBase: 20, maxed: false };
    if (visualOrders >= 10) return { next: 'Vàng', remaining: 20 - count, gapBase: 10, maxed: false };
    return { next: 'Đồng', remaining: 10 - count, gapBase: 0, maxed: false };
  };

  // Stacking logic: Base total -> Membership discount -> Voucher discount
  const memDiscountAmt = (membership?.isMember && membership?.discountPercentage) ? (cartTotal * (membership.discountPercentage / 100)) : 0;
  const afterMemTotal = cartTotal - memDiscountAmt;
  
  const discountAmount = appliedVoucher ? (afterMemTotal * (appliedVoucher.percentage / 100)) : 0;
  
  const finalTotal = cartTotal > 0 ? (afterMemTotal - discountAmount + shippingFee) : 0;

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    try {
      const res = await axios.post('http://localhost:5000/api/discounts/validate', { code: voucherCode });
      setAppliedVoucher({ percentage: res.data.discountPercentage, code: res.data.code });
      showToast(res.data.message, "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi áp dụng mã", "error");
      setAppliedVoucher(null);
    }
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      showToast('Giỏ hàng trống. Vui lòng chọn sản phẩm trước khi thanh toán.', 'error');
      return navigate('/menu');
    }
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        products: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
          size: item.size || 'Standard',
          selectedOptions: item.selectedOptions || {},
        })),
        totalPrice: finalTotal,
        shippingAddress: formData.address,
        discountCode: appliedVoucher ? appliedVoucher.code : null
      };

      if (token) {
         const res = await axios.post('http://localhost:5000/api/orders', payload, {
           headers: { Authorization: `Bearer ${token}` }
         });
         clearCart();
         showToast('Thanh toán thành công! Đơn hàng đang được xử lý.', 'success');
         navigate(`/order-status/${res.data._id}`);
      } else {
         showToast('Bạn chưa đăng nhập.', 'error');
         navigate('/auth');
      }
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
         showToast('Quyền bị từ chối. Vui lòng đăng nhập lại.', 'error');
         navigate('/auth');
      } else {
         showToast(err.response?.data?.message || 'Có lỗi xảy ra khi đặt mặt hàng này!', 'error');
      }
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
        <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
          <span className="hover:text-zinc-900 cursor-pointer transition-colors" onClick={() => navigate('/')}>Trang chủ</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-zinc-900 font-semibold">Thanh toán</span>
        </nav>
        
        <header className="mb-12">
          <h1 className="font-headline text-5xl font-black tracking-tight text-zinc-900 mb-4 uppercase drop-shadow-sm">Xác nhận thanh toán</h1>
          <p className="text-zinc-500 text-lg">Hoàn tất các thông tin dưới đây để nhận ngay những thức uống tươi mát.</p>
        </header>

        <form onSubmit={handleOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-12">
            <section>
              <div className="flex items-center gap-4 mb-8">
                <span className="w-10 h-10 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30">1</span>
                <h2 className="font-headline text-2xl font-black uppercase tracking-tight text-zinc-900">Thông tin nhận hàng</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-zinc-50 rounded-2xl border border-zinc-200">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-zinc-500">Họ và tên <span className="text-red-500">*</span></label>
                  <input required value={formData.fullName} className="w-full bg-white border border-zinc-200 rounded-lg p-4 transition-all focus:border-amber-500 outline-none focus:ring-1 focus:ring-amber-500 font-bold text-zinc-900" placeholder="Thanh Tùng" type="text" onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-zinc-500">Số điện thoại <span className="text-red-500">*</span></label>
                  <input required value={formData.phone} className="w-full bg-white border border-zinc-200 rounded-lg p-4 transition-all focus:border-amber-500 outline-none focus:ring-1 focus:ring-amber-500 font-bold text-zinc-900" placeholder="090..." type="tel" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-zinc-500">Email (Tùy chọn)</label>
                  <input value={formData.email} className="w-full bg-white border border-zinc-200 rounded-lg p-4 transition-all focus:border-amber-500 outline-none focus:ring-1 focus:ring-amber-500 font-bold text-zinc-900" placeholder="example@gmail.com" type="email" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-zinc-500">Địa chỉ chi tiết <span className="text-red-500">*</span></label>
                  <textarea required value={formData.address} className="w-full bg-white border border-zinc-200 rounded-lg p-4 transition-all focus:border-amber-500 outline-none focus:ring-1 focus:ring-amber-500 font-bold text-zinc-900" placeholder="Số nhà, tên đường, phường/xã..." rows="3" onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-8">
                <span className="w-10 h-10 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30">2</span>
                <h2 className="font-headline text-2xl font-black uppercase tracking-tight text-zinc-900">Thanh toán</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="relative cursor-pointer group">
                  <input type="radio" name="payment" value="card" className="peer sr-only" defaultChecked onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} />
                  <div className="p-6 bg-white border border-zinc-200 rounded-2xl peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:shadow-lg transition-all h-full">
                    <span className="material-symbols-outlined text-4xl mb-4 block text-zinc-900">credit_card</span>
                    <h3 className="font-black text-sm uppercase tracking-widest mb-1 text-zinc-900">Thẻ Visa/Master</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Thanh toán bảo mật</p>
                  </div>
                </label>
                <label className="relative cursor-pointer group">
                  <input type="radio" name="payment" value="cod" className="peer sr-only" onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} />
                  <div className="p-6 bg-white border border-zinc-200 rounded-2xl peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:shadow-lg transition-all h-full">
                    <span className="material-symbols-outlined text-4xl mb-4 block text-zinc-900">payments</span>
                    <h3 className="font-black text-sm uppercase tracking-widest mb-1 text-zinc-900">Ship COD</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Giao tại nhà</p>
                  </div>
                </label>
                <label className="relative cursor-pointer group">
                  <input type="radio" name="payment" value="momo" className="peer sr-only" onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} />
                  <div className="p-6 bg-white border border-zinc-200 rounded-2xl peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:shadow-lg transition-all h-full">
                    <div className="w-10 h-10 bg-[#A50064] rounded-lg mb-4 flex items-center justify-center font-black text-white text-[10px]">MoMo</div>
                    <h3 className="font-black text-sm uppercase tracking-widest mb-1 text-zinc-900">Ví MoMo</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Quét mã tiện lợi</p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Right Column: Checkout Summary */}
          <aside className="lg:col-span-5 sticky top-32">
            <div className="bg-zinc-900 text-white rounded-[2rem] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 rounded-bl-full opacity-10"></div>
              <h3 className="font-headline text-2xl font-extrabold mb-10 flex items-center gap-3">
                Thông tin giỏ hàng
                <span className="text-amber-500 text-sm font-bold bg-white/10 px-3 py-1 rounded-full">{cartItems.length} sản phẩm</span>
              </h3>
              
              <div className="space-y-8 mb-10">
                {cartItems.length === 0 ? (
                  <p className="text-zinc-500">Giỏ hàng của bạn đang trống.</p>
                ) : (
                  cartItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center group">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 shrink-0">
                        <img className="w-full h-full object-cover" src={item.image} alt={item.title} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{item.title}</h4>
                        {item.size && item.size !== 'Standard' && item.size !== 'N/A' && (
                          <p className="text-[10px] text-amber-500 font-bold tracking-widest uppercase mb-1">Size: {item.size.replace(/^size\s+/i, '')}</p>
                        )}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <p className="text-[9px] text-white/60 font-bold tracking-widest uppercase mb-1">
                            {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <button type="button" onClick={() => updateQuantity(item.cartId, -1)} className="text-white/50 hover:text-white">-</button>
                          <p className="text-xs text-white/50">SL: {item.quantity}</p>
                          <button type="button" onClick={() => updateQuantity(item.cartId, 1)} className="text-white/50 hover:text-white">+</button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-500">{(item.price * item.quantity).toLocaleString()}đ</p>
                        <button type="button" onClick={() => removeFromCart(item.cartId)} className="text-[10px] text-red-500 hover:underline mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Xóa</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mb-10 p-1 bg-white/10 rounded-xl flex gap-1">
                <input value={voucherCode} onChange={e => setVoucherCode(e.target.value.toUpperCase())} className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 text-white placeholder:text-white/30 outline-none uppercase font-bold tracking-widest" placeholder="MÁ KHUYẾN MÃI" type="text"/>
                <button type="button" onClick={handleApplyVoucher} className="px-6 py-3 bg-amber-500 text-zinc-900 rounded-lg font-bold text-xs uppercase tracking-tighter hover:bg-white transition-all shadow-sm">Áp dụng</button>
              </div>

              <div className="space-y-4 pt-8 border-t border-white/10 mb-10">
                <div className="flex justify-between text-white/70 text-sm">
                  <span>Tạm tính</span>
                  <span>{cartTotal.toLocaleString()}đ</span>
                </div>
                
                {membership?.isMember && membership?.discountPercentage > 0 && (
                   <div className="flex justify-between text-amber-500 font-bold text-sm">
                     <span>Chiết khấu Hội Viên ({membership.tier} -{membership.discountPercentage}%)</span>
                     <span>-{memDiscountAmt.toLocaleString()}đ</span>
                   </div>
                )}
                
                {appliedVoucher && (
                    <div className="flex justify-between text-green-400 font-bold text-sm">
                      <span>Mã giảm giá ({appliedVoucher.code}) 👇 -{appliedVoucher.percentage}%</span>
                      <span>-{discountAmount.toLocaleString()}đ</span>
                    </div>
                )}

                <div className="flex justify-between text-white/70 text-sm border-t border-white/10 pt-4">
                  <span>Phí vận chuyển</span>
                  <span>{shippingFee.toLocaleString()}đ</span>
                </div>

                <div className="flex justify-between text-3xl font-black pt-2">
                  <span>Tổng</span>
                  <span className="text-amber-500">{finalTotal.toLocaleString()}đ</span>
                </div>
              </div>
              
              {membership?.isMember && (() => {
                const prog = getMembershipProgress();
                if (prog && !prog.maxed) {
                   const count = membership.ordersCount || 0;
                   const percent = (Math.max(count - prog.gapBase, 0) / 10) * 100;
                   return (
                      <div className="mb-6 p-5 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex flex-col gap-3 group hover:bg-amber-500/20 transition-colors">
                         <div className="flex items-center justify-between">
                            <p className="text-xs text-amber-500 font-black uppercase tracking-widest flex items-center gap-2">
                               <span className="material-symbols-outlined text-[18px]">military_tech</span> Sắp thăng hạng!
                            </p>
                            <span className="text-xs font-bold text-zinc-400">{membership.ordersCount} / {membership.ordersCount + prog.remaining}</span>
                         </div>
                         <p className="text-sm text-zinc-300">Hoàn thành <span className="text-white font-bold">{prog.remaining} đơn hàng</span> nữa để đạt hạng <span className="text-amber-500 font-bold uppercase">{prog.next}</span>.</p>
                         <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden mt-1 shadow-inner">
                            <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                         </div>
                      </div>
                   );
                }
                return null;
              })()}

              <button type="submit" className="w-full bg-amber-500 text-zinc-950 py-6 rounded-2xl font-headline font-black text-xl uppercase tracking-[0.2em] hover:bg-white transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                  ĐẶT HÀNG
                  <span className="material-symbols-outlined font-black">arrow_forward</span>
              </button>
              
              <div className="mt-8 flex items-center justify-center gap-2 text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                <span className="material-symbols-outlined text-sm text-green-500">verified_user</span>
                Bảo mật thanh toán chuẩn quốc tế
              </div>
            </div>
          </aside>
        </form>
      </main>
      <Footer />
    </>
  );
};

export default Checkout;
