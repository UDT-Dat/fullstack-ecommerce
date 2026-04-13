import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const { showToast } = useToast();
  const [cancelConfirm, setCancelConfirm] = useState({ show: false, id: null });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchOrders = async () => {
     try {
       const res = await axios.get(import.meta.env.VITE_API_URL + '/api/orders');
       setOrders(res.data);
       return res.data;
     } catch (err) {
       console.error(err);
     }
  };

  useEffect(() => {
     fetchOrders().then((data) => {
       const params = new URLSearchParams(location.search);
       const targetId = params.get('orderId');
       if (targetId && data) {
         const targetOrder = data.find(o => o._id === targetId);
         if (targetOrder) {
           openOrderDetail(targetOrder);
           // Clear the URL param to prevent reopening on reload
           navigate('/admin/orders', { replace: true });
         }
       }
     });
  }, [location.search, navigate]);

  const openOrderDetail = async (order) => {
    setSelectedOrder(order);
    if (order.isReadAdmin === false) {
      try {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/orders/${order._id}/read`);
        setOrders(prev => prev.map(o => o._id === order._id ? { ...o, isReadAdmin: true } : o));
      } catch (err) {
        console.error("Lỗi đánh dấu order", err);
      }
    }
  };

  const updateStatus = async (id, status) => {
     try {
       await axios.put(`${import.meta.env.VITE_API_URL}/api/orders/${id}/status`, { status });
       fetchOrders();
       showToast(`Đã đổi trạng thái thành ${status}`, 'success');
     } catch (err) {
       console.error("Error updating status", err);
       showToast("Đổi trạng thái lỗi", "error");
     }
  };

  const handleStatusChange = (id, newStatus) => {
    if (newStatus === 'Cancelled') {
      setCancelConfirm({ show: true, id });
    } else {
      updateStatus(id, newStatus);
    }
  };

  const confirmCancel = async () => {
     if (cancelConfirm.id) {
        await updateStatus(cancelConfirm.id, 'Cancelled');
        setCancelConfirm({ show: false, id: null });
     }
  };

  const getStatusDisplay = (st) => {
     switch(st) {
        case 'Delivered': return { label: 'Hoàn tất', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' };
        case 'Processing': return { label: 'Đang làm', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' };
        case 'Cancelled': return { label: 'Đã hủy', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' };
        case 'Pending': default: return { label: 'Chờ duyệt', bg: 'bg-amber-50', text: 'text-amber-800', dot: 'bg-amber-500', border: 'border-amber-200' };
     }
  };

  return (
    <div className="fade-in space-y-8 relative">
      <ConfirmModal 
         isOpen={cancelConfirm.show} 
         onClose={() => setCancelConfirm({show: false, id: null})} 
         onConfirm={confirmCancel} 
         title="Hủy Đơn Hàng?" 
         description="Đơn hàng này sẽ bị đánh dấu hủy và không thể khôi phục trạng thái. Bạn chắc chứ?" 
      />

      {/* Order Detail Modal */}
      {selectedOrder && (
         <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
            <div className="relative w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto flex flex-col fade-in">
               <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
                  <div>
                    <h2 className="font-headline font-black text-2xl text-zinc-900 leading-none">Hóa Đơn</h2>
                    <p className="text-zinc-500 text-xs mt-1">Mã: #{selectedOrder._id.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-3 bg-zinc-100 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-full transition-colors flex items-center justify-center pointer max-w-max shrink-0">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
               </div>
               
               <div className="p-8 flex-1 space-y-8">
                  <div className="flex justify-between items-center p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-zinc-100">
                           <span className="material-symbols-outlined text-zinc-400">person</span>
                        </div>
                        <div>
                           <p className="font-bold text-sm text-zinc-900">{selectedOrder.user?.name || 'Guest User'}</p>
                           <p className="text-xs text-zinc-500">{selectedOrder.user?.phone || 'No phone'}</p>
                        </div>
                     </div>
                  </div>

                  <div>
                     <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-2 mb-4">Địa Chỉ Giao</h3>
                     <p className="text-sm font-medium text-zinc-900">{selectedOrder.shippingAddress}</p>
                  </div>

                  <div>
                     <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-2 mb-4">Chi Tiết SP ({selectedOrder.products?.length || 0})</h3>
                     <div className="space-y-4">
                        {selectedOrder.products?.map((item, idx) => (
                           <div key={idx} className="flex gap-4 items-center">
                              <img src={item.product?.image || '/images/placeholder.png'} alt={item.product?.title} className="w-16 h-16 rounded-xl object-cover border border-zinc-100" />
                              <div className="flex-1">
                                 <h4 className="font-bold text-sm text-zinc-900">{item.product?.title || 'Sản phẩm không rõ'}</h4>
                                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                                    Size: {item.size?.replace(/^size\s+/i, '') || 'Standard'} • x{item.quantity}
                                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                       <span> • {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}</span>
                                    )}
                                 </p>
                              </div>
                              <p className="font-bold text-sm text-zinc-900">{(item.price * item.quantity).toLocaleString()}đ</p>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="border-t border-zinc-100 pt-6 space-y-3">
                     {selectedOrder.discountCode && (
                        <div className="flex justify-between text-xs font-bold text-amber-500">
                           <span>Mã VOUCHER Đã Dùng:</span>
                           <span>{selectedOrder.discountCode}</span>
                        </div>
                     )}
                     <div className="flex justify-between text-2xl font-black text-zinc-900">
                        <span>Tổng Báo Cáo</span>
                        <span>{selectedOrder.totalPrice.toLocaleString()}đ</span>
                     </div>
                  </div>
               </div>

               <div className="p-6 border-t border-zinc-100 bg-zinc-50 sticky bottom-0 z-10">
                  <select value={selectedOrder.status} onChange={(e) => { handleStatusChange(selectedOrder._id, e.target.value); setSelectedOrder({...selectedOrder, status: e.target.value}); }} className="w-full bg-zinc-900 text-white font-bold p-4 rounded-xl text-center outline-none cursor-pointer text-sm">
                     <option value="Pending">Trạng thái: CHỜ DUYỆT</option>
                     <option value="Processing">Trạng thái: ĐANG CHUẨN BỊ</option>
                     <option value="Delivered">Trạng thái: ĐÃ GIAO HÀNG</option>
                     <option value="Cancelled">Trạng thái: HỦY ĐƠN NÀY</option>
                  </select>
               </div>
            </div>
         </div>
      )}
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-extrabold text-zinc-900 tracking-tight mb-2">
            Hàng chờ <span className="text-zinc-900">Đơn hàng</span>
          </h1>
          <p className="text-zinc-500 text-sm max-w-xl leading-relaxed">Quản lý phân phối đồ uống cao cấp và theo dõi đội xe theo thời gian thực.</p>
        </div>
        <div className="flex gap-3 text-sm font-bold">
          <button className="bg-white border border-zinc-200 text-zinc-900 px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-zinc-50 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Bộ lọc
          </button>
          <button className="bg-zinc-900 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-sm hover:bg-zinc-800 transition-colors">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Xuất Manifest
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
             <div className="p-2 bg-amber-100 rounded-lg text-amber-700 flex justify-center items-center">
               <span className="material-symbols-outlined text-[20px]">sync</span>
             </div>
             <span className="bg-amber-400 text-zinc-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">Live DB</span>
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 mb-1">Đơn đang xử lý</p>
            <h3 className="text-4xl font-headline font-black text-zinc-900">{orders.filter(o => o.status === 'Processing' || o.status === 'Pending').length}</h3>
          </div>
        </div>

        <div className="bg-amber-400 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden md:col-start-3">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 rounded-bl-full opacity-50"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
             <div className="p-2 bg-white/30 rounded-lg text-amber-900 flex justify-center items-center backdrop-blur-sm">
               <span className="material-symbols-outlined text-[20px]">check_circle</span>
             </div>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-amber-900 mb-1">Đã giao thành công</p>
            <h3 className="text-4xl font-headline font-black text-zinc-900">{orders.filter(o => o.status === 'Delivered').length}</h3>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 mt-2 overflow-x-auto">
           <div className="flex gap-8 text-sm font-bold border-b-2 border-transparent w-max">
             <button className="py-4 border-b-2 border-zinc-900 text-zinc-900">Tất cả đơn hàng</button>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Mã Đơn Hàng</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Khách Hàng</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Ngày Tạo</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Tổng Cộng</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Trạng Thái</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {orders.length === 0 ? (
                 <tr>
                    <td colSpan="6" className="py-8 text-center text-zinc-500 text-sm">Chưa có đơn hàng nào trong DB</td>
                 </tr>
              ) : orders.map((order) => {
                const ui = getStatusDisplay(order.status);

                return (
                <tr key={order._id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="py-5 px-6 font-bold text-sm text-zinc-900 text-xs">#{order._id.substring(0, 8).toUpperCase()}</td>
                  <td className="py-5 px-6 flex items-center gap-3">
                    <div className="w-9 h-9 border border-zinc-200 rounded-full flex items-center justify-center text-xs font-bold bg-zinc-100 shrink-0">
                       <span className="material-symbols-outlined text-[16px]">person</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 leading-none mb-1 line-clamp-1">{order.user?.name || 'Guest'}</h4>
                      <p className="text-[10px] text-zinc-500 line-clamp-1">{order.shippingAddress}</p>
                    </div>
                  </td>
                  <td className="py-5 px-6 whitespace-nowrap">
                    <p className="text-sm font-medium text-zinc-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-[10px] font-medium text-zinc-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="py-5 px-6 font-bold text-sm text-amber-600">{order.totalPrice.toLocaleString()}đ</td>
                  <td className="py-5 px-6">
                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center w-max gap-1.5 shadow-sm border ${ui.bg} ${ui.text} ${ui.border}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${ui.dot}`}></div> {ui.label}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 relative">
                      <select 
                         value={order.status} 
                         onChange={(e) => handleStatusChange(order._id, e.target.value)} 
                         className="bg-transparent border border-zinc-200 text-zinc-900 text-xs font-bold p-2 text-center rounded-lg outline-none cursor-pointer focus:border-amber-400"
                      >
                         <option value="Pending">Chờ duyệt</option>
                         <option value="Processing">Đang pha</option>
                         <option value="Delivered">Đã giao</option>
                         <option value="Cancelled">Hủy</option>
                      </select>
                      <div className="relative">
                        <button onClick={() => openOrderDetail(order)} className="p-2 border border-zinc-200 text-zinc-900 rounded-lg bg-white hover:bg-amber-400 transition-colors shadow-sm flex items-center justify-center relative">
                           <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                        {order.isReadAdmin === false && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm shadow-red-500/50"></span>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        <div className="border-t border-zinc-100 p-4 bg-zinc-50/50 text-center text-xs text-zinc-500">
          MongoDB Orders Live View
        </div>
      </div>
    </div>
  );
};

export default Orders;
