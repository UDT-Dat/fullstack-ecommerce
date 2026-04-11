import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const Customers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', username: '', phone: '', email: '', password: 'password123' });
  const { showToast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const fetchUsers = async () => {
      try {
          const res = await axios.get('http://localhost:5000/api/auth');
          setUsers(res.data);
      } catch (err) {
          console.error(err);
      }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
      try {
          await axios.post('http://localhost:5000/api/auth/register', formData);
          setIsModalOpen(false);
          setFormData({ name: '', username: '', phone: '', email: '', password: 'password123' });
          fetchUsers();
          showToast("Đã tạo mới khách hàng/hội viên thành công", "success");
      } catch (err) {
          console.error(err);
          showToast(err.response?.data?.message || 'Lỗi tạo user', "error");
      }
  };

  const confirmDelete = async () => {
      if(deleteConfirm.id) {
          try {
              await axios.delete(`http://localhost:5000/api/auth/${deleteConfirm.id}`);
              fetchUsers();
              showToast("Đã xóa vĩnh viễn khách hàng này", "success");
          } catch(err) { 
              console.error(err); 
              showToast("Lỗi khi phục hồi", "error");
          } finally {
              setDeleteConfirm({ show: false, id: null });
          }
      }
  }

  return (
    <div className="fade-in space-y-10 relative">
      <ConfirmModal 
         isOpen={deleteConfirm.show} 
         onClose={() => setDeleteConfirm({show: false, id: null})} 
         onConfirm={confirmDelete} 
         title="Xóa tài khoản này?" 
         description="Tài khoản sẽ bị gỡ bỏ khỏi hệ thống. Hành động này không thể hoàn tác." 
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-zinc-200 pb-8 relative">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Quan hệ khách hàng</p>
          <h1 className="text-4xl font-headline font-extrabold text-zinc-900 tracking-tight leading-tight">
            Hệ thống Users <br/>
            Mạng lưới <span className="text-amber-400 italic font-black">Vitality</span>
          </h1>
        </div>
        
        <div className="bg-white border border-zinc-200 p-4 rounded-2xl flex items-center gap-4 shadow-sm w-max md:absolute right-0 top-0">
           <div className="w-12 h-12 bg-amber-400 rounded-full flex justify-center items-center text-zinc-900">
               <span className="material-symbols-outlined">trending_up</span>
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">Thành viên đăng ký</p>
              <p className="text-2xl font-headline font-black text-zinc-900 leading-none">{users.length}</p>
           </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="flex items-center gap-2 p-1.5 bg-zinc-100 rounded-2xl w-max">
            <button className="px-6 py-2.5 bg-white text-zinc-900 font-bold rounded-xl shadow-sm text-sm">Tất cả thành viên</button>
            <button className="px-6 py-2.5 text-zinc-500 hover:text-zinc-900 font-bold rounded-xl text-sm transition-colors">Quản trị viên ({users.filter(u => u.role === 'admin').length})</button>
         </div>
         <div className="flex gap-3">
            <button className="bg-white border border-zinc-200 text-zinc-900 px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-sm hover:bg-zinc-50 transition-colors text-sm">
               <span className="material-symbols-outlined text-[20px]">filter_list</span>
               Bộ lọc
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-zinc-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-md hover:bg-amber-400 hover:text-zinc-900 transition-colors text-sm">
               <span className="material-symbols-outlined text-[20px]">person_add</span>
               Thêm hội viên
            </button>
         </div>
      </div>

      {/* Customer List */}
      <div className="space-y-4">
         {users.length === 0 ? <p className="text-sm text-zinc-500 p-4 border rounded-xl">Chưa có người dùng nào được tạo trong DB.</p> :
          users.map((user) => (
             <div key={user._id} className="bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:border-amber-300 transition-colors group relative">
                
                {/* Profile Block */}
                <div className="flex items-center gap-5 md:w-1/3">
                   <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-zinc-100 shadow-sm flex items-center justify-center bg-zinc-50 text-xl font-bold uppercase text-zinc-900">
                         {user.name?.charAt(0) || 'U'}
                      </div>
                      {user.role === 'admin' && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                             <span className="text-[10px] font-black text-zinc-900">V</span>
                          </div>
                      )}
                   </div>
                   <div>
                      <h4 className="font-headline font-bold text-lg text-zinc-900 mb-1">{user.name || 'No Name'}</h4>
                      <p className="text-xs text-zinc-500">@{user.username}</p>
                   </div>
                </div>

                {/* Contact Block */}
                <div className="md:w-1/4">
                   <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Liên hệ</p>
                   <p className="text-sm font-bold text-zinc-800">{user.phone || 'Chưa cung cấp'}</p>
                </div>

                {/* Orders Block */}
                <div className="md:w-1/4">
                   <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Vai trò</p>
                   <div className="flex items-center gap-3">
                      <p className="text-sm font-headline font-black uppercase text-zinc-900">{user.role}</p>
                   </div>
                </div>

                {/* Actions Block */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                   <button onClick={() => setDeleteConfirm({show: true, id: user._id})} className="w-12 h-12 flex justify-center items-center rounded-2xl bg-zinc-50 text-zinc-300 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors border border-transparent">
                       <span className="material-symbols-outlined">delete</span>
                   </button>
                   <button className="px-6 py-3 bg-zinc-100 text-zinc-900 font-bold rounded-2xl hover:bg-zinc-900 hover:text-white transition-colors text-sm">
                       Chi tiết Live
                   </button>
                </div>
             </div>
         ))}
      </div>

      <div className="text-center mt-12 text-xs font-bold uppercase tracking-widest text-zinc-300">
         Data Live Sync from MongoDB
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center fade-in text-zinc-900">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl mx-4">
            <h3 className="font-headline font-extrabold text-2xl mb-6">Thêm Khách Hàng / User API</h3>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleCreate(); }}>
               <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Họ & Tên</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-amber-400 bg-zinc-50" placeholder="Nguyễn Văn A" />
               </div>
               <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Tên Đăng Nhập (Username)</label>
                  <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} type="text" className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-amber-400 bg-zinc-50" placeholder="nguyenA" />
               </div>
               <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Số Điện Thoại</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-amber-400 bg-zinc-50" placeholder="0912..." />
               </div>
               <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors">Hủy</button>
                  <button type="submit" className="px-6 py-3 font-bold bg-amber-400 text-zinc-900 rounded-xl hover:bg-amber-500 transition-colors">Lưu User</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
