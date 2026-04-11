import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const BestSellers = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => {
        const bestSellers = res.data.filter((p) => p.isBestSeller);
        const display = bestSellers.length >= 5 ? bestSellers : res.data;
        setProducts(display.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-zinc-950 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <span className="text-amber-500 font-bold tracking-widest text-[10px] uppercase mb-3 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-amber-500" /> NỔI BẬT NHẤT{" "}
            <span className="w-8 h-px bg-amber-500" />
          </span>
          <h2 className="text-2xl md:text-3xl font-headline font-black text-white uppercase tracking-tight">
            Best Sellers — Món Bán Chạy Nhất
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {products.map((product) => (
            <Link
              to={`/product/${product._id}`}
              key={product._id}
              className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)] transition-all duration-300"
            >
              <div className="relative aspect-square overflow-hidden bg-zinc-800/50 p-4">
                <img
                  alt={product.title}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                  src={product.image}
                />
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5 mt-1 ml-1">
                  {product.isBestSeller && (
                    <span className="bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm w-max transition-colors hover:bg-rose-600 text-center">
                      Bán chạy
                    </span>
                  )}
                  {product.isNewFace && (
                    <span className="bg-amber-500 text-zinc-950 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm w-max transition-colors hover:bg-amber-600 text-center">
                      Mới
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-bold text-sm text-white line-clamp-1 mb-1.5 group-hover:text-amber-500 transition-colors">
                  {product.title}
                </h4>
                <p className="text-amber-500 font-black text-sm mb-3">
                  {product.price.toLocaleString()} đ
                </p>
                <div className="bg-amber-500 text-zinc-900 font-bold text-xs text-center py-2.5 rounded-lg flex items-center justify-center gap-2 group-hover:bg-white transition-colors">
                  <span className="material-symbols-outlined text-[16px]">
                    shopping_cart
                  </span>
                  Đặt mua
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors border-b border-zinc-600 hover:border-amber-500 pb-1"
          >
            Xem toàn bộ menu
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
