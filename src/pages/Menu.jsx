import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CartContext } from "../context/CartContext";
import { useContext } from "react";
import { useToast } from "../context/ToastContext";
import ProductVariantPicker from "../components/ProductVariantPicker";
import menuHeaderBg from "../../image/banner-home_cung-cap-ca-phe-rang_350303b870594d3db026e540b8744caa.jpg";

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [user, setUser] = useState(null);
  const [isMember, setIsMember] = useState(true);
  const [pickerProduct, setPickerProduct] = useState(null); // product being configured
  const { cartItems, addToCart } = useContext(CartContext);
  const { showToast } = useToast();

  // Check stock gate for bottled products
  const checkStock = (product, quantity = 1) => {
    if (product.type === "bottled") {
      const cartItem = cartItems.find((item) => item._id === product._id);
      const currentQty = cartItem ? cartItem.quantity : 0;
      if (currentQty + quantity > product.stock) {
        showToast(`Úi, chỉ còn ${product.stock} sản phẩm trong kho!`, "error");
        return false;
      }
    }
    return true;
  };

  // Open picker if product has variants, otherwise add directly
  const handleAddClick = (product, e) => {
    if (e) e.preventDefault();
    const hasVariants =
      product.sizes?.length > 0 || product.options?.length > 0;
    if (hasVariants) {
      setPickerProduct(product);
    } else {
      if (!checkStock(product)) return;
      addToCart(product, 1);
      showToast(`Đã thêm ${product.title} vào giỏ`, "success");
    }
  };

  const handlePickerConfirm = ({
    size,
    extraPrice,
    selectedOptions,
    quantity,
  }) => {
    if (!checkStock(pickerProduct, quantity)) return;
    addToCart(pickerProduct, quantity, size, extraPrice, selectedOptions);
    showToast(`Đã thêm ${pickerProduct.title} vào giỏ!`, "success");
    setPickerProduct(null);
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (userStr) setUser(JSON.parse(userStr));

    if (token) {
      axios
        .get(import.meta.env.VITE_API_URL + "/api/users/membership", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setIsMember(res.data.isMember))
        .catch(() => {});
    } else {
      setIsMember(false);
    }

    const fetchProducts = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_API_URL + "/api/products");
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const displayProducts = products.filter((p) => {
    const matchSearch =
      !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const categories = products.reduce((acc, p) => {
    const cat = p.category || "Khác";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const isOutOfStock = (p) => p.type === "bottled" && p.stock <= 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#fafafa] pb-24">
        {/* Dark Hero Header */}
        <section className="relative pt-28 pb-10 bg-[#0a0a0a] overflow-hidden mb-8">
          <div className="absolute inset-0 z-0 opacity-20">
            <img
              src={menuHeaderBg}
              alt="Menu Header"
              className="w-full h-full object-cover filter grayscale mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]"></div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <span className="text-amber-500 font-bold tracking-widest text-[10px] uppercase mb-4 flex items-center justify-center gap-4">
              <span className="w-12 h-px bg-amber-500/50"></span> Khám phá{" "}
              <span className="w-12 h-px bg-amber-500/50"></span>
            </span>
            <h1 className="font-headline text-4xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-2xl mb-4">
              THỰC ĐƠN <br />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">
                HẢO HẠNG
              </span>
            </h1>
            <p className="text-zinc-400 max-w-2xl mx-auto text-base leading-relaxed">
              Tuyển chọn những hương vị tinh túy nhất từ thiên nhiên, mang lại
              cảm giác sảng khoái và đậm đà trong từng ngụm thưởng thức.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-8">
            <section className="bg-white p-6 border border-zinc-200 shadow-sm rounded-2xl">
              <h3 className="font-headline font-black text-sm uppercase tracking-[0.2em] mb-6 text-zinc-900 border-l-4 border-amber-500 pl-3">
                Danh Mục
              </h3>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`flex items-center justify-between text-sm font-bold px-4 py-3 rounded-xl transition-all group ${selectedCategory === "all" ? "bg-zinc-950 text-white shadow-md" : "text-zinc-500 hover:text-zinc-900 hover:bg-amber-50"}`}
                >
                  <span className="flex items-center gap-3 flex-1 overflow-hidden mr-2">
                    <span
                      className={`material-symbols-outlined shrink-0 text-[18px] ${selectedCategory === "all" ? "text-amber-500" : "text-zinc-400 group-hover:text-amber-500"}`}
                    >
                      local_cafe
                    </span>
                    <span className="truncate text-left">Tất Cả</span>
                  </span>
                  <span
                    className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-black ${selectedCategory === "all" ? "bg-amber-500 text-zinc-950" : "bg-zinc-100 text-zinc-400"}`}
                  >
                    {products.length}
                  </span>
                </button>
                {Object.entries(categories).map(([catName, count]) => (
                  <button
                    key={catName}
                    onClick={() => setSelectedCategory(catName)}
                    className={`flex items-center justify-between text-sm font-bold px-4 py-3 rounded-xl transition-all group ${selectedCategory === catName ? "bg-zinc-950 text-white shadow-md" : "text-zinc-500 hover:text-zinc-900 hover:bg-amber-50"}`}
                  >
                    <span className="flex items-center gap-3 flex-1 overflow-hidden mr-2">
                      <span
                        className={`material-symbols-outlined shrink-0 text-[18px] ${selectedCategory === catName ? "text-amber-500" : "text-zinc-400 group-hover:text-amber-500"}`}
                      >
                        local_drink
                      </span>
                      <span className="truncate text-left" title={catName}>
                        {catName}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-black ${selectedCategory === catName ? "bg-amber-500 text-zinc-950" : "bg-zinc-100 text-zinc-400"}`}
                    >
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {!isMember && (
              <section className="hidden md:block p-8 bg-zinc-950 text-white rounded-2xl border-2 border-amber-500/20 relative overflow-hidden group hover:border-amber-500 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative z-10 text-left">
                  <span className="material-symbols-outlined text-4xl text-amber-500 mb-4">
                    diamond
                  </span>
                  <p className="font-headline font-black text-xl uppercase tracking-widest mb-2">
                    Gói Hội Viên
                  </p>
                  <p className="text-xs font-medium text-zinc-400 mb-6 leading-relaxed">
                    Ưu đãi 15% trọn đời và giao hàng miễn phí mọi hóa đơn.
                  </p>
                  <Link
                    className="inline-block px-6 py-3 bg-amber-500 text-zinc-950 font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-amber-500/20"
                    to="/promos"
                  >
                    Đăng ký ngay
                  </Link>
                </div>
              </section>
            )}
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            <div className="mb-8 flex items-center bg-white p-2 rounded-2xl border border-zinc-200 shadow-sm focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all">
              <span className="material-symbols-outlined text-zinc-400 px-4">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm đồ uống yêu thích của bạn..."
                className="w-full bg-transparent outline-none py-3 text-sm font-bold text-zinc-900 placeholder:text-zinc-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-6">
              {displayProducts.map((product) => {
                const outOfStock = isOutOfStock(product);
                const hasVariants =
                  product.sizes?.length > 0 || product.options?.length > 0;
                return (
                  <div
                    key={product._id}
                    className="group cursor-pointer bg-white p-4 border border-zinc-100 hover:border-amber-500 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden rounded-2xl flex flex-col h-full"
                  >
                    <Link
                      to={`/product/${product._id}`}
                      className="block relative"
                    >
                      <div
                        className={`relative aspect-[10/11] overflow-hidden mb-6 bg-zinc-50 rounded-xl border border-zinc-50 group-hover:border-amber-100 transition-colors ${outOfStock ? "grayscale opacity-50" : ""}`}
                      >
                        <img
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                          src={product.image}
                        />

                        {outOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm z-20">
                            <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 shadow-xl rotate-[-10deg] border-2 border-white/50 border-dashed">
                              Hết hàng
                            </span>
                          </div>
                        )}

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

                        {/* Hover quick-add button */}
                        {!outOfStock && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm pointer-events-none">
                            <button
                              onClick={(e) => handleAddClick(product, e)}
                              className="w-14 h-14 bg-amber-500 rounded-full shadow-2xl flex items-center justify-center text-zinc-950 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 hover:bg-white hover:scale-110 pointer-events-auto"
                            >
                              <span className="material-symbols-outlined font-black text-[20px]">
                                shopping_cart_checkout
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </Link>

                    <div
                      className={`flex flex-col flex-1 ${outOfStock ? "opacity-60" : ""}`}
                    >
                      <div className="mb-2">
                        <Link to={`/product/${product._id}`}>
                          <h3 className="font-headline font-black text-sm tracking-tight text-zinc-900 group-hover:text-amber-600 transition-colors uppercase line-clamp-1">
                            {product.title}
                          </h3>
                        </Link>
                        {/* Variant badges */}
                        {hasVariants && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {product.sizes?.map((s) => (
                              <span
                                key={s.label}
                                className="text-[9px] font-black bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded"
                              >
                                {s.label}
                              </span>
                            ))}
                            {product.options?.map((g) => (
                              <span
                                key={g.name}
                                className="text-[9px] font-black bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded"
                              >
                                {g.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2 pl-2 border-l-2 border-zinc-200 mb-4 flex-1">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-zinc-100">
                        <span className="font-headline font-black text-amber-600 text-base">
                          {product.price.toLocaleString()}đ
                        </span>
                        <button
                          disabled={outOfStock}
                          onClick={(e) => handleAddClick(product, e)}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 text-zinc-900 hover:bg-amber-500 transition-all disabled:opacity-40 disabled:hover:bg-zinc-100 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">
                            {hasVariants ? "tune" : "add"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {displayProducts.length === 0 && (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-6xl text-zinc-200 mb-4 block">
                  search_off
                </span>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
                  Không tìm thấy sản phẩm nào
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Variant picker modal */}
      {pickerProduct && (
        <ProductVariantPicker
          product={pickerProduct}
          onConfirm={handlePickerConfirm}
          onClose={() => setPickerProduct(null)}
        />
      )}
    </>
  );
};

export default Menu;
