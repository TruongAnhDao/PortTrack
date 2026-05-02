import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { FeatureCard } from '../../components/common/FeatureCard';
import heroImg from '../../assets/hero.png';

// Import Icons từ lucide-react
import { 
  UserPlus, LogIn, LineChart, 
  ShieldCheck, Activity, PieChart, 
  GraduationCap, TrendingUp, Users 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30">
      <Header />
      
      <main className="flex-grow pt-10">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Cột Trái (Text) */}
            <div className="space-y-8 flex flex-col items-start z-10">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold tracking-wide">
                The #1 Practical Stock Trading Platform
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                  EXPERIENCE REAL TRADING
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                  ZERO FINANCIAL RISK
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed">
                Trade stocks in real-time. Compete with friends and improve your portfolio management skills without losing real money.
              </p>
              
              <div className="flex flex-wrap gap-5 pt-4">
                <Link 
                  to="/register" 
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                >
                  OPEN ACCOUNT NOW
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

        {/* SECTION 1: HOW IT WORKS */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 py-12 lg:py-28 border-t border-slate-800/50">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">How it works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Start your trading journey in three simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<UserPlus size={32} strokeWidth={1.5} />}
              title="1. Create Account"
              description="Sign up for free in just 30 seconds."
            />
            <FeatureCard 
              icon={<LogIn size={32} strokeWidth={1.5} />}
              title="2. Join a Room"
              description="Enter a room code or create your own private trading floor."
            />
            <FeatureCard 
              icon={<LineChart size={32} strokeWidth={1.5} />}
              title="3. Start Trading"
              description="Get virtual capital and trade with real-time market data."
            />
          </div>
        </section>

        {/* SECTION 2: WHY PORTTRACK? */}
        <section id="why-porttrack" className="bg-slate-900/30 pt-24 py-20 lg:py-28 border-y border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Why PortTrack?</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Built with cutting-edge technology to give you the most authentic simulation.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="flex flex-col items-start p-6">
                <div className="p-4 bg-blue-500/10 text-blue-400 rounded-xl mb-6">
                  <ShieldCheck size={36} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Zero Financial Risk</h3>
                <p className="text-slate-400 leading-relaxed">Practice portfolio management without losing real money. Experiment with bold strategies safely.</p>
              </div>
              <div className="flex flex-col items-start p-6">
                <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-xl mb-6">
                  <Activity size={36} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Real-time Market Data</h3>
                <p className="text-slate-400 leading-relaxed">Syncs continuously with live stock market prices to ensure your simulation is accurate to the second.</p>
              </div>
              <div className="flex flex-col items-start p-6">
                <div className="p-4 bg-blue-500/10 text-blue-400 rounded-xl mb-6">
                  <PieChart size={36} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">In-depth Analytics</h3>
                <p className="text-slate-400 leading-relaxed">Track your NAV (Net Asset Value) and performance with detailed charts and historical data.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: WHO IS IT FOR? */}
        <section id="who-is-it-for" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 py-20 lg:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Who is it for?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Designed for everyone from curious beginners to academic institutions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-600 transition-colors">
              <GraduationCap size={40} className="text-slate-300 mb-6" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-white mb-3">University Students</h3>
              <p className="text-slate-400">Apply financial theories into hands-on practice directly from your dorm room.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-600 transition-colors">
              <TrendingUp size={40} className="text-slate-300 mb-6" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-white mb-3">Beginner Investors</h3>
              <p className="text-slate-400">Test trading strategies and build confidence safely before entering the real market.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-600 transition-colors">
              <Users size={40} className="text-slate-300 mb-6" strokeWidth={1.5} />
              <h3 className="text-xl font-bold text-white mb-3">Educators & Groups</h3>
              <p className="text-slate-400">Host private trading competitions for classes, investment clubs, or communities.</p>
            </div>
          </div>
        </section>

        {/* SECTION 4: BOTTOM CTA */}
        <section className="w-full relative overflow-hidden bg-gradient-to-t from-blue-900/30 to-slate-950 py-24 border-t border-slate-800/50">
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none opacity-20">
             <div className="w-[800px] h-[500px] bg-blue-500 blur-[150px] rounded-full mix-blend-screen"></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to master the market?</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl">
              Join PortTrack today and start building your risk-free portfolio in seconds.
            </p>
            <Link 
              to="/register" 
              className="px-10 py-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] hover:-translate-y-1"
            >
              Create Free Account
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};