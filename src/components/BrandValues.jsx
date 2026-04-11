import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useScrollReveal } from '../hooks/useScrollReveal';
import coffeePromoImg from '../../image/photo-1680268789390-1680268789924520178873.webp';
import teaPromoImg from '../../image/blue-lagoon-cocktail.jpg';

const BrandValues = () => {
  const [ref, isVisible] = useScrollReveal(0.1);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/posts');
        setPosts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <>
      <section className="py-20 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6">
          <header className="mb-12 border-b-2 border-amber-500 pb-4 inline-block">
            <h2 className="font-headline text-3xl md:text-4xl font-black text-amber-900 tracking-tighter uppercase">
              TIN TỨC MỚI NHẤT
            </h2>
          </header>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-sm text-zinc-400">Đang chờ cập nhật từ hệ thống...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.slice(0, 5).map(post => (
                <article key={post._id} className="group flex flex-col transition-all duration-300 hover:-translate-y-2">
                  <Link to={`/news/${post.slug}`} className="block relative overflow-hidden rounded-2xl shadow-md mb-5 bg-zinc-100">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                    <img 
                      src={post.thumbnail} 
                      alt={post.title} 
                      className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-zinc-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-20 shadow flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-[14px]">visibility</span> {post.views}
                    </div>
                  </Link>
                  <div className="flex flex-col flex-1">
                    <h3 className="font-headline text-xl font-black text-zinc-900 leading-tight mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                      <Link to={`/news/${post.slug}`}>{post.title}</Link>
                    </h3>
                    {post.summary && (
                      <p className="text-sm text-zinc-500 line-clamp-2 mb-4">
                        {post.summary}
                      </p>
                    )}
                    <div className="mt-auto flex items-center text-amber-700 text-xs font-bold uppercase tracking-widest gap-2">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          
          {posts.length > 0 && (
            <div className="mt-10 text-center">
              <Link to="/news" className="inline-block px-8 py-3 bg-amber-500 text-white font-bold text-xs tracking-widest uppercase hover:bg-zinc-950 transition-colors duration-300">
                XEM TẤT CẢ
              </Link>
            </div>
          )}
        </div>
      </section>

      <section ref={ref} className="py-20 bg-white">
      <div className={`max-w-7xl mx-auto px-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative h-[300px] md:h-[400px] overflow-hidden group cursor-pointer bg-zinc-950 rounded-2xl border-4 border-transparent hover:border-amber-500 transition-colors duration-300">
            <img src={coffeePromoImg} alt="Strong Coffee" className="absolute inset-0 w-full h-full object-cover opacity-50 filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            <div className="absolute inset-0 p-10 flex flex-col justify-end">
              <p className="text-amber-500 font-bold text-xs uppercase tracking-[0.2em] mb-2 drop-shadow-md">Tỉnh táo tức thì</p>
              <h3 className="text-white text-4xl md:text-5xl font-headline font-black mb-4 uppercase drop-shadow-md tracking-tighter">CÀ PHÊ ĐẬM VỊ</h3>
              <Link to="/menu" className="w-max px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-colors">XEM SẢN PHẨM</Link>
              <div className="absolute right-8 top-8 w-24 h-24 bg-amber-500 rounded-full flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(245,158,11,0.5)] rotate-12 group-hover:rotate-0 transition-transform duration-500 z-10">
                <span className="text-zinc-950 text-[10px] font-bold uppercase tracking-widest">Sale 01/10</span>
                <span className="text-zinc-950 font-black text-2xl leading-none mt-1">30%</span>
              </div>
            </div>
          </div>

          <div className="relative h-[300px] md:h-[400px] overflow-hidden group cursor-pointer bg-gradient-to-br from-[#df0024] to-[#800010] rounded-2xl border-4 border-transparent hover:border-white transition-colors duration-300">
            <img src={teaPromoImg} alt="Fresh Teas" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 group-hover:scale-110 group-hover:opacity-50 transition-all duration-[1.5s]" />
            <div className="absolute inset-0 p-10 flex flex-col items-center justify-center text-center">
              <p className="text-white/80 font-bold text-[10px] uppercase tracking-[0.3em] mb-4">Trải nghiệm hương vị độc bản</p>
              <h3 className="text-white text-4xl md:text-6xl font-headline font-black mb-8 uppercase tracking-tighter drop-shadow-2xl">BỘ SƯU TẬP <br/> TRÀ TƯƠI</h3>
              <Link to="/menu" className="px-10 py-4 bg-white text-[#800010] font-black uppercase tracking-widest text-xs hover:bg-zinc-950 hover:text-white transition-colors drop-shadow-xl">
                ĐẶT NGAY KẺO LỠ
              </Link>
            </div>
          </div>
        </div>
      </div>
      </section>
    </>
  );
};

export default BrandValues;
