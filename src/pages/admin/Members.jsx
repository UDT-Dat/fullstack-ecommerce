import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import AdminSearchBar, { fuzzyMatch } from '../../components/AdminSearchBar';

const TIER_CONFIG = {
  'Đồng':      { icon: 'military_tech', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  'Vàng':      { icon: 'social_leaderboard', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  'Kim Cương': { icon: 'diamond', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  'Mới':       { icon: 'fiber_new', color: 'text-zinc-500 bg-zinc-50 border-zinc-200' },
};

const Members = () => {
  const [users,       setUsers]       = useState([]);
  const [search,      setSearch]      = useState('');
  const [filter,      setFilter]      = useState('members');
  const [selectedUser,setSelectedUser]= useState(null);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };
  useEffect(() => { fetchUsers(); }, []);

  const token = () => localStorage.getItem('token');

  const handleToggleMembership = async (userId, current) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/membership`, { isMember: !current }, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      showToast(!current ? 'Đã cấp thẻ hội viên' : 'Đã thu hồi thẻ hội viên', 'success');
      fetchUsers();
      if (selectedUser?._id === userId) setSelectedUser(u => ({ ...u, isMember: !current }));
    } catch { showToast('Lỗi cập nhật thẻ', 'error'); }
  };

  const handleUpdateTier = async (userId, newTier) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/tier`, { tier: newTier }, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      showToast('Đã cập nhật hạng thành viên', 'success');
      fetchUsers();
    } catch { showToast('Lỗi cập nhật hạng', 'error'); }
  };

  const filtered = users.filter(u => {
    if (filter === 'members' && !u.isMember) return false;
    return (
      fuzzyMatch(u.name,  search) ||
      fuzzyMatch(u.phone, search) ||
      fuzzyMatch(u.email, search)
    );
  });

  const memberCount = users.filter(u => u.isMember).length;

  return (
    <div className="fade-in space-y-6 relative">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-zinc-900 tracking-tight">
            Thẻ Hội Viên
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Quản lý chương trình khách hàng thân thiết & hạng chiết khấu VIP.</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl px-4 py-3 shadow-sm">
          <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">card_membership</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Hội viên đang hoạt động</p>
            <p className="font-black text-zinc-900 text-lg leading-tight">{memberCount} / {users.length}</p>
          </div>
        </div>
      </div>

      {/* ── Tier legend ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(TIER_CONFIG).filter(([k]) => k !== 'Mới').map(([tier, cfg]) => (
          <div key={tier} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${cfg.color}`}>
            <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span> {tier}
          </div>
        ))}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold text-zinc-500 bg-zinc-50 border-zinc-200">
          <span className="material-symbols-outlined text-[14px]">build</span> Ép hạng thủ công
        </div>
      </div>

      {/* ── Table card ────────────────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-zinc-100">
          <div className="flex gap-6 text-sm font-bold">
            {[['members','Hội viên'], ['all','Tất cả người dùng']].map(([v, label]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={`pb-1 border-b-2 transition-colors ${filter === v ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <AdminSearchBar value={search} onChange={setSearch} placeholder="Tìm tên, SĐT, email..." />
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="py-3 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Người dùng</th>
                <th className="py-3 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Liên hệ</th>
                <th className="py-3 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Hạng / Doanh số</th>
                <th className="py-3 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filtered.length === 0 ? (
                <tr><td colSpan="4" className="py-10 text-center text-sm text-zinc-400">Chưa có dữ liệu.</td></tr>
              ) : filtered.map(user => {
                const tier = user.computedTier || 'Mới';
                const cfg  = TIER_CONFIG[tier] || TIER_CONFIG['Mới'];
                return (
                  <tr key={user._id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                            alt="avatar"
                            className="w-9 h-9 rounded-full border border-zinc-200 bg-zinc-50"
                          />
                          {user.isMember && (
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${cfg.color.split(' ')[1]} ${cfg.color.split(' ')[0]}`}>
                              <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>{cfg.icon}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-zinc-900">{user.name}</p>
                          {user.isMember ? (
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.color.split(' ')[0]}`}>{tier}</span>
                              {user.manualTier !== 'none' && (
                                <span className="material-symbols-outlined text-zinc-400" style={{ fontSize: '11px' }} title="Ép hạng thủ công">build</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-400 mt-0.5 block">Khách thường</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-zinc-700">{user.phone || '—'}</p>
                      <p className="text-[11px] text-zinc-400">{user.email || user.username}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-amber-600">{(user.totalSpent || 0).toLocaleString()}đ</p>
                      <p className="text-[11px] text-zinc-400">{user.validOrdersCount || 0} đơn hoàn tất</p>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 flex items-center justify-center border border-zinc-200 bg-white hover:bg-amber-400 hover:border-amber-400 text-zinc-600 hover:text-zinc-900 rounded-lg transition-all"
                          title="Chi tiết & điều chỉnh hạng"
                        >
                          <span className="material-symbols-outlined text-[16px] leading-none">visibility</span>
                        </button>
                        <button
                          onClick={() => handleToggleMembership(user._id, user.isMember)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            user.isMember
                              ? 'bg-white border-red-200 text-red-500 hover:bg-red-50'
                              : 'bg-zinc-900 border-zinc-900 text-white hover:bg-amber-500 hover:border-amber-500 hover:text-zinc-900'
                          }`}
                        >
                          {user.isMember ? 'Thu hồi' : 'Cấp thẻ'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-zinc-100 px-6 py-3 bg-zinc-50/50 text-[11px] text-zinc-400">
          Hiển thị {filtered.length} / {users.length} người dùng
        </div>
      </div>

      {/* ── Detail Drawer ──────────────────────────────────────────────────── */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-zinc-900/30 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col fade-in">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <h2 className="font-headline font-black text-xl text-zinc-900">Chi tiết hội viên</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors">
                <span className="material-symbols-outlined text-[18px] text-zinc-500">close</span>
              </button>
            </div>

            <div className="p-6 flex-1 space-y-6">
              {/* Profile */}
              <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`} alt="avatar"
                  className="w-14 h-14 rounded-full border border-zinc-200 bg-zinc-100" />
                <div>
                  <p className="font-bold text-zinc-900">{selectedUser.name}</p>
                  <p className="text-xs text-zinc-400">{selectedUser.email || selectedUser.username}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Đơn hoàn tất</p>
                  <p className="text-2xl font-black text-zinc-900">{selectedUser.validOrdersCount || 0}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Tổng chi tiêu</p>
                  <p className="text-lg font-black text-amber-600">{(selectedUser.totalSpent || 0).toLocaleString()}đ</p>
                </div>
              </div>

              {/* Hạng mức */}
              <div className="border border-zinc-100 rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Điều chỉnh hạng chiết khấu</p>

                {!selectedUser.isMember ? (
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    Người dùng chưa được cấp thẻ hội viên.
                  </div>
                ) : (
                  <select
                    value={selectedUser.manualTier || 'none'}
                    onChange={e => { handleUpdateTier(selectedUser._id, e.target.value); setSelectedUser({...selectedUser, manualTier: e.target.value}); }}
                    className="w-full border border-zinc-200 bg-white text-sm font-bold py-2.5 px-3 rounded-lg outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="none">🔄 Tự động theo tích lũy</option>
                    <option value="Đồng">🥉 Ép Hạng Đồng (−5%)</option>
                    <option value="Vàng">🏅 Ép Hạng Vàng (−10%)</option>
                    <option value="Kim Cương">💎 Ép Hạng Kim Cương (−15%)</option>
                  </select>
                )}

                {selectedUser.isMember && selectedUser.manualTier !== 'none' && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-50 rounded-lg p-2 border border-zinc-100">
                    <span className="material-symbols-outlined text-[14px]">build</span>
                    Hạng đang được ép thủ công bởi Admin.
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-zinc-100 sticky bottom-0 bg-white">
              <button
                onClick={() => handleToggleMembership(selectedUser._id, selectedUser.isMember)}
                className={`w-full py-3 font-bold rounded-lg transition-all text-sm flex items-center justify-center gap-2 ${
                  selectedUser.isMember
                    ? 'bg-red-50 border border-red-200 text-red-500 hover:bg-red-100'
                    : 'bg-zinc-900 text-white hover:bg-amber-500 hover:text-zinc-900'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{selectedUser.isMember ? 'block' : 'add_circle'}</span>
                {selectedUser.isMember ? 'Thu hồi thẻ hội viên' : 'Cấp thẻ hội viên'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
