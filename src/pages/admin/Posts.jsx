import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';
import AdminSearchBar, { fuzzyMatch } from '../../components/AdminSearchBar';
import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';

const EMPTY_FORM = {
  title: '', summary: '', content: '', thumbnail: '', tags: '', status: 'draft'
};

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editMode, setEditMode] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const { showToast } = useToast();

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/posts/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
    } catch (err) { console.error(err); }
  };
  useEffect(() => { fetchPosts(); }, []);

  const openCreate = () => {
    setFormData(EMPTY_FORM);
    setEditMode(false);
    setEditPostId(null);
    setIsModalOpen(true);
  };

  const openEdit = (post) => {
    setFormData({
      title: post.title || '',
      summary: post.summary || '',
      content: post.content || '',
      thumbnail: post.thumbnail || '',
      tags: post.tags ? post.tags.join(', ') : '',
      status: post.status || 'draft'
    });
    setEditMode(true);
    setEditPostId(post._id);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const data = new FormData();
    data.append('image', file);
    try {
        const token = localStorage.getItem('token');
        const res = await axios.post(import.meta.env.VITE_API_URL + '/api/upload', data, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
             }
        });
        setFormData({...formData, thumbnail: res.data.url});
        showToast('Tải ảnh thành công!', 'success');
    } catch(err) {
        showToast('Lỗi tải ảnh', 'error');
    } finally {
        setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        thumbnail: formData.thumbnail.trim() || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800',
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editMode) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/posts/${editPostId}`, payload, { headers });
        showToast("Cập nhật bài viết thành công!", "success");
      } else {
        await axios.post(import.meta.env.VITE_API_URL + '/api/posts', payload, { headers });
        showToast("Thêm bài viết thành công!", "success");
      }
      setIsModalOpen(false);
      fetchPosts();
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi lưu bài viết", "error");
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/posts/${deleteConfirm.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Đã xóa bài viết!", "success");
      setDeleteConfirm({ show: false, id: null });
      fetchPosts();
    } catch (err) {
      showToast("Lỗi xóa bài viết", "error");
    }
  };

  const filteredPosts = posts.filter(val => {
    const matchSearch = fuzzyMatch(val.title, search) || fuzzyMatch(val.slug, search);
    const matchStatus = statusFilter === 'all' || val.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Removed InputField definition to avoid unmount/remount issues

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-3 w-full">
            <span className="material-symbols-outlined text-amber-500 text-[32px] shrink-0 inline-block leading-none">newspaper</span> Quản lý Bài Viết
          </h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1 ml-11">Hệ thống tin tức và thông báo</p>
        </div>
        <button onClick={openCreate} className="px-5 py-2.5 bg-zinc-900 text-white font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-amber-500 hover:text-zinc-900 transition-all flex items-center gap-2 shadow-lg shrink-0">
          <span className="material-symbols-outlined text-[18px] shrink-0 block leading-none">add</span> Viết bài mới
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <AdminSearchBar value={search} onChange={setSearch} placeholder="Tìm bài viết..." />
          <div className="flex gap-2">
            {['all', 'published', 'draft'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-100'}`}>
                {s === 'all' ? 'Tất cả' : s === 'draft' ? 'Bản nháp' : 'Đã đăng'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="py-4 px-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tiêu đề & View</th>
                <th className="py-4 px-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tác giả</th>
                <th className="py-4 px-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ngày đăng</th>
                <th className="py-4 px-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Trạng thái</th>
                <th className="py-4 px-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {filteredPosts.map((p) => (
                <tr key={p._id} className="hover:bg-zinc-50/50 transition-colors group cursor-pointer">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                       <img src={p.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover border border-zinc-200" />
                       <div>
                         <p className="text-sm font-bold text-zinc-900 line-clamp-1">{p.title}</p>
                         <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest flex items-center gap-1">
                           <span className="material-symbols-outlined text-[14px] shrink-0 leading-none">visibility</span> {p.views} lượt xem
                         </p>
                       </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-zinc-600 font-bold">{p.author}</td>
                  <td className="py-4 px-6 text-xs text-zinc-500 uppercase tracking-widest font-bold">
                    {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-4 px-6">
                     <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${p.status === 'published' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                        {p.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                     </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(p); }} className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors flex items-center justify-center" title="Sửa">
                        <span className="material-symbols-outlined text-[20px] shrink-0 leading-none">edit</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ show: true, id: p._id }); }} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center" title="Xóa">
                        <span className="material-symbols-outlined text-[20px] shrink-0 leading-none">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-zinc-400 font-bold text-sm uppercase tracking-widest">
                    Chưa có bài viết nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-xl flex flex-col max-h-[90vh] animate-slide-up">
            <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 rounded-t-3xl">
              <div>
                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">{editMode ? 'Chỉnh sửa' : 'Bài viết mới'}</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Sử dụng Markdown cho phần nội dung</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-zinc-200 hover:bg-zinc-300 rounded-full transition-colors flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px] text-zinc-700 leading-none">close</span>
              </button>
            </div>

            <form className="p-6 overflow-y-auto w-full space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                    <div className="mb-4">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Tiêu đề bài viết *</label>
                      <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-zinc-200 py-2.5 px-3 rounded-lg outline-none focus:border-amber-500 text-sm font-medium bg-zinc-50" placeholder="VD: Khuyến mãi Tết 2026..." required />
                    </div>
                 </div>
                 <div className="md:col-span-2">
                    <div className="mb-4">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Tóm tắt ngắn</label>
                      <input type="text" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} className="w-full border border-zinc-200 py-2.5 px-3 rounded-lg outline-none focus:border-amber-500 text-sm font-medium bg-zinc-50" placeholder="Mô tả vài dòng xuất hiện ngoài trang chủ..." />
                    </div>
                 </div>
                 <div className="mb-4">
                     <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 flex justify-between items-center">
                         Thumbnail
                         {isUploading && <span className="text-amber-500 font-bold lowercase text-[8px] animate-pulse">Đang tải...</span>}
                     </label>
                     <div className="flex bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden shrink-0">
                         {formData.thumbnail && (
                             <img src={formData.thumbnail} alt="thumb" className="w-12 h-12 object-cover border-r border-zinc-200 shrink-0" />
                         )}
                         <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full text-sm font-medium focus:outline-none file:mr-4 file:py-3 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-zinc-200 file:text-zinc-700 hover:file:bg-zinc-300 cursor-pointer" />
                     </div>
                  </div>
                 <div className="mb-4">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Tags (ngăn cách phẩy)</label>
                    <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full border border-zinc-200 py-2.5 px-3 rounded-lg outline-none focus:border-amber-500 text-sm font-medium bg-zinc-50" placeholder="Tin tức, Khuyến mãi, Tết..." />
                 </div>
                 
                 <div className="md:col-span-2">
                    <div className="mb-4">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Nội dung chính *</label>
                      <div className="bg-white rounded-lg overflow-hidden border border-zinc-200 [&_.ql-container]:min-h-[250px] [&_.ql-container]:text-base [&_.ql-editor]:font-body">
                           <ReactQuill theme="snow" value={formData.content} onChange={val => setFormData({...formData, content: val})} />
                      </div>
                    </div>
                 </div>

                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 flex items-center justify-between">
                       Trạng thái hiển thị
                    </label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full border border-zinc-200 py-2.5 px-3 rounded-lg outline-none focus:border-amber-500 text-sm font-bold bg-zinc-50">
                      <option value="draft">Lưu nháp (Chưa đăng)</option>
                      <option value="published">Đăng xuất bản</option>
                    </select>
                 </div>
              </div>

              <div className="pt-4 flex justify-end items-center gap-3 border-t border-zinc-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 font-bold text-zinc-500 hover:text-zinc-900 uppercase tracking-widest text-xs transition-colors">Hủy</button>
                <button type="submit" className="px-6 py-2.5 bg-zinc-900 text-white font-black rounded-lg uppercase tracking-widest text-xs hover:bg-amber-500 hover:text-zinc-900 transition-all shadow-md">
                  {editMode ? 'Lưu cập nhật' : 'Tạo bài đăng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.show}
        title="Xóa Bài Viết"
        description="Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
        onClose={() => setDeleteConfirm({ show: false, id: null })}
      />
    </div>
  );
};

export default Posts;
