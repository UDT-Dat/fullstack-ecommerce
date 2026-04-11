import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import bgImage from '../../image/banner-home_cung-cap-ca-phe-rang_350303b870594d3db026e540b8744caa.jpg';
import coffeeImg from '../../image/Cup-Of-Creamy-Coffee.png';

const SLIDE_INTERVAL = 6000;

const StaticHero = () => (
  <section className="relative min-h-[600px] flex items-center overflow-hidden bg-[#0a0a0a] text-white">
    <div className="absolute inset-0 z-0">
      <img src={bgImage} alt="" className="w-full h-full object-cover opacity-10 filter grayscale mix-blend-luminosity" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
    </div>
    <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 pt-16 pb-16 mt-10">
      <div className="flex flex-col justify-center">
        <div className="mb-8 inline-flex items-center gap-3 bg-white/5 px-4 py-2 border-l-2 border-amber-500 w-max backdrop-blur-md">
          <span className="material-symbols-outlined text-amber-500 text-sm">local_cafe</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Hương Vị Nguyên Bản 100%</span>
        </div>
        <h1 className="font-headline text-6xl md:text-8xl lg:text-[100px] font-black tracking-tighter leading-[0.9] text-white mb-8 uppercase drop-shadow-2xl flex flex-col gap-2">
          <span>TINH HOA</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 leading-[1.2] pt-4 pb-1 -mt-4">ĐỒ UỐNG</span>
          <span>ĐÍCH THỰC.</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-lg leading-relaxed font-medium">
          Từ tinh chất đắng ngọt của hạt cà phê mộc, đến sự kết hợp trái cây tươi mát. Citrus cho bạn trải nghiệm tuyệt vời nhất.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/menu" className="group px-10 py-5 bg-amber-500 text-zinc-950 font-black uppercase tracking-widest rounded-none hover:bg-white transition-all active:scale-95 flex items-center gap-3 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
            Mua Ngay
            <span className="material-symbols-outlined transform group-hover:translate-x-2 transition-transform">arrow_forward</span>
          </Link>
          <Link to="/menu" className="px-10 py-5 border-2 border-white/20 text-white font-black uppercase tracking-widest rounded-none hover:border-amber-500 hover:text-amber-500 transition-all flex items-center">
            Khám phá menu
          </Link>
        </div>
      </div>
      <div className="relative flex justify-center items-center mt-12 lg:mt-0">
        <div className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-amber-500/20 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="relative z-10 w-[80%] max-w-[600px]">
          <img alt="Coffee" className="w-full h-auto object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.7)] animate-[heroFloat_6s_ease-in-out_infinite]" src={coffeeImg} />
        </div>
      </div>
    </div>
    <style>{`@keyframes heroFloat { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(2deg); } }`}</style>
  </section>
);

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/banners')
      .then(res => { setBanners(res.data); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const next = useCallback(() => setCurrent(c => (c + 1) % banners.length), [banners.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + banners.length) % banners.length), [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  if (!loaded) return <StaticHero />;
  if (banners.length === 0) return <StaticHero />;

  return (
    <section className="relative w-full overflow-hidden bg-zinc-900">
      <div className="relative w-full" style={{ height: 'clamp(250px, 35vw, 450px)' }}>
        {banners.map((banner, idx) => (
          <div
            key={banner._id}
            className="absolute inset-0 transition-all duration-[1200ms] ease-in-out"
            style={{ opacity: idx === current ? 1 : 0, zIndex: idx === current ? 2 : 1 }}
          >
            <img
              src={banner.image}
              alt={banner.title || `Banner ${idx + 1}`}
              className="w-full h-full object-cover"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {(banner.title || banner.subtitle) && (
              <div
                className="absolute bottom-12 left-8 md:left-16 z-10 max-w-xl transition-all duration-700"
                style={{
                  opacity: idx === current ? 1 : 0,
                  transform: idx === current ? 'translateY(0)' : 'translateY(30px)'
                }}
              >
                {banner.title && (
                  <h2 className="font-headline text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-[0.95] drop-shadow-2xl mb-3">
                    {banner.title}
                  </h2>
                )}
                {banner.subtitle && (
                  <p className="text-sm md:text-base text-white/80 font-medium mb-6 max-w-md drop-shadow-lg">
                    {banner.subtitle}
                  </p>
                )}
                <Link
                  to={banner.link || '/menu'}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 text-zinc-950 font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                >
                  Khám phá
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/30 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-amber-500 hover:text-zinc-950 transition-all rounded-full">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button onClick={next} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/30 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-amber-500 hover:text-zinc-950 transition-all rounded-full">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-1 rounded-full transition-all duration-500 ${idx === current ? 'w-10 bg-amber-500' : 'w-4 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default Hero;
