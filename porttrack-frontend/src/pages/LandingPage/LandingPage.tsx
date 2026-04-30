import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { FeatureCard } from '../../components/common/FeatureCard';
import heroImg from '../../assets/hero.jpg';

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
      <main className="flex-grow pt-20 pb-16">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Cột Trái (Text) */}
            <div className="space-y-8 flex flex-col items-start z-10">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold tracking-wide">
                🚀 Nền tảng thực chiến chứng khoán
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
                TRẢI NGHIỆM ĐẦU TƯ THỰC TẾ. <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  KHÔNG RỦI RO TÀI CHÍNH.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed">
                Giao dịch chứng khoán theo thời gian thực. Thi đấu cùng bạn bè, nâng cao kỹ năng mà không sợ mất vốn.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link 
                  to="/register" 
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                >
                  MỞ TÀI KHOẢN NGAY
                </Link>
                <Link 
                  to="/demo" 
                  className="px-8 py-3.5 rounded-xl border-2 border-slate-700 hover:border-blue-500 text-slate-300 hover:text-blue-400 font-bold transition-all bg-slate-800/50 hover:bg-slate-800"
                >
                  Xem Demo
                </Link>
              </div>
            </div>
            
            {/* Cột Phải (Ảnh Hero) */}
            <div className="relative flex justify-center items-center w-full">
              {/* Blur backdrop để làm nổi bật ảnh */}
              <div className="absolute w-3/4 h-3/4 bg-blue-500/20 rounded-full blur-[100px] z-0"></div>
              
              {/* Ảnh mix-blend-screen để hòa trộn vùng đen của ảnh vào nền slate-900, kèm mask-image để mờ viền dưới */}
              <img 
                src={heroImg} 
                alt="PortTrack Trading Simulator" 
                className="w-full max-w-xl object-contain mix-blend-screen opacity-90 relative z-10"
                style={{
                  maskImage: 'radial-gradient(circle at center, black 50%, transparent 50%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
                }}
              />
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<UserIcon />}
              title="1. Tạo Tài Khoản"
              description="Đăng ký miễn phí trong 30 giây."
            />
            <FeatureCard 
              icon={<RoomIcon />}
              title="2. Tham Gia Phòng Chơi"
              description="Nhập mã code phòng hoặc tự tạo sàn thi đấu mới."
            />
            <FeatureCard 
              icon={<ChartIcon />}
              title="3. Bắt Đầu Giao Dịch"
              description="Nhận vốn ảo và đặt lệnh mua bán sát với thị trường thực."
            />
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};