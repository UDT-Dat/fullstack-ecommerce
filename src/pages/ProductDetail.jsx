import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CartContext } from '../context/CartContext';
import { useContext } from 'react';
import { useToast } from '../context/ToastContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeObj, setSizeObj] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const { addToCart } = useContext(CartContext);
  const { showToast } = useToast();

  const handleAddToCart = () => {
    if (product.type === 'bottled' && product.stock <= 0) {
        showToast("Xin lỗi bạn, sản phẩm này tạm hết chai!", "error");
        return;
    }
    const finalSize = product.type === 'brewed' ? (sizeObj ? sizeObj.label : 'Standard') : 'Standard';
    const extraPrice = product.type === 'brewed' ? (sizeObj ? sizeObj.extraPrice : 0) : 0;
    
    addToCart(product, quantity, finalSize, extraPrice, selectedOptions);
    showToast('Đã thêm món vào giỏ hàng!', 'success');
  };

  useEffect(() => {
    if (product) {
      if (product.sizes?.length > 0) setSizeObj(product.sizes[0]);
      else setSizeObj(null);
      
      const initOpts = {};
      if (product.options) {
        product.options.forEach(g => {
          initOpts[g.name] = g.defaultChoice || g.choices[0] || '';
        });
      }
      setSelectedOptions(initOpts);
    }
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setProduct({
          _id: id || '1',
          title: 'Trà Xanh Bưởi Hồng',
          price: 55000,
          description: 'Sự kết hợp hoàn hảo giữa cốt trà xanh thanh mát và nước ép bưởi hồng tươi ngon. Thức uống mang đến vị chua ngọt tự nhiên, giàu vitamin C và chất chống oxy hóa.',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsbMfwitjvidpBcS2ziY7ZRqwPi_qE2eWA8w8kZnvsfRk8HVzkFvjCAV6K75dsSq4o_5VqkQujOldHWyPuc3Y-_sC7F8WsJGzaGSKCmR8paaeKBo3JJnOLkcY0hSPkD4pSF75Y2RNr8ZAwh6AtGCMxTYJ5xB8RgXW0jIkSUmKiCWpOMHZCpnW07wXwD4y6UBRcx4ON1N8OY8i4GzvWMZvpPsw61sAW_24TVmVuEeMkT_x1cnPXiYtq57RbcissjptZ1uLArnZkBx1P'
        });
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div></div>;

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
        <div className="mb-12 flex items-center space-x-3 text-zinc-400 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-200 pb-4">
          <Link to="/" className="hover:text-amber-500 transition-colors">Trang chủ</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <Link to="/menu" className="hover:text-amber-500 transition-colors">Menu</Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-zinc-900">{product.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start max-w-5xl mx-auto">
          <div className="w-full lg:w-[45%] relative group bg-zinc-100 rounded-2xl p-8 flex items-center justify-center aspect-square">
            <img className={`w-full h-full object-contain drop-shadow-md ${product.stock === 0 && product.type === 'bottled' ? 'grayscale opacity-60' : ''}`} src={product.image} alt={product.title} />
              
              <div className="absolute top-6 left-6 bg-amber-500 text-zinc-950 px-4 py-2 text-[10px] font-black tracking-[0.2em] uppercase shadow-lg flex items-center gap-2 rounded-full border border-white">
                  <span className="material-symbols-outlined text-[14px]">local_cafe</span>
                  {product.type === 'bottled' ? 'Đóng Chai' : 'Pha Chế'}
              </div>
            </div>
            {product.type === 'bottled' && product.stock <= 0 && (
               <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10">
                   <div className="bg-red-600 text-white px-10 py-5 font-black uppercase tracking-widest text-xl rotate-[-10deg] shadow-2xl border-2 border-dashed border-white">
                      Tạm Hết Hàng
                   </div>
               </div>
            )}
          <div className="w-full lg:w-[55%] space-y-6 lg:pl-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 leading-[1.2] mb-2">{product.title}</h1>
              <p className="text-xl md:text-2xl font-bold text-amber-600">{product.price.toLocaleString()}đ</p>
            </div>

            <div className={`space-y-6 ${product.type === 'bottled' && product.stock <= 0 ? 'opacity-60 pointer-events-none' : ''}`}>
              {product.type === 'brewed' ? (
                 <div className="space-y-4">
                   {product.sizes && product.sizes.length > 0 && (
                     <div className="bg-transparent">
                       <label className="block text-sm font-bold text-zinc-800 mb-2">Chọn kích cỡ</label>
                       <div className="flex flex-wrap gap-2">
                         {product.sizes.map(s => (
                           <button 
                             key={s.label}
                             onClick={() => setSizeObj(s)} 
                             className={`flex flex-col items-center justify-center min-w-[90px] py-2 px-3 transition-all border rounded-md ${sizeObj?.label === s.label ? 'border-amber-600 bg-amber-600 text-white' : 'border-zinc-300 text-zinc-700 hover:border-amber-500 bg-white'}`}
                           >
                             <span className="font-bold text-base">{s.label}</span>
                             <span className="text-[11px]">{s.extraPrice > 0 ? `+${s.extraPrice.toLocaleString()}đ` : '0đ'}</span>
                           </button>
                         ))}
                       </div>
                     </div>
                   )}

                   {product.options && product.options.map(group => (
                     <div key={group.name} className="bg-transparent mt-4">
                       <label className="block text-sm font-bold text-zinc-800 mb-2">{group.name}</label>
                       <div className="flex flex-wrap gap-2">
                         {group.choices.map(choice => (
                           <button 
                             key={choice}
                             onClick={() => setSelectedOptions(prev => ({...prev, [group.name]: choice}))} 
                             className={`px-5 py-2 text-sm font-bold transition-all border rounded-md ${selectedOptions[group.name] === choice ? 'border-amber-600 bg-amber-600 text-white' : 'border-zinc-300 text-zinc-700 hover:border-amber-500 bg-white'}`}
                           >
                             {choice}
                           </button>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>
              ) : (
                 <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Tình trạng kho</p>
                    {product.stock > 0 ? (
                       <p className="font-headline font-bold text-green-600 text-lg flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          Còn {product.stock} sản phẩm
                       </p>
                    ) : (
                       <p className="font-headline font-bold text-red-600 text-lg flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px]">cancel</span>
                          Tạm hết hàng
                       </p>
                    )}
                 </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 pt-6">
                <div className="flex sm:w-48 items-center justify-between border-2 border-zinc-200 bg-white rounded-xl px-4 py-2 transition-colors focus-within:border-amber-500">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-500 transition-colors"><span className="material-symbols-outlined text-sm">remove</span></button>
                  <span className="font-black text-xl text-zinc-900 w-12 text-center">{quantity.toString().padStart(2, '0')}</span>
                  <button onClick={() => setQuantity(q => product.type === 'bottled' ? Math.min(product.stock, q + 1) : q + 1)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-500 transition-colors"><span className="material-symbols-outlined text-sm text-zinc-900">add</span></button>
                </div>
                <button 
                  onClick={handleAddToCart} 
                  disabled={product.type === 'bottled' && product.stock <= 0}
                  className={`flex-1 py-3 px-6 font-headline font-black text-[13px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-3 rounded-lg shadow-md border border-transparent ${product.type === 'bottled' && product.stock <= 0 ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border-zinc-200 shadow-none' : 'bg-amber-500 text-zinc-950 hover:bg-amber-600 shadow-amber-500/30'}`}>
                  <span className="material-symbols-outlined text-xl">shopping_cart_checkout</span>
                  <span>{product.type === 'bottled' && product.stock <= 0 ? 'Hết hàng' : `THÊM ${ ((product.price + (sizeObj ? sizeObj.extraPrice : 0)) * quantity).toLocaleString() }đ`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-40 border-t border-zinc-200 pt-20">
          <div className="grid md:grid-cols-12 gap-16 items-start">
            <div className="md:col-span-4">
              <span className="text-amber-500 font-bold tracking-widest text-[10px] uppercase mb-4 flex items-center gap-2">
                 <span className="w-8 h-px bg-amber-500"></span> THÔNG TIN <span className="w-8 h-px bg-amber-500"></span>
              </span>
              <h2 className="text-4xl md:text-5xl font-headline font-black text-zinc-900 mb-6 uppercase tracking-tighter drop-shadow-sm">Chi tiết<br/>Sản phẩm</h2>
            </div>
            <div className="md:col-span-8">
              <div className="bg-zinc-50 p-8 md:p-12 rounded-3xl border border-zinc-100 shadow-sm relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full opacity-50 blur-3xl"></div>
                <h3 className="text-xl font-headline font-black text-zinc-900 mb-4 uppercase tracking-widest">Nguồn gốc nguyên liệu</h3>
                <p className="text-lg leading-relaxed text-zinc-600 mb-4 font-medium">{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;
