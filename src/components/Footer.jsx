import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-zinc-200 bg-zinc-50 py-16">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="text-lg font-bold text-zinc-900">Citrus Stream</div>
          <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">
            &copy; 2024 Citrus Stream. Tinh hoa từ thiên nhiên. Hệ thống cửa hàng trà và nước ép trái cây chất lượng cao hàng đầu.
          </p>
          <div className="flex space-x-4">
            <a className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-600 hover:bg-primary hover:text-white transition-colors" href="#">
              <span className="material-symbols-outlined text-xl">social_leaderboard</span>
            </a>
            <a className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-600 hover:bg-primary hover:text-white transition-colors" href="#">
              <span className="material-symbols-outlined text-xl">camera</span>
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">Khám phá</h4>
            <nav className="flex flex-col space-y-2">
              <a className="text-xs text-zinc-500 hover:text-amber-500 transition-colors" href="#">Về chúng tôi</a>
              <a className="text-xs text-zinc-500 hover:text-amber-500 transition-colors" href="#">Thực đơn</a>
              <a className="text-xs text-zinc-500 hover:text-amber-500 transition-colors" href="#">Cửa hàng</a>
            </nav>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">Hỗ trợ</h4>
            <nav className="flex flex-col space-y-2">
              <a className="text-xs text-zinc-500 hover:text-amber-500 transition-colors" href="#">Chính sách bảo mật</a>
              <a className="text-xs text-zinc-500 hover:text-amber-500 transition-colors" href="#">Điều khoản sử dụng</a>
              <a className="text-xs text-zinc-500 hover:text-amber-500 transition-colors" href="#">Liên hệ</a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
