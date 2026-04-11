import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';
import bgImg from '../../image/photo-1680268789390-1680268789924520178873.webp';

const CallToAction = () => {
  const [ref, isVisible] = useScrollReveal(0.15);

  return (
    <section ref={ref} className="relative py-32 text-center bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src={bgImg} alt="" className="w-full h-full object-cover opacity-10 filter grayscale mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]" />
      </div>

      <div className={`relative z-10 max-w-4xl mx-auto px-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <span className="text-amber-500 font-bold tracking-widest text-[10px] uppercase mb-6 flex items-center justify-center gap-4">
          <span className="w-12 h-px bg-amber-500/50" /> Trải Nghiệm Tinh Hoa <span className="w-12 h-px bg-amber-500/50" />
        </span>
        <h2 className="text-5xl md:text-7xl lg:text-[80px] font-headline font-black text-white mb-16 uppercase tracking-tighter drop-shadow-2xl leading-[0.9]">
          BẠN ĐÃ SẴN SÀNG <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">THƯỞNG THỨC?</span>
        </h2>

        <div className="flex flex-wrap justify-center items-center gap-12 mb-16">
          {[
            { icon: 'local_cafe', label: 'Hương vị mộc' },
            { icon: 'electric_moped', label: 'Giao tốc hành' },
            { icon: 'workspace_premium', label: 'Chất lượng 5 Sao' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center group cursor-default">
              <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:border-amber-500 group-hover:-translate-y-2 transition-all duration-300 shadow-2xl rotate-45">
                <span className="material-symbols-outlined text-3xl text-zinc-500 group-hover:text-amber-500 transition-colors -rotate-45">{item.icon}</span>
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">{item.label}</span>
            </div>
          ))}
        </div>

        <Link to="/menu" className="inline-block px-14 py-6 bg-amber-500 text-zinc-950 font-black uppercase tracking-widest rounded-none text-sm hover:bg-white transition-all active:scale-95 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
          ĐẶT HÀNG NGAY NÀO
        </Link>
      </div>
    </section>
  );
};

export default CallToAction;
