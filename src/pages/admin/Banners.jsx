import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: '', subtitle: '', link: '/menu', order: 0, isActive: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const { showToast } = useToast();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchBanners = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/banners/admin', { headers });
      setBanners(res.data);
    } catch (err) {
      showToast('Lỗi tải banner', 'error');
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const resetForm = () => {
    setIsEditMode(false);
    setEditId(null);
    setFormData({ title: '', subtitle: '', link: '/menu', order: 0, isActive: true });
    setImageFile(null);
    setImagePreview('');
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    const form = new FormData();
    form.append('image', imageFile);
    const res = await axios.post('http://localhost:5000/api/upload', form, { headers });
    return res.data.url;
  };

  const handleSubmit = async () => {
    try {
      let imageUrl = isEditMode ? imagePreview : '';

      if (imageFile) {
        imageUrl = await uploadImage();
      }

      if (!imageUrl) {
        return showToast('Vui lòng chọn ảnh banner', 'error');
      }

      const payload = { ...formData, image: imageUrl, order: Number(formData.order) };

      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/banners/${editId}`, payload, { headers });
        showToast('Cập nhật banner thành công!');
      } else {
        await axios.post('http://localhost:5000/api/banners', payload, { headers });
        showToast('Thêm banner mới thành công!', 'success');
      }

      setIsModalOpen(false);
      resetForm();
      fetchBanners();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi lưu banner', 'error');
    }
  };

  const openEdit = (b) => {
    setIsEditMode(true);
    setEditId(b._id);
    setFormData({ title: b.title, subtitle: b.subtitle, link: b.link, order: b.order, isActive: b.isActive });
    setImagePreview(b.image);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/banners/${deleteConfirm.id}`, { headers });
      showToast('Đã xóa banner');
      setDeleteConfirm({ show: false, id: null });
      fetchBanners();
    } catch (err) {
      showToast('Xóa thất bại', 'error');
      setDeleteConfirm({ show: false, id: null });
    }
  };

  const toggleActive = async (id, current) => {
    try {
      await axios.put(`http://localhost:5000/api/banners/${id}`, { isActive: !current }, { headers });
      fetchBanners();
    } catch (_) {}
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="fade-in space-y-8 relative pb-20">
      <ConfirmModal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, id: null })}
        onConfirm={confirmDelete}
        title="Xóa banner này?"
        description="Banner sẽ bị xóa vĩnh viễn khỏi trang chủ."
      />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
            <span>Quản trị</span>
            <span className="material-symbols-outlined text-[10px]">arrow_forward_ios</span>
            <span className="text-zinc-900">Banner Trang Chủ</span>
          </div>
          <h1 className="text-4xl font-headline font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            Quản Lý <span className="bg-amber-400 px-3 py-1 rounded-lg italic text-zinc-900">Banner</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-4 max-w-xl leading-relaxed">Thêm, sửa, xóa và quản lý thứ tự các banner hiển thị trên carousel trang chủ.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-zinc-900 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-amber-500 hover:text-zinc-900 transition-colors flex items-center gap-2 group"
        >
          <span className="material-symbols-outlined text-amber-500 group-hover:text-zinc-900 transition-colors">add_circle</span>
          Thêm Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.length === 0 ? (
          <div className="col-span-full text-center py-24 text-zinc-400">
            <span className="material-symbols-outlined text-[60px] text-zinc-200 mb-4 block">image</span>
            <p className="font-bold text-lg">Chưa có banner nào</p>
            <p className="text-sm mt-1">Trang chủ sẽ hiển thị giao diện mặc định.</p>
          </div>
        ) : banners.map(b => (
          <div key={b._id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm group relative ${b.isActive ? 'border-zinc-200' : 'border-red-200 opacity-60'}`}>
            <div className="relative aspect-[16/7] overflow-hidden bg-zinc-100">
              <img src={b.image} alt={b.title || 'Banner'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="bg-zinc-900/70 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1">#{b.order}</span>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 backdrop-blur-sm ${b.isActive ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                  {b.isActive ? 'ACTIVE' : 'HIDDEN'}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h4 className="font-bold text-sm text-zinc-900 line-clamp-1 mb-1">{b.title || '(Không có tiêu đề)'}</h4>
              <p className="text-xs text-zinc-400 line-clamp-1 mb-4">{b.subtitle || b.link}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(b)} className="flex-1 py-2 text-xs font-bold text-zinc-500 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors text-center">Sửa</button>
                <button onClick={() => toggleActive(b._id, b.isActive)} className="flex-1 py-2 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors text-center">
                  {b.isActive ? 'Ẩn' : 'Hiện'}
                </button>
                <button onClick={() => setDeleteConfirm({ show: true, id: b._id })} className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center fade-in text-zinc-900">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => { setIsModalOpen(false); resetForm(); }} />
          <div className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-[0_20px_60px_rgba(0,0,0,0.2)] mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-extrabold text-2xl tracking-tight text-zinc-900">
                {isEditMode ? 'Cập Nhật Banner' : 'Thêm Banner Mới'}
              </h3>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Ảnh Banner *</label>
                <div
                  onClick={() => document.getElementById('banner-file-input').click()}
                  className="relative w-full aspect-[16/7] rounded-xl border-2 border-dashed border-zinc-200 hover:border-amber-400 cursor-pointer overflow-hidden bg-zinc-50 transition-colors flex items-center justify-center"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <span className="material-symbols-outlined text-[40px] text-zinc-300 mb-2 block">cloud_upload</span>
                      <p className="text-xs font-bold text-zinc-400">Click để chọn ảnh từ máy</p>
                      <p className="text-[10px] text-zinc-300 mt-1">Khuyến nghị: 1920 x 720px</p>
                    </div>
                  )}
                </div>
                <input
                  id="banner-file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Tiêu đề (tuỳ chọn)</label>
                  <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} type="text" className="w-full border border-zinc-200 p-3 rounded-xl outline-none focus:border-amber-400 bg-zinc-50 text-sm font-bold text-zinc-900" placeholder="VD: Bộ Sưu Tập Mùa Hè" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Thứ tự</label>
                  <input value={formData.order} onChange={e => setFormData({...formData, order: e.target.value})} type="number" className="w-full border border-zinc-200 p-3 rounded-xl outline-none focus:border-amber-400 bg-zinc-50 text-sm font-bold text-zinc-900" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Mô tả ngắn (tuỳ chọn)</label>
                <input value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} type="text" className="w-full border border-zinc-200 p-3 rounded-xl outline-none focus:border-amber-400 bg-zinc-50 text-sm font-bold text-zinc-900" placeholder="VD: Giảm giá 30% toàn bộ đồ uống" />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Link khi click</label>
                <input value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} type="text" className="w-full border border-zinc-200 p-3 rounded-xl outline-none focus:border-amber-400 bg-zinc-50 text-sm font-bold text-zinc-900" placeholder="/menu" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 accent-amber-500" />
                <span className="text-sm font-bold text-zinc-700">Hiển thị banner trên trang chủ</span>
              </label>

              <div className="pt-6 border-t border-zinc-100 flex justify-end gap-3 w-full">
                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="flex-1 py-4 font-bold text-zinc-500 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors text-sm">Trở Lại</button>
                <button type="submit" className="flex-1 py-4 font-bold bg-amber-400 text-zinc-900 rounded-xl shadow-lg hover:bg-amber-500 hover:-translate-y-0.5 transition-all text-sm">
                  {isEditMode ? 'Lưu Thay Đổi' : 'Tạo Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
