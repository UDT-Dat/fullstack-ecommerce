import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useScrollReveal } from "../hooks/useScrollReveal";

const NewFace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionRef, isVisible] = useScrollReveal(0.1);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => setProducts(res.data.filter((p) => p.isNewFace)))
      .catch((err) => console.error("NewFace fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Luôn render section để sectionRef được gắn vào DOM ngay từ đầu,
  // tránh IntersectionObserver bị miss khi data về sau.
  // Chỉ ẩn hoàn toàn sau khi load xong mà không có data.
  if (!loading && products.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={`bg-zinc-950 text-white overflow-hidden transition-all duration-700 ${loading ? "py-0" : "py-24"} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
    >
      {/* Chỉ hiện nội dung khi đã load xong và có data */}
      {!loading && products.length > 0 && (
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-amber-500 font-bold tracking-widest text-[10px] uppercase mb-3 flex items-center gap-2">
                <span className="w-8 h-px bg-amber-500" /> MỚI RA MẮT
              </span>
              <h2 className="text-4xl md:text-5xl font-headline font-black text-white uppercase tracking-tighter">
                Gương Mặt Mới
              </h2>
            </div>
            <Link
              className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b-2 border-white/30 pb-1 hover:text-amber-500 hover:border-amber-500 transition-colors"
              to="/menu"
            >
              <span>Xem tất cả</span>
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </Link>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-6 px-6">
            {products.slice(0, 10).map((product, idx) => (
              <Link
                to={`/product/${product._id}`}
                key={product._id}
                className="group flex-shrink-0 w-[260px] md:w-[300px] snap-start bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/50 transition-all duration-500 relative overflow-hidden rounded-2xl"
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                <div className="absolute top-4 left-4 z-20 bg-amber-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-lg rounded">
                  MỚI
                </div>

                <div className="relative aspect-square overflow-hidden bg-zinc-900">
                  <img
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    src={product.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                </div>

                <div className="p-5">
                  <h4 className="font-headline font-black text-base text-white mb-2 uppercase tracking-tight group-hover:text-amber-500 transition-colors line-clamp-1">
                    {product.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <p className="text-amber-500 font-black text-sm">
                      {product.price.toLocaleString()}đ
                    </p>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      {product.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </section>
  );
};

export default NewFace;
