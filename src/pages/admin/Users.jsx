import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';
import AdminSearchBar, { fuzzyMatch } from '../../components/AdminSearchBar';
import VietnamAddressSelect from '../../components/VietnamAddressSelect';

const EMPTY_FORM = {
  name: '', username: '', email: '', phone: '', password: 'password123',
  role: 'user', dob: '', gender: '', address: '', province: '', district: '', ward: '',
};

const ROLE_CONFIG = {
  admin:  { icon: 'shield_person', label: 'Admin',    style: 'bg-amber-50 border-amber-300 text-amber-700' },
  staff:  { icon: 'badge',         label: 'Nhân viên', style: 'bg-blue-50 border-blue-300 text-blue-700' },
  user:   { icon: 'person',        label: 'User',      style: 'bg-zinc-50 border-zinc-200 text-zinc-500' },
};

const Users = () => {
  const [users,         setUsers]         = useState([]);
  const [search,        setSearch]        = useState('');
  const [roleFilter,    setRoleFilter]    = useState('all');
  const [formData,      setFormData]      = useState(EMPTY_FORM);
  const [editMode,      setEditMode]      = useState(false);     // true = editing existing user
  const [editUserId,    setEditUserId]    = useState(null);
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [viewUser,      setViewUser]      = useState(null);      // detail drawer
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const { showToast } = useToast();

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/users');
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };
  useEffect(() => { fetchUsers(); }, []);

  // ── helpers ────────────────────────────────────────────────────────────────
  const token = () => localStorage.getItem('token');

  const openCreate = () => {
    setFormData(EMPTY_FORM);
    setEditMode(false);
    setEditUserId(null);
    setIsModalOpen(true);
  };

  const openEdit = (user) => {
    setFormData({
      name: user.name || '', username: user.username || '',
      email: user.email || '', phone: user.phone || '',
      password: '', role: user.role || 'user',
      dob: user.dob ? user.dob.slice(0, 10) : '',
      gender: user.gender || '', address: user.address || '',
      province: user.province || '', district: user.district || '', ward: user.ward || '',
    });
    setEditMode(true);
    setEditUserId(user._id);
    setIsModalOpen(true);
  };

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      if (editMode) {
        // Update via profile endpoint used by admin
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${editUserId}/profile`, payload, {
          headers: { Authorization: `Bearer ${token()}` },
        });
        showToast('Đã cập nhật thông tin người dùng', 'success');
      } else {
        await axios.post(import.meta.env.VITE_API_URL + '/api/auth/register', formData);
        showToast('Đã tạo người dùng mới thành công', 'success');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi lưu dữ liệu', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${deleteConfirm.id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      showToast('Đã xóa người dùng', 'success');
      fetchUsers();
    } catch { showToast('Lỗi khi xóa', 'error'); }
    finally { setDeleteConfirm({ show: false, id: null }); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      showToast('Đã cập nhật quyền hạn', 'success');
      fetchUsers();
    } catch { showToast('Lỗi cập nhật quyền', 'error'); }
  };

  // ── filtered list ──────────────────────────────────────────────────────────
  const filtered = users.filter(u => {
    if (roleFilter === 'admin_staff' && u.role === 'user') return false;
    return (
      fuzzyMatch(u.name,     search) ||
      fuzzyMatch(u.email,    search) ||
      fuzzyMatch(u.phone,    search) ||
      fuzzyMatch(u.username, search)
    );
  });

  const inputClass = "w-full border border-zinc-200 py-2.5 px-3 rounded-lg outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm font-medium bg-zinc-50 transition-all";

  return (
    <div className="fade-in space-y-6 relative">
      <ConfirmModal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, id: null })}
        onConfirm={confirmDelete}
        title="Xóa tài khoản?"
        description="Tài khoản sẽ bị xóa vĩnh viễn khỏi hệ thống. Hành động không thể hoàn tác."
      />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-zinc-900 tracking-tight">
            Quản trị & Phân Quyền
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Quản lý tài khoản, vai trò và thông tin cá nhân thành viên.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl px-4 py-3 shadow-sm">
            <div className="w-8 h-8 bg-zinc-100 text-zinc-600 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tổng tài khoản</p>
              <p className="font-black text-zinc-900 text-lg leading-tight">{users.length}</p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-sm hover:bg-amber-500 hover:text-zinc-900 transition-all h-[58px]"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* ── Role legend ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
          <div key={role} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${cfg.style}`}>
            <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span> {cfg.label}
          </div>
        ))}
      </div>

      {/* ── Table card ────────────────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-zinc-100">
          <div className="flex gap-6 text-sm font-bold border-b-0">
            {[['all','Tất cả'], ['admin_staff','Admin & Staff']].map(([v, label]) => (
              <button
                key={v}
                onClick={() => setRoleFilter(v)}
                className={`pb-1 border-b-2 transition-colors ${roleFilter === v ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-700'}`}
              >
                {label} {v === 'all' ? `(${users.length})` : `(${users.filter(u => u.role !== 'user').length})`}
              </button>
            ))}
          </div>
          <AdminSearchBar value={search} onChange={setSearch} placeholder="Tìm tên, email, SĐT..." />
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="py-3 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Người dùng</th>
                <th className="py-3 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Liên hệ</th>
                <th className="py-3 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Vai trò</th>
                <th className="py-3 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filtered.length === 0 ? (
                <tr><td colSpan="4" className="py-10 text-center text-sm text-zinc-400">Không tìm thấy người dùng nào.</td></tr>
              ) : filtered.map(user => (
                <tr key={user._id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || user.email}`}
                          alt="avatar"
                          className="w-9 h-9 rounded-full border border-zinc-200 bg-zinc-50"
                        />
                        {user.role !== 'user' && (
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${user.role === 'admin' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                            <span className="material-symbols-outlined text-white" style={{fontSize:'9px'}}>{ROLE_CONFIG[user.role]?.icon}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-900">{user.name}</p>
                        <p className="text-[11px] text-zinc-400">{user.email || user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-zinc-700">{user.phone || '—'}</p>
                    <p className="text-[11px] text-zinc-400">{user.email || user.username}</p>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user._id, e.target.value)}
                      className={`text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border-2 outline-none cursor-pointer transition-colors ${ROLE_CONFIG[user.role]?.style}`}
                    >
                      <option value="user">User</option>
                      <option value="staff">Nhân viên</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewUser(user)}
                        className="p-2 flex items-center justify-center border border-zinc-200 bg-white hover:bg-amber-400 hover:border-amber-400 text-zinc-500 hover:text-zinc-900 rounded-lg transition-all"
                        title="Chi tiết"
                      >
                        <span className="material-symbols-outlined text-[16px] leading-none">visibility</span>
                      </button>
                      <button
                        onClick={() => openEdit(user)}
                        className="p-2 flex items-center justify-center border border-zinc-200 bg-white hover:bg-zinc-900 hover:border-zinc-900 text-zinc-500 hover:text-white rounded-lg transition-all"
                        title="Chỉnh sửa"
                      >
                        <span className="material-symbols-outlined text-[16px] leading-none">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ show: true, id: user._id })}
                        className="p-2 flex items-center justify-center border border-zinc-200 bg-white hover:bg-red-50 hover:border-red-300 text-zinc-300 hover:text-red-500 rounded-lg transition-all"
                        title="Xóa"
                      >
                        <span className="material-symbols-outlined text-[16px] leading-none">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-zinc-100 px-6 py-3 bg-zinc-50/50 text-[11px] text-zinc-400">
          Hiển thị {filtered.length} / {users.length} người dùng
        </div>
      </div>

      {/* ── Detail Drawer ──────────────────────────────────────────────────── */}
      {viewUser && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-zinc-900/30 backdrop-blur-sm" onClick={() => setViewUser(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col fade-in">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div>
                <h2 className="font-headline font-black text-xl text-zinc-900">Chi tiết người dùng</h2>
                <p className="text-xs text-zinc-400 mt-0.5">#{viewUser._id?.slice(0,8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setViewUser(null)}
                className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-6 flex-1 space-y-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${viewUser.username || viewUser.email}`}
                  alt="avatar"
                  className="w-14 h-14 rounded-full border border-zinc-200 bg-zinc-100"
                />
                <div>
                  <p className="font-bold text-zinc-900 text-lg">{viewUser.name}</p>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${ROLE_CONFIG[viewUser.role]?.style}`}>
                    <span className="material-symbols-outlined" style={{fontSize:'11px'}}>{ROLE_CONFIG[viewUser.role]?.icon}</span>
                    {ROLE_CONFIG[viewUser.role]?.label}
                  </span>
                </div>
              </div>

              {/* Info grid */}
              {[
                ['Username', viewUser.username],
                ['Email', viewUser.email],
                ['Số điện thoại', viewUser.phone],
                ['Ngày sinh', viewUser.dob ? new Date(viewUser.dob).toLocaleDateString('vi-VN') : null],
                ['Giới tính', viewUser.gender],
                ['Địa chỉ', viewUser.address],
                ['Tỉnh/TP', viewUser.province],
                ['Quận/Huyện', viewUser.district],
                ['Phường/Xã', viewUser.ward],
                ['Ngày tham gia', viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleDateString('vi-VN') : null],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-start border-b border-zinc-50 pb-3 last:border-0">
                  <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 w-32 shrink-0">{label}</span>
                  <span className="text-sm font-medium text-zinc-700 text-right">{val || '—'}</span>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-zinc-100 sticky bottom-0 bg-white">
              <button
                onClick={() => { setViewUser(null); openEdit(viewUser); }}
                className="w-full py-3 bg-zinc-900 text-white font-bold rounded-lg hover:bg-amber-500 hover:text-zinc-900 transition-all text-sm flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Chỉnh sửa thông tin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl border-t-4 border-amber-500 max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between shrink-0">
              <h3 className="font-headline font-black text-xl text-zinc-900">
                {editMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors">
                <span className="material-symbols-outlined text-[18px] text-zinc-500">close</span>
              </button>
            </div>

            <form className="p-6 overflow-y-auto space-y-5" onSubmit={e => { e.preventDefault(); handleSave(); }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Họ & tên *</label>
                  <input type="text" value={formData.name || ''} placeholder="Nguyễn Văn A" onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Username *</label>
                  <input type="text" value={formData.username || ''} placeholder="nguyenvana" onChange={e => setFormData({...formData, username: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Email</label>
                  <input type="email" value={formData.email || ''} placeholder="email@example.com" onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Số điện thoại</label>
                  <input type="tel" value={formData.phone || ''} placeholder="0901..." onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">{editMode ? 'Mật khẩu mới (để trống = giữ cũ)' : 'Mật khẩu *'}</label>
                  <input type="password" value={formData.password || ''} placeholder="••••••••" onChange={e => setFormData({...formData, password: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Ngày sinh</label>
                  <input type="date" value={formData.dob || ''} onChange={e => setFormData({...formData, dob: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Giới tính</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}
                    className="w-full border border-zinc-200 py-2.5 px-3 rounded-lg outline-none focus:border-amber-500 text-sm font-medium bg-zinc-50">
                    <option value="">-- Chọn --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Địa chỉ chi tiết</label>
                <input type="text" value={formData.address || ''} placeholder="Số nhà, đường..." onChange={e => setFormData({...formData, address: e.target.value})} className={inputClass} />
              </div>
              <VietnamAddressSelect
                province={formData.province}
                district={formData.district}
                ward={formData.ward}
                onChange={(val) => setFormData({ ...formData, ...val })}
                selectClass="w-full border border-zinc-200 py-2.5 px-3 rounded-lg outline-none focus:border-amber-500 text-sm font-medium bg-zinc-50 disabled:opacity-50"
              />

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Vai trò</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full border border-zinc-200 py-2.5 px-3 rounded-lg outline-none focus:border-amber-500 text-sm font-bold bg-zinc-50">
                  <option value="user">User</option>
                  <option value="staff">Nhân viên</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 font-bold text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
                  Hủy
                </button>
                <button type="submit"
                  className="px-6 py-2.5 font-black text-sm bg-amber-500 text-zinc-900 rounded-lg hover:bg-zinc-900 hover:text-white transition-all">
                  {editMode ? 'Lưu thay đổi' : 'Tạo người dùng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
