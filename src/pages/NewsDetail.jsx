import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import 'quill/dist/quill.snow.css';

// Extract Headings for TOC from HTML
const extractHeadings = (htmlContent) => {
  if (!htmlContent) return [];
  const regex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  const headings = [];
  let match;
  while ((match = regex.exec(htmlContent)) !== null) {
      const title = match[2].replace(/<\/?[^>]+(>|$)/g, "").trim(); 
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      headings.push({ title, id: slug });
  }
  return headings;
};

// Inject IDs into headings for anchor linking
const injectIdsIntoHeadings = (html) => {
  if (!html) return '';
  return html.replace(/<h([1-6])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, content) => {
     const cleanTitle = content.replace(/<\/?[^>]+(>|$)/g, "").trim();
     const slug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
     return `<h${level}${attrs} id="${slug}">${content}</h${level}>`;
  });
};

const NewsDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/slug/${slug}`);
        setPost(res.data.post);
        setRecentPosts(res.data.recentPosts);
        window.scrollTo(0, 0);
      } catch (err) {
        console.error(err);
        navigate('/news');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center h-[50vh] pt-32">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  const headings = extractHeadings(post.content);

  const handleScrollTo = (id) => {
     const el = document.getElementById(id);
     if (el) {
         // header offset
         const y = el.getBoundingClientRect().top + window.scrollY - 100;
         window.scrollTo({ top: y, behavior: 'smooth' });
     }
  };

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 bg-zinc-50 min-h-screen font-body">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="flex flex-col lg:flex-row gap-12 items-start relative">
             
             {/* Left Column: Main Content */}
             <article className="lg:w-[70%] bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-zinc-200">
                {/* Breadcrumb / Category */}
                <div className="flex items-center text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-6 gap-2">
                   <Link to="/" className="hover:text-amber-500">Trang chủ</Link>
                   <span>/</span>
                   <Link to="/news" className="hover:text-amber-500 text-amber-600">Tin tức</Link>
                </div>

                <h1 className="font-headline text-3xl md:text-5xl font-black text-zinc-900 leading-[1.15] tracking-tight mb-8">
                  {post.title}
                </h1>

                {/* Author & Meta */}
                <div className="flex items-center gap-4 mb-8 border-b border-zinc-100 pb-6">
                   <div className="w-12 h-12 bg-amber-500 rounded-full font-black text-white flex items-center justify-center text-xl shadow-lg border-2 border-white">
                      {post.author.charAt(0)}
                   </div>
                   <div>
                      <p className="font-black text-zinc-900 text-sm">{post.author}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5 flex items-center gap-3">
                         <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                         <span>•</span>
                         <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">visibility</span> {post.views}</span>
                      </p>
                   </div>
                </div>

                {/* Table of Contents (Xem nhanh) */}
                {headings.length > 0 && (
                   <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 mb-10 shadow-inner">
                      <div className="flex items-center justify-between cursor-pointer mb-4">
                         <h4 className="font-headline font-black text-lg text-zinc-800 uppercase tracking-tight">Xem nhanh mục lục</h4>
                         <span className="text-[10px] uppercase font-black tracking-widest text-amber-600 bg-amber-100 px-3 py-1 rounded-full">{headings.length} phân mục</span>
                      </div>
                      <ul className="space-y-3">
                         {headings.map((h, i) => (
                           <li key={i}>
                             <button 
                               onClick={() => handleScrollTo(h.id)}
                               className="text-left text-[14px] font-bold text-zinc-600 hover:text-amber-600 hover:pl-2 transition-all duration-300 flex items-start gap-2 group"
                             >
                                <span className="text-amber-400 font-black mt-1 text-[10px]">■</span>
                                {h.title}
                             </button>
                           </li>
                         ))}
                      </ul>
                   </div>
                )}

                {/* Main Richtext Content */}
                <div 
                   className="article-content ql-editor px-0"
                   dangerouslySetInnerHTML={{ __html: injectIdsIntoHeadings(post.content) }}
                ></div>

             </article>

             {/* Right Column: Sidebar */}
             <aside className="lg:w-[30%] space-y-8 sticky top-28">
                
                {/* Tags widget */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
                   <h3 className="font-headline text-lg font-black text-zinc-900 mb-5 relative inline-block">
                      Xu hướng
                      <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-amber-500 rounded-full"></span>
                   </h3>
                   <div className="flex flex-wrap gap-2">
                       {post.tags && post.tags.length > 0 ? (
                          post.tags.map((tag, idx) => (
                             <span key={idx} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${idx % 3 === 0 ? 'bg-amber-100 text-amber-700' : idx % 3 === 1 ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'} hover:opacity-80 cursor-pointer transition-opacity`}>
                               #{tag}
                             </span>
                          ))
                       ) : (
                          <span className="text-xs text-zinc-400 font-bold">Không có thẻ tag nào</span>
                       )}
                   </div>
                </div>

                {/* Trending Posts widget */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
                   <h3 className="font-headline text-lg font-black text-zinc-900 mb-6 relative inline-block">
                      Bài viết mới
                      <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-blue-500 rounded-full"></span>
                   </h3>
                   <div className="space-y-5">
                      {recentPosts.length === 0 ? (
                         <p className="text-xs text-zinc-400 font-bold">Chưa có bài viết khác.</p>
                      ) : (
                         recentPosts.map((rp) => (
                            <Link to={`/news/${rp.slug}`} key={rp._id} className="flex gap-4 group items-center">
                               <img 
                                  src={rp.thumbnail} 
                                  alt="" 
                                  className="w-20 h-20 rounded-xl object-cover shrink-0 block border border-zinc-100 group-hover:border-amber-300 transition-colors"
                                  loading="lazy"
                               />
                               <div>
                                  <h4 className="text-[13px] font-bold text-zinc-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                                     {rp.title}
                                  </h4>
                                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-2">{new Date(rp.createdAt).toLocaleDateString('vi-VN')}</p>
                               </div>
                            </Link>
                         ))
                      )}
                   </div>
                </div>

             </aside>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        /* Scoped styles for article markdown */
        .article-content a { color: #d97706; text-decoration: underline; }
        .article-content img { max-width: 100%; height: auto; border-radius: 1rem; margin: 2rem 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .article-content h1, .article-content h2, .article-content h3 { font-family: 'Inter', sans-serif; font-weight: 900; margin-top: 2rem; margin-bottom: 1rem; color: #18181b; }
        .article-content h2 { color: #b45309; }
      `}</style>
    </>
  );
};

export default NewsDetail;
