import React from 'react';
import { useNavigate } from 'react-router-dom';

const Subscription = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-[3rem] overflow-hidden bg-zinc-950 text-white p-12 md:p-24 shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            <img alt="Background Texture" className="w-full h-full object-cover" src="/src/image/coffee-bg.png" onError={(e) => e.target.style.display='none'} />
          </div>
          <div className="relative z-10 max-w-2xl">
            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black tracking-widest text-[10px] px-4 py-2 rounded-full uppercase mb-8 inline-block shadow-sm">Thẻ Hội Viên VIP</span>
            <h2 className="text-5xl md:text-7xl font-headline font-black mb-6 tracking-tighter uppercase leading-none">Chương trình <span className="text-amber-500">Khách Hàng</span></h2>
            <p className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed font-bold tracking-wide">
               Khởi tạo hạng mức mới, gặt hái chiết khấu sâu trọn đời lên đến <span className="text-amber-500 font-extrabold">-15%</span> khi tích lũy đơn hàng.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md">
               <button onClick={() => navigate('/promos')} className="px-10 py-5 bg-amber-500 text-zinc-950 font-black rounded-full hover:bg-white hover:scale-105 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all uppercase tracking-widest flex items-center justify-center gap-3 w-max">
                  Khám phá Đặc Quyền 
                  <span className="material-symbols-outlined">arrow_forward</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Subscription;
