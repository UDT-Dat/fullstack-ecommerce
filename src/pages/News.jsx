import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const News = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API_URL + '/api/posts');
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
      <Navbar />
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
        <header className="mb-12 border-b-2 border-amber-500 pb-4 inline-block">
          <h1 className="font-headline text-4xl md:text-5xl font-black text-amber-900 tracking-tighter uppercase">
            TIN TỨC & SỰ KIỆN
          </h1>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 px-4 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
            <span className="material-symbols-outlined text-6xl text-zinc-300 mb-4 block">article</span>
            <h2 className="text-xl font-bold text-zinc-600">Chưa có bảng tin nào</h2>
            <p className="text-sm text-zinc-400 mt-2">Đang chờ cập nhật từ hệ thống...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <article key={post._id} className="group flex flex-col transition-all duration-300 hover:-translate-y-2">
                <Link to={`/news/${post.slug}`} className="block relative aspect-[16/9] overflow-hidden rounded-2xl shadow-md mb-5 bg-zinc-100">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
                  <img 
                    src={post.thumbnail} 
                    alt={post.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Views badge superimposed on image top right */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-zinc-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-20 shadow flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[14px]">visibility</span> {post.views}
                  </div>
                </Link>
                <div className="flex flex-col flex-1">
                  <h3 className="font-headline text-2xl font-black text-zinc-900 leading-tight mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
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
                    <span className="mx-2 text-zinc-300">•</span>
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    <span className="truncate">{post.author}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default News;
