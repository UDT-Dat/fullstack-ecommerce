import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

const EMPTY_FORM = { title: '', type: 'brewed', category: 'NƯỚC ÉP', price: '', image: '', description: '', stock: 0 };

const Products = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [sizes, setSizes] = useState([]); // [{ label, extraPrice }]
  const [optionGroups, setOptionGroups] = useState([]); // [{ name, choices, defaultChoice }]
  const [newSizeLabel, setNewSizeLabel] = useState('');
  const [newSizePrice, setNewSizePrice] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupChoices, setNewGroupChoices] = useState(''); // comma-separated
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Feature: Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { showToast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const toggleProductTag = async (id, field, currentValue) => {
    try {
      await axios.put(`http://localhost:5000/api/products/${id}`, { [field]: !currentValue });
      fetchProducts();
    } catch (err) {
      showToast('Lỗi cập nhật', 'error');
    }
  };

  const categories = ["NƯỚC ÉP", "SINH TỐ", "CÀ PHÊ", "NƯỚC NGỌT CÓ GA", "TRÀ", "THỨC UỐNG CÓ CỒN", "NƯỚC KHOÁNG"];

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products", error);
      showToast("Lỗi tải dữ liệu", "error");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset page when searching
  useEffect(() => {
     setCurrentPage(1);
  }, [searchQuery]);

  const handleSubmit = async () => {
    try {
      let imageUrl = formData.image;

      if (imageFile) {
        const form = new FormData();
        form.append('image', imageFile);
        const token = localStorage.getItem('token');
        const uploadRes = await axios.post('http://localhost:5000/api/upload', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        imageUrl = uploadRes.data.url;
      }

      const payload = {
         ...formData,
         price: Number(formData.price),
         stock: formData.type === 'bottled' ? Number(formData.stock) : 0,
         image: imageUrl || '/images/placeholder.png',
         sizes,
         options: optionGroups,
      };

      if (isEditMode) {
         await axios.put(`http://localhost:5000/api/products/${editId}`, payload);
         showToast("Cập nhật món thành công!");
      } else {
         await axios.post('http://localhost:5000/api/products', payload);
         showToast("Đã thêm món mới thành công!", "success");
      }

      setIsModalOpen(false);
      fetchProducts();
      resetForm();
    } catch (err) {
      console.error("Error saving product", err);
      showToast(err.response?.data?.message || "Lỗi khi lưu dữ liệu", "error");
    }
  };

  const openAddModal = () => {
     resetForm();
     setIsModalOpen(true);
  };

  const openEditModal = (product) => {
     setIsEditMode(true);
     setEditId(product._id);
     setFormData({
        title: product.title,
        type: product.type || 'brewed',
        price: product.price,
        image: product.image === '/images/placeholder.png' ? '' : product.image,
        category: product.category,
        description: product.description,
        stock: product.stock || 0
     });
     setSizes(product.sizes || []);
     setOptionGroups(product.options || []);
     setImageFile(null);
     setImagePreview(product.image === '/images/placeholder.png' ? '' : product.image);
     setIsModalOpen(true);
  };

  const resetForm = () => {
     setIsEditMode(false);
     setEditId(null);
     setFormData({ title: '', type: 'brewed', category: 'NƯỚC ÉP', price: '', image: '', description: '', stock: 0 });
     setImageFile(null);
     setImagePreview('');
     setSizes([]);
     setOptionGroups([]);
     setNewSizeLabel('');
     setNewSizePrice('');
     setNewGroupName('');
     setNewGroupChoices('');
  };

  const triggerDelete = (id) => {
      setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
      try {
        await axios.delete(`http://localhost:5000/api/products/${deleteConfirm.id}`);
        showToast("Đã xóa vĩnh viễn sản phẩm");
        setDeleteConfirm({ show: false, id: null });
        fetchProducts();
      } catch (err) {
        console.error("Error deleting", err);
        showToast("Xóa thất bại", "error");
        setDeleteConfirm({ show: false, id: null });
      }
  };

  // Data Calculations for UI
  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const nextPage = () => {
      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
      if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="fade-in space-y-8 relative pb-20">
      
      {/* Delete Confirm Custom Popup */}
      <ConfirmModal 
         isOpen={deleteConfirm.show} 
         onClose={() => setDeleteConfirm({show: false, id: null})} 
         onConfirm={confirmDelete} 
         title="Xóa món này?" 
         description="Sau khi xác nhận, món uống sẽ bị loại bỏ hoàn toàn khỏi Menu khách hàng." 
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
            <span>Quản trị</span>
            <span className="material-symbols-outlined text-[10px]">arrow_forward_ios</span>
            <span className="text-zinc-900">Danh mục</span>
          </div>
          <h1 className="text-4xl font-headline font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            Kho <span className="bg-amber-400 px-3 py-1 rounded-lg italic text-zinc-900">Đồ Uống</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-4 max-w-xl leading-relaxed">Quản lý tài sản thức uống cao cấp với độ chính xác tuyệt đối. Theo dõi tình trạng, giá cả và hiệu suất danh mục.</p>
        </div>
        <div>
          <button onClick={openAddModal} className="bg-zinc-900 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-amber-500 hover:text-zinc-900 transition-colors flex items-center gap-2 group">
            <span className="material-symbols-outlined text-amber-500 group-hover:text-zinc-900 transition-colors">add_circle</span>
            Thêm Món Mới
          </button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Tổng mã hàng (SKU)</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-headline font-black text-zinc-900">{products.length}</h3>
            <span className="text-sm font-bold text-green-500 mb-1">Live</span>
          </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Phân loại hoạt động</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-headline font-black text-zinc-900">{new Set(products.map(p => p.category)).size}</h3>
            <span className="text-sm font-bold text-zinc-500 mb-1">Category</span>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-32 h-32 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-4 relative z-10">Bộ Lọc Tương Tác</p>
          <div className="flex flex-wrap gap-2 relative z-10">
            <button className="bg-amber-500 text-zinc-900 px-4 py-1.5 rounded-full text-xs font-bold leading-none shadow-sm">Có Sẵn</button>
            <button className="bg-transparent text-zinc-400 border border-zinc-700 px-4 py-1.5 rounded-full text-xs font-bold leading-none hover:text-white transition-colors">Hết hàng</button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          
        {/* Lọc & Tìm kiếm Góc trái bảng */}
        <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/30 flex justify-between items-center">
            <div className="relative group w-80">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg group-focus-within:text-amber-500 transition-colors">search</span>
                <input 
                    type="text" 
                    placeholder="Nhập tên sản phẩm để tìm..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-full py-2.5 pl-11 pr-4 text-sm font-bold text-zinc-900 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all shadow-sm"
                />
            </div>
            <div className="text-xs font-bold text-zinc-400">
                 Đang hiện: {currentProducts.length} món
            </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 w-1/3">Sản phẩm</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Phân loại</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Giá bán (VNĐ)</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Tình trạng</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Tags</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50/80">
              {currentProducts.length === 0 ? (
                <tr>
                   <td colSpan="5" className="py-16 text-center text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[40px] text-zinc-300">search_off</span>
                        <p className="text-sm font-bold text-zinc-500">Không tìm thấy sản phẩm nào.</p>
                      </div>
                   </td>
                </tr>
              ) : currentProducts.map((product) => (
                <tr key={product._id} className="hover:bg-zinc-50/80 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl border border-zinc-200 overflow-hidden bg-white shrink-0 shadow-sm p-1">
                        <img src={product.image || '/images/placeholder.png'} alt={product.title} className="w-full h-full object-cover rounded-xl" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 line-clamp-1">{product.title}</h4>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                          {product.category} • {product.type === 'bottled' ? `Đóng chai (Kho: ${product.stock})` : 'Pha chế'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-zinc-100 text-zinc-600 border border-zinc-200 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                      {product.category || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-sm text-zinc-900">{product.price.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${product.type === 'bottled' ? (product.stock > 0 ? 'bg-green-500' : 'bg-red-500') : 'bg-blue-500'} shadow-sm`}></div>
                      <span className={`text-[10px] uppercase tracking-widest font-black ${product.type === 'bottled' ? (product.stock > 0 ? 'text-green-600' : 'text-red-600') : 'text-blue-600'}`}>
                        {product.type === 'bottled' ? (product.stock > 0 ? 'CÒN HÀNG' : 'HẾT HÀNG') : 'PHA CHẾ'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        onClick={() => toggleProductTag(product._id, 'isBestSeller', product.isBestSeller)}
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md transition-all border ${product.isBestSeller ? 'bg-red-500 text-white border-red-500 shadow-sm' : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-red-50 hover:border-red-300 hover:text-red-500'}`}
                        title="Toggle Best Seller"
                      >
                        Best
                      </button>
                      <button
                        onClick={() => toggleProductTag(product._id, 'isNewFace', product.isNewFace)}
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md transition-all border ${product.isNewFace ? 'bg-amber-400 text-zinc-900 border-amber-400 shadow-sm' : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600'}`}
                        title="Toggle New Face"
                      >
                        New
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(product)} className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-amber-500 hover:bg-amber-50 transition-colors">
                           <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => triggerDelete(product._id)} className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                           <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cụm Điều Khiển Phân Trang */}
        {totalPages > 1 && (
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
             Trang {currentPage} / {totalPages}
          </p>
          <div className="flex gap-2">
             <button 
                onClick={prevPage} disabled={currentPage === 1}
                className={`p-2 rounded-lg flex items-center justify-center transition-colors border shadow-sm ${currentPage === 1 ? 'bg-zinc-100 border-transparent text-zinc-300 cursor-not-allowed' : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-100 hover:border-zinc-300 active:scale-95'}`}>
                 <span className="material-symbols-outlined">chevron_left</span>
             </button>
             <button 
                onClick={nextPage} disabled={currentPage === totalPages}
                className={`p-2 rounded-lg flex items-center justify-center transition-colors border shadow-sm ${currentPage === totalPages ? 'bg-zinc-100 border-transparent text-zinc-300 cursor-not-allowed' : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-100 hover:border-zinc-300 active:scale-95'}`}>
                 <span className="material-symbols-outlined">chevron_right</span>
             </button>
          </div>
        </div>
        )}
      </div>

      {/* CRUD Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center fade-in text-zinc-900">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => { setIsModalOpen(false); resetForm(); }}></div>
          <div className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-[0_20px_60px_rgba(0,0,0,0.2)] mx-4 max-h-[90vh] overflow-y-auto transform scale-100 transition-transform">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-extrabold text-2xl tracking-tight text-zinc-900">
                   {isEditMode ? 'Cập Nhật Món Thực Đơn' : 'Khai Báo Món Mới'}
                </h3>
                <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
            </div>
            
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
               <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Tên sản phẩm *</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} type="text" className="w-full border border-zinc-200 p-4 rounded-xl outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 bg-zinc-50 hover:bg-white transition-all font-bold text-sm text-zinc-900 shadow-sm" placeholder="VD: Matcha Yuzu Highball" />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Phân loại hàng</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-amber-400 bg-zinc-50 text-sm font-bold text-zinc-900 transition-colors cursor-pointer">
                      <option value="brewed">Đồ uống pha chế</option>
                      <option value="bottled">Sản phẩm Đóng chai</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Danh mục món</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-amber-400 bg-zinc-50 text-sm font-bold text-zinc-900 transition-colors cursor-pointer">
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Giá niêm yết (VNĐ)</label>
                    <input required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} type="number" className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-amber-400 bg-zinc-50 text-sm font-bold text-zinc-900" placeholder="60000" />
                  </div>
                  {formData.type === 'bottled' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Số lượng tồn kho</label>
                      <input required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} type="number" className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-amber-400 bg-amber-50 text-sm font-bold text-amber-900" placeholder="Nhập số lượng" />
                    </div>
                  )}
                </div>

               <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Mô tả giới thiệu (Tùy chọn)</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-zinc-200 p-4 rounded-xl outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 bg-zinc-50 hover:bg-white transition-all text-sm text-zinc-900 shadow-sm resize-none h-24" placeholder="Viết mô tả hấp dẫn về hương vị của món uống này..."></textarea>
               </div>
               <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Ảnh sản phẩm</label>
                  <div
                    onClick={() => document.getElementById('product-file-input').click()}
                    className="relative w-full h-40 rounded-xl border-2 border-dashed border-zinc-200 hover:border-amber-400 cursor-pointer overflow-hidden bg-zinc-50 transition-colors flex items-center justify-center"
                  >
                    {(imagePreview || formData.image) ? (
                      <img src={imagePreview || formData.image} alt="Preview" className="h-full object-contain" />
                    ) : (
                      <div className="text-center">
                        <span className="material-symbols-outlined text-[32px] text-zinc-300 mb-1 block">cloud_upload</span>
                        <p className="text-xs font-bold text-zinc-400">Click để chọn ảnh</p>
                        <p className="text-[10px] text-zinc-300 mt-0.5">JPG, PNG, WEBP</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="product-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }}
                  />
               </div>
               {/* ── Variant Editor ──────────────────────────────────────── */}
               <div className="border border-zinc-100 rounded-xl p-4 space-y-5 bg-zinc-50/50">
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                   <span className="material-symbols-outlined text-[14px]">tune</span> Phân loại (Size / Options)
                 </p>

                 {/* Size variants */}
                 <div>
                   <p className="text-xs font-bold text-zinc-600 mb-2">📐 Kích cỡ (Size)</p>
                   <div className="flex flex-wrap gap-2 mb-3">
                     {sizes.map((s, i) => (
                       <div key={i} className="flex items-center gap-1 bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-700">
                         <span>{s.label}</span>
                         {s.extraPrice > 0 && <span className="text-zinc-400">+{Number(s.extraPrice).toLocaleString()}đ</span>}
                         <button type="button" onClick={() => setSizes(prev => prev.filter((_, idx) => idx !== i))} className="ml-1 text-zinc-300 hover:text-red-500 transition-colors">
                           <span className="material-symbols-outlined text-[14px]">close</span>
                         </button>
                       </div>
                     ))}
                   </div>
                   <div className="flex gap-2">
                     <input
                       type="text" placeholder="Label (M, L...)" value={newSizeLabel}
                       onChange={e => setNewSizeLabel(e.target.value)}
                       className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-amber-400 bg-white"
                     />
                     <input
                       type="number" placeholder="+Giá (đ)" value={newSizePrice}
                       onChange={e => setNewSizePrice(e.target.value)}
                       className="w-28 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-amber-400 bg-white"
                     />
                     <button
                       type="button"
                       onClick={() => {
                         if (!newSizeLabel.trim()) return;
                         setSizes(prev => [...prev, { label: newSizeLabel.trim(), extraPrice: Number(newSizePrice) || 0 }]);
                         setNewSizeLabel(''); setNewSizePrice('');
                       }}
                       className="px-3 py-2 bg-amber-500 text-zinc-900 rounded-lg font-bold text-sm hover:bg-amber-400 transition-colors"
                     >
                       <span className="material-symbols-outlined text-[16px]">add</span>
                     </button>
                   </div>
                 </div>

                 {/* Option groups */}
                 <div>
                   <p className="text-xs font-bold text-zinc-600 mb-2">🎛️ Nhóm tuỳ chọn (Ngọt, Đá...)</p>
                   <div className="space-y-2 mb-3">
                     {optionGroups.map((g, i) => (
                       <div key={i} className="flex items-center justify-between bg-white border border-zinc-200 rounded-lg px-3 py-2">
                         <div>
                           <span className="text-xs font-black text-zinc-700">{g.name}</span>
                           <span className="text-[10px] text-zinc-400 ml-2">{g.choices.join(', ')}</span>
                         </div>
                         <button type="button" onClick={() => setOptionGroups(prev => prev.filter((_, idx) => idx !== i))} className="text-zinc-300 hover:text-red-500 transition-colors">
                           <span className="material-symbols-outlined text-[16px]">delete</span>
                         </button>
                       </div>
                     ))}
                   </div>
                   <div className="flex flex-col gap-2">
                     <div className="flex gap-2">
                       <input
                         type="text" placeholder="Tên nhóm (VD: Ngọt, Đá)" value={newGroupName}
                         onChange={e => setNewGroupName(e.target.value)}
                         className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-amber-400 bg-white"
                       />
                     </div>
                     <div className="flex gap-2">
                       <input
                         type="text" placeholder="Lựa chọn, cách nhau bởi dấu phẩy (Ít, Bình thường, Nhiều, Không)" value={newGroupChoices}
                         onChange={e => setNewGroupChoices(e.target.value)}
                         className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-amber-400 bg-white"
                       />
                       <button
                         type="button"
                         onClick={() => {
                           if (!newGroupName.trim() || !newGroupChoices.trim()) return;
                           const choices = newGroupChoices.split(',').map(c => c.trim()).filter(Boolean);
                           setOptionGroups(prev => [...prev, { name: newGroupName.trim(), choices, defaultChoice: choices[0] || '' }]);
                           setNewGroupName(''); setNewGroupChoices('');
                         }}
                         className="px-3 py-2 bg-zinc-900 text-white rounded-lg font-bold text-sm hover:bg-zinc-700 transition-colors"
                       >
                         <span className="material-symbols-outlined text-[16px]">add</span>
                       </button>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="pt-6 border-t border-zinc-100 flex justify-end gap-3 w-full">
                  <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="flex-1 py-4 font-bold text-zinc-500 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors text-sm">Trở Lại</button>
                  <button type="submit" className="flex-1 py-4 font-bold bg-amber-400 text-zinc-900 rounded-xl shadow-lg hover:bg-amber-500 hover:-translate-y-0.5 transition-all w-full text-sm">{isEditMode ? 'Lưu Thay Đổi' : 'Lưu Vào Database'}</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
