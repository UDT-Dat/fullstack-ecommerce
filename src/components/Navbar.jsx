import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';

export const TIER_BADGE = {
  'Đồng':      { icon: 'military_tech', cls: 'bg-orange-500 text-white', title: 'Hội viên Đồng' },
  'Vàng':      { icon: 'social_leaderboard', cls: 'bg-amber-500 text-zinc-900', title: 'Hội viên Vàng' },
  'Kim Cương': { icon: 'diamond', cls: 'bg-blue-500 text-white', title: 'Hội viên Kim Cương' },
};

const removeAccents = (str) => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};


const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { getCartCount } = useContext(CartContext);
  const cartCount = getCartCount();
  const isLoggedIn = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [memberBadge, setMemberBadge] = useState(null);

  // Search functionality state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const searchRef = useRef(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch products when search is opened
  useEffect(() => {
    if (isSearchOpen && products.length === 0) {
      axios.get('http://localhost:5000/api/products')
        .then(res => setProducts(res.data))
        .catch(err => console.error(err));
    }
  }, [isSearchOpen, products.length]);

  const filteredProducts = products.filter(p => {
    if (!searchQuery.trim()) return false;
    const q = removeAccents(searchQuery.trim());
    return removeAccents(p.title).includes(q);
  });

  useEffect(() => {
    if (!isLoggedIn) return;
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/users/membership', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.tier && TIER_BADGE[res.data.tier]) {
        setMemberBadge(res.data.tier);
      }
    }).catch(() => {});
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };
  
  return (
    <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-white">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-amber-500 uppercase flex items-center gap-2">
           <span className="material-symbols-outlined font-black">liquor</span>
           Citrus Stream
        </Link>
        <nav className="hidden md:flex space-x-8 items-center font-headline text-sm font-medium tracking-wide">
          <Link 
            className={`transition-all duration-300 flex items-center gap-2 uppercase tracking-widest text-xs ${location.pathname.startsWith('/menu') ? 'text-amber-500 font-black drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] scale-105' : 'text-zinc-400 hover:text-amber-500'}`} 
            to="/menu"
          >
             <span className="material-symbols-outlined text-[18px]">restaurant_menu</span> Menu
          </Link>
          <Link 
            className={`transition-all duration-300 flex items-center gap-2 uppercase tracking-widest text-xs ${location.pathname.startsWith('/news') ? 'text-amber-500 font-black drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] scale-105' : 'text-zinc-400 hover:text-amber-500'}`} 
            to="/news"
          >
             <span className="material-symbols-outlined text-[18px]">newspaper</span> Tin tức
          </Link>
          <Link 
            className={`transition-all duration-300 flex items-center gap-2 uppercase tracking-widest text-xs ${location.pathname.startsWith('/promos') ? 'text-amber-500 font-black drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] scale-105' : 'text-zinc-400 hover:text-amber-500'}`} 
            to="/promos"
          >
             <span className="material-symbols-outlined text-[18px]">local_activity</span> Khuyến mãi
          </Link>
          <Link 
            className={`transition-all duration-300 flex items-center gap-2 uppercase tracking-widest text-xs ${location.pathname.startsWith('/checkout') ? 'text-amber-500 font-black drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] scale-105' : 'text-zinc-400 hover:text-amber-500'}`} 
            to="/checkout"
          >
             <span className="material-symbols-outlined text-[18px]">credit_card</span> Thanh Toán
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <div className="flex items-center" ref={searchRef}>
             <div className={`relative flex items-center bg-zinc-800 rounded-full border transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isSearchOpen ? 'w-56 sm:w-[240px] px-3 py-1.5 border-zinc-600 opacity-100 ml-2' : 'w-0 opacity-0 px-0 py-1.5 border-transparent overflow-hidden pointer-events-none'}`}>
                 <input 
                   type="text" 
                   autoFocus={isSearchOpen}
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   className={`bg-transparent text-sm text-white placeholder-zinc-400 outline-none w-full transition-opacity duration-300 ${isSearchOpen ? 'opacity-100 delay-100' : 'opacity-0'}`}
                   placeholder="Tìm kiếm..."
                 />
                 <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className={`ml-2 text-zinc-400 hover:text-white material-symbols-outlined text-[18px] transition-opacity duration-300 ${isSearchOpen ? 'opacity-100 delay-100' : 'opacity-0'}`}>
                   close
                 </button>
                 
                 {/* search dropdown */}
                 {(isSearchOpen && searchQuery.trim().length > 0) && (
                   <div className="absolute top-12 left-0 w-full bg-[#18181b] border border-zinc-700 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] z-[60] py-2">
                     {filteredProducts.length > 0 ? (
                       <div className="max-h-[60vh] overflow-y-auto custom-scrollbar px-2 space-y-1">
                         {filteredProducts.map(p => (
                           <Link key={p._id} to={`/product/${p._id}`} onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="flex items-center gap-3 p-2 bg-zinc-800/40 hover:bg-zinc-700/60 border border-zinc-700/50 rounded-xl transition-all group">
                             <img src={p.image} alt={p.title} className="w-12 h-12 rounded-lg object-cover border border-zinc-600 group-hover:border-amber-500/50 transition-colors" />
                             <div className="flex-1 overflow-hidden">
                               <p className="text-sm font-bold text-zinc-100 group-hover:text-white truncate">{p.title}</p>
                               <p className="text-[13px] text-amber-500 font-black mt-0.5">{p.price.toLocaleString()}đ</p>
                             </div>
                           </Link>
                         ))}
                       </div>
                     ) : (
                       <div className="p-6 text-center text-zinc-400 text-sm flex flex-col items-center gap-2">
                         <span className="material-symbols-outlined text-4xl text-zinc-600">search_off</span>
                         <p>Không tìm thấy sản phẩm.</p>
                       </div>
                     )}
                   </div>
                 )}
              </div>

              <button 
                onClick={() => setIsSearchOpen(true)} 
                className={`p-2 hover:bg-white/10 rounded-full text-zinc-300 hover:text-white flex items-center justify-center transition-all duration-300 ${isSearchOpen ? 'hidden' : 'block'}`}
              >
                <span className="material-symbols-outlined">search</span>
              </button>
          </div>
          <Link to="/checkout" className="p-2 hover:bg-white/10 rounded-full transition-transform active:scale-95 text-zinc-300 hover:text-white relative inline-flex items-center justify-center">
            <span className="material-symbols-outlined">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-zinc-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0a0a0a]">
                {cartCount}
              </span>
            )}
          </Link>
          {isLoggedIn ? (
            <div className="relative">
              {/* Avatar with rank badge */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full bg-amber-500 text-zinc-950 font-black uppercase overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.5)] border-2 border-white/20 focus:outline-none flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {user.name ? user.name.charAt(0) : 'U'}
                </button>
                {/* Membership rank badge */}
                {memberBadge && TIER_BADGE[memberBadge] && (
                  <div
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center shadow-lg ${TIER_BADGE[memberBadge].cls}`}
                    title={TIER_BADGE[memberBadge].title}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>{TIER_BADGE[memberBadge].icon}</span>
                  </div>
                )}
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-4 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 fade-in">
                  <div className="px-4 py-3 border-b border-zinc-800">
                     <p className="text-sm font-bold text-white truncate">{user.name}</p>
                     <div className="flex items-center gap-2 mt-1">
                       <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{user.role}</p>
                       {memberBadge && (
                         <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${TIER_BADGE[memberBadge]?.cls}`}>
                           {memberBadge}
                         </span>
                       )}
                     </div>
                  </div>
                  <div className="py-2">
                    <Link to="/profile" className="px-5 py-2 hover:bg-white/5 text-sm font-medium text-zinc-300 hover:text-white flex items-center gap-3 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">person</span> Hồ sơ cá nhân
                    </Link>
                    <Link to="/promos" className="px-5 py-2 hover:bg-white/5 text-sm font-medium text-zinc-300 hover:text-white flex items-center gap-3 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">local_activity</span> Hội viên
                    </Link>
                    {(user.role === 'admin' || user.role === 'staff') && (
                      <Link to="/admin" className="px-5 py-2 hover:bg-amber-500/10 text-sm font-bold text-amber-500 flex items-center gap-3 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span> Quản trị Admin
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-zinc-800 py-1">
                    <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-5 py-2 hover:bg-red-500/10 hover:text-red-500 text-sm font-medium text-zinc-400 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">logout</span> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="px-6 py-2.5 bg-amber-500 text-zinc-950 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white transition-colors shadow-lg shadow-amber-500/20">Đăng nhập</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
