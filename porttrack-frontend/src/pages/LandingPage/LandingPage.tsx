import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { FeatureCard } from '../../components/common/FeatureCard';
import heroImg from '../../assets/hero.png';

// Định nghĩa các SVG Icons nhỏ gọn
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const RoomIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
);
const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
);

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30">
      <Header />
      
      {/* Khối main được flex-grow để đẩy Footer xuống đáy nếu nội dung ngắn */}
      <main className="flex-grow pt-10 pb-16">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Cột Trái (Text) */}
            <div className="space-y-8 flex flex-col items-start z-10">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold tracking-wide">
                The Ultimate Stock Trading Simulator
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
                EXPERIENCE REAL MARKET INVESTING <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  ZERO FINANCIAL RISK
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed">
                Trade stocks in real time with live market data. Compete with friends, sharpen your investment skills, and build confidence all without risking your capital.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link 
                  to="/register" 
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                >
                  START TRADING FREE
                </Link>
              </div>
            </div>
            
            {/* Cột Phải (Ảnh Hero) */}
            <div className="relative flex justify-center items-center w-full mt-10 lg:mt-0">
  
                {/* Lớp hào quang 1: Xanh dương đậm (Nền rộng nhất) */}
                <div className="absolute w-4/5 h-4/5 bg-blue-600/30 rounded-full z-0 animate-ultimate-glow"></div>
                
                {/* Lớp hào quang 2: Xanh Cyan sáng (Tâm sáng) */}
                <div className="absolute w-1/2 h-1/2 bg-cyan-400/40 rounded-full z-0 animate-ultimate-glow" style={{ animationDelay: '-1s' }}></div>
                
                {/* Lớp hào quang 3: Điểm nhấn cực sáng ở giữa */}
                <div className="absolute w-1/3 h-1/3 bg-white/10 rounded-full z-0 animate-ultimate-glow blur-[60px]" style={{ animationDelay: '-2s' }}></div>
                
                {/* Container bọc ảnh để chạy hiệu ứng lơ lửng (Floating) */}
                <div 
                  className="relative z-10 w-full max-w-2xl animate-float" 
                  style={{
                    maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)'
                  }}
                >
                  <img 
                    src={heroImg} 
                    alt="PortTrack Trading Simulator" 
                    className="w-full h-auto object-contain mix-blend-screen opacity-100 contrast-125 brightness-110"
                  />
                </div>
              </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<UserIcon />}
              title="1. Create Your Account"
              description="Sign up for free in just 30 seconds."
            />
            <FeatureCard 
              icon={<RoomIcon />}
              title="2. Join a Trading Room"
              description="Enter a room code or create your own trading arena."
            />
            <FeatureCard 
              icon={<ChartIcon />}
              title="3. Start Trading"
              description="Receive virtual capital and place buy/sell orders that mirror the real market."
            />
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};