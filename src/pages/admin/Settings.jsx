import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const Settings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: 'Admin', username: '', password: '', role: 'admin' });
  const { showToast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/auth');
      setUsers(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
     try {
       await axios.post(import.meta.env.VITE_API_URL + '/api/auth/register', formData);
       setIsModalOpen(false);
       setFormData({ name: 'Admin', username: '', password: '', role: 'admin' });
       fetchUsers();
       showToast("Đã cấp quyền đăng nhập cho tài khoản mới!", "success");
     } catch (err) {
       console.error(err);
       showToast(err.response?.data?.message || 'Lỗi phân quyền admin', "error");
     }
  };

  const confirmDelete = async () => {
     if(deleteConfirm.id) {
        try {
           await axios.delete(`${import.meta.env.VITE_API_URL}/api/auth/${deleteConfirm.id}`);
           fetchUsers();
           showToast("Đã khóa quyền quản trị của tài khoản này", "success");
        } catch(err) { 
           console.error(err); 
           showToast("Phát sinh lỗi", "error");
        } finally {
           setDeleteConfirm({ show: false, id: null });
        }
     }
  };

  const staffUsers = users.filter(u => u.role === 'admin' || u.role === 'staff');

  return (
    <div className="fade-in max-w-7xl mx-auto space-y-10 relative">
      <ConfirmModal 
         isOpen={deleteConfirm.show} 
         onClose={() => setDeleteConfirm({show: false, id: null})} 
         onConfirm={confirmDelete} 
         title="Hủy quyền nội bộ?" 
         description="Tài khoản này sẽ mất toàn bộ quyền truy cập vào Data và bảng điều khiển." 
      />

      <header className="mb-8">
        <h2 className="font-headline font-extrabold text-4xl text-zinc-900 tracking-tight mb-2">Điều Khiển Hệ Thống</h2>
        <p className="text-zinc-500 text-sm">Quản lý các thông số cốt lõi và tài khoản quản trị nội bộ.</p>
      </header>
      
      <div className="grid grid-cols-12 gap-8">
        
        {/* SECTION 1: USER ACCOUNTS */}
        <section className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white border text-zinc-900 border-zinc-200 rounded-2xl p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="font-headline font-bold text-xl text-zinc-900">Tài khoản Nội bộ (Admins)</h3>
                <p className="text-sm text-zinc-500 mt-1">Cấu hình vai trò và quyền hạn cho nhóm của bạn từ DB.</p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="flex justify-center items-center gap-2 bg-amber-400 text-zinc-900 hover:bg-amber-500 w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors">
                <span className="material-symbols-outlined text-[20px]">person_add</span> Thêm thành viên
              </button>
            </div>
            
            <div className="space-y-4">
              {staffUsers.length === 0 ? <p className="text-sm text-zinc-500 mb-4">Chưa có Admin/Staff nào.</p> :
               staffUsers.map(admin => (
              <div key={admin._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-zinc-50 rounded-2xl border border-transparent hover:border-amber-400 group transition-all gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-zinc-200 shadow-sm bg-white flex justify-center items-center font-black uppercase text-zinc-900 text-lg">
                      {admin.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900">{admin.username}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{admin.role.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 justify-between sm:justify-end">
                  {admin.role === 'admin' ? (
                     <div className="px-5 py-2 bg-zinc-900 text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest">Q.Trị Viên</div>
                  ) : (
                     <div className="px-5 py-2 border border-zinc-900 text-zinc-900 rounded-full text-[10px] font-black uppercase tracking-widest bg-white">Nhân viên</div>
                  )}
                  <button onClick={() => setDeleteConfirm({show: true, id: admin._id})} className="text-zinc-400 hover:text-red-500 p-2 border border-transparent hover:border-red-200 rounded-full hover:bg-red-50 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
            <h3 className="font-headline font-bold text-xl text-zinc-900 mb-6">Ma trận phân quyền</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-zinc-50 rounded-2xl border-t-4 border-zinc-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                <span className="material-symbols-outlined text-zinc-900 mb-4 text-[28px]">security</span>
                <h4 className="font-bold text-zinc-900 mb-2">Quyền Quản trị viên</h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">Toàn quyền truy cập vào thanh toán, kho hàng và quản lý người dùng.</p>
              </div>
              <div className="p-6 bg-amber-50 rounded-2xl border-t-4 border-amber-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                <span className="material-symbols-outlined text-amber-500 mb-4 text-[28px]">inventory_2</span>
                <h4 className="font-bold text-amber-900 mb-2">Quyền Nhân viên</h4>
                <p className="text-xs text-amber-700 leading-relaxed font-medium">Quản lý tồn kho, xử lý đơn hàng và hỗ trợ khách hàng. Không can thiệp hệ thống.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: GENERAL SETTINGS */}
        <section className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
            <h3 className="font-headline font-bold text-xl text-zinc-900 mb-8">Thông tin cửa hàng</h3>
            <form className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Tên cửa hàng</label>
                <input className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm font-bold text-zinc-900 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all outline-none" type="text" defaultValue="Editorial Vitality HQ" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Email hỗ trợ</label>
                <input className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm font-bold text-zinc-900 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all outline-none" type="email" defaultValue="concierge@vitality.com" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Liên hệ chính thức</label>
                <input className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm font-bold text-zinc-900 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all outline-none" type="text" defaultValue="+1 (555) VITALITY" />
              </div>
              <div className="pt-2">
                <button onClick={() => showToast("Đã lưu cài đặt!", "success")} className="w-full bg-zinc-900 text-white py-4 rounded-xl font-bold text-sm shadow-lg hover:bg-amber-400 hover:text-zinc-900 transition-colors" type="button">
                  Cập nhật tĩnh
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center fade-in text-zinc-900">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl mx-4">
            <h3 className="font-headline font-extrabold text-2xl mb-6">Thêm Tài Khoản Nôi Bộ API</h3>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleCreate() }}>
               <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Tên Đăng Nhập</label>
                  <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} type="text" className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-amber-400 bg-zinc-50" placeholder="admin123" />
               </div>
               <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Mật Khẩu</label>
                  <input required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} type="password" className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-amber-400 bg-zinc-50" placeholder="••••••••" />
               </div>
               <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Phân quyền</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-amber-400 bg-zinc-50">
                      <option value="admin">Quản trị viên (Admin)</option>
                      <option value="staff">Nhân viên (Staff)</option>
                  </select>
               </div>
               <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors">Hủy</button>
                  <button type="submit" className="px-6 py-3 font-bold bg-amber-400 text-zinc-900 rounded-xl hover:bg-amber-500 transition-colors">Tạo Account Live</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
