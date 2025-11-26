
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Zap, BarChart3, Layers, ArrowRight, ArrowLeft,
  Sparkles, Globe, Lock, Cpu, Activity, MousePointer2, Sliders
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
}

const TEXT = {
  en: {
    navStart: "Enter Dashboard",
    heroBadge: "System v2.1 Online",
    heroTitle: "Data Intelligence,",
    heroTitleHighlight: "Reimagined.",
    heroSub: "The all-in-one strategic command center. Connect n8n, visualize revenue, and simulate future outcomes with a single neural interface.",
    ctaPrimary: "Initialize System",
    ctaSecondary: "Read Documentation",
    trustedBy: "INTEGRATED ARCHITECTURE",
    bento1Title: "Neural Analyst",
    bento1Desc: "Context-aware AI that doesn't just read data—it understands business logic and provides strategic counsel.",
    bento2Title: "n8n Core",
    bento2Desc: "Native bi-directional synchronization with your automation workflows.",
    bento3Title: "Zero Latency",
    bento3Desc: "Real-time edge computing.",
    bento4Title: "Predictive Sim",
    bento4Desc: "Monte Carlo engines to forecast revenue scenarios and risk.",
    stat1: "100%", stat1Label: "Data Privacy",
    stat2: "< 50ms", stat2Label: "Response Time",
    footerQuote: "Engineered for the modern executive.",
    copyright: "© 2024 Dashy Analytics Inc."
  },
  ar: {
    navStart: "دخول المنصة",
    heroBadge: "النظام 2.1 متصل",
    heroTitle: "ذكاء البيانات،",
    heroTitleHighlight: "بمفهوم جديد.",
    heroSub: "مركز القيادة الاستراتيجي الشامل. اربط n8n، حلل الإيرادات، وحاكي النتائج المستقبلية واجهة عصبية واحدة.",
    ctaPrimary: "تشغيل النظام",
    ctaSecondary: "التوثيق التقني",
    trustedBy: "البنية التقنية المتكاملة",
    bento1Title: "المحلل العصبي",
    bento1Desc: "ذكاء اصطناعي واعي بالسياق، لا يقرأ البيانات فحسب، بل يفهم منطق الأعمال ويقدم المشورة.",
    bento2Title: "نواة n8n",
    bento2Desc: "مزامنة ثنائية الاتجاه مع سير عمل الأتمتة الخاص بك بشكل أصلي.",
    bento3Title: "سرعة فائقة",
    bento3Desc: "حوسبة طرفية فورية.",
    bento4Title: "محاكاة التنبؤ",
    bento4Desc: "محركات مونت كارلو لتوقع سيناريوهات الإيرادات والمخاطر.",
    stat1: "100%", stat1Label: "خصوصية البيانات",
    stat2: "< 50ms", stat2Label: "سرعة الاستجابة",
    footerQuote: "صُمم خصيصاً للمدراء التنفيذيين.",
    copyright: "© 2024 داشي للتحليلات."
  }
};

const CardSpotlight = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl border border-white/10 bg-[#0e0e0e] overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(6,182,212,0.15), transparent 40%)`
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, lang, setLang }) => {
  const t = TEXT[lang];
  const isRTL = lang === 'ar';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .shimmer-text {
          background: linear-gradient(to right, #fff 20%, #06b6d4 40%, #06b6d4 60%, #fff 80%);
          background-size: 200% auto;
          background-clip: text;
          text-fill-color: transparent;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: flow 5s linear infinite;
        }
        .hero-glow {
          box-shadow: 0 0 80px -20px rgba(6,182,212,0.3);
        }
      `}</style>

      {/* --- BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         {/* Moving Grid */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" 
              style={{ maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)' }}></div>
         
         {/* Ambient Lights */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full mix-blend-screen opacity-50" />
      </div>

      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${scrolled ? 'bg-black/80 backdrop-blur-xl border-white/10 py-3' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <BarChart3 size={18} className="text-black" />
             </div>
             <span className="text-lg font-bold tracking-tight">Dashy</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
               onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
               className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-white/5"
            >
               <Globe size={14} />
               {lang === 'en' ? 'العربية' : 'English'}
            </button>
            <button 
              onClick={onStart}
              className="group relative px-5 py-2 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider overflow-hidden hover:scale-105 transition-transform"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              {t.navStart}
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-4">
        
        {/* --- HERO SECTION --- */}
        <div className="max-w-6xl mx-auto text-center mb-24 relative">
           
           {/* Floating Badge */}
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[10px] font-mono text-cyan-400 mb-8 animate-fade-in-up hover:border-cyan-500/50 transition-colors cursor-default">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              {t.heroBadge}
           </div>

           {/* Massive Title */}
           <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.9]" style={{ fontFamily: isRTL ? 'Cairo, sans-serif' : 'Outfit, sans-serif' }}>
              <span className="block text-white opacity-90">{t.heroTitle}</span>
              <span className="shimmer-text">{t.heroTitleHighlight}</span>
           </h1>

           <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-12 leading-relaxed font-light">
             {t.heroSub}
           </p>

           {/* CTA Buttons */}
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={onStart}
                className="relative px-8 py-4 rounded-xl bg-cyan-500 text-black font-bold text-lg hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] w-full sm:w-auto overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {t.ctaPrimary} {isRTL ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
                </span>
              </button>
              
              <button className="px-8 py-4 rounded-xl border border-white/10 text-white font-bold text-lg hover:bg-white/5 transition-all w-full sm:w-auto">
                {t.ctaSecondary}
              </button>
           </div>
        </div>

        {/* --- 3D INTERFACE MOCKUP (CSS) --- */}
        <div className="max-w-6xl mx-auto mb-32 perspective-container group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
           <div className="relative rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] transform rotate-x-12 transition-transform duration-1000 hover:rotate-x-0 hover:scale-[1.02] hero-glow">
              
              {/* Toolbar */}
              <div className="absolute top-0 w-full h-10 bg-[#111] border-b border-white/5 flex items-center px-4 gap-2 z-20">
                 <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                 </div>
                 <div className="mx-auto w-40 h-5 rounded bg-white/5"></div>
              </div>
              
              {/* Dashboard Content */}
              <div className="p-4 pt-14 h-full grid grid-cols-12 gap-4">
                  {/* Sidebar */}
                  <div className="col-span-2 hidden md:flex flex-col gap-3 h-full border-r border-white/5 pr-4">
                     {[1,2,3,4,5].map(i => (
                        <div key={i} className="h-8 rounded-lg bg-white/5 w-full"></div>
                     ))}
                  </div>
                  
                  {/* Main */}
                  <div className="col-span-12 md:col-span-10 flex flex-col gap-4">
                      {/* KPI Row */}
                      <div className="grid grid-cols-4 gap-4 h-24">
                         {[1,2,3,4].map(i => (
                            <div key={i} className="rounded-xl bg-white/5 border border-white/5 relative overflow-hidden">
                               <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-500/50"></div>
                            </div>
                         ))}
                      </div>
                      {/* Charts */}
                      <div className="grid grid-cols-3 gap-4 flex-1">
                         <div className="col-span-2 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden">
                             <div className="absolute inset-0 flex items-end">
                                <svg className="w-full h-3/4 text-cyan-500/20" preserveAspectRatio="none">
                                   <path d="M0 100 Q 150 50 300 80 T 600 40 T 900 60 V 200 H 0 Z" fill="currentColor" />
                                   <path d="M0 100 Q 150 50 300 80 T 600 40 T 900 60" fill="none" stroke="#06b6d4" strokeWidth="2" />
                                </svg>
                             </div>
                         </div>
                         <div className="col-span-1 rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col gap-2">
                             {[1,2,3,4,5].map(i => (
                                <div key={i} className="h-6 w-full rounded bg-white/5 flex items-center px-2">
                                   <div className="w-1/2 h-2 bg-white/10 rounded-full"></div>
                                </div>
                             ))}
                         </div>
                      </div>
                  </div>
              </div>

              {/* Reflections */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-30 mix-blend-overlay"></div>
           </div>
        </div>

        {/* --- INFINITE MARQUEE --- */}
        <div className="w-full overflow-hidden mb-32 border-y border-white/5 bg-white/[0.02] py-8">
           <div className="flex w-[200%] animate-marquee">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex w-1/2 justify-around items-center gap-10 px-10">
                   {['N8N', 'OPENAI', 'STRIPE', 'REACT', 'TAILWIND', 'GOOGLE CLOUD', 'VERCEL'].map((brand, j) => (
                      <div key={j} className="flex items-center gap-2 text-xl font-bold text-white/20 font-mono uppercase">
                         <Activity size={16} /> {brand}
                      </div>
                   ))}
                </div>
              ))}
           </div>
        </div>

        {/* --- BENTO GRID --- */}
        <section className="max-w-7xl mx-auto mb-32">
           <div className="flex items-center gap-4 mb-12">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{t.trustedBy}</span>
              <div className="h-px bg-white/10 flex-1"></div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[650px]">
              
              {/* Feature 1: AI (Large) */}
              <CardSpotlight className="md:col-span-2 md:row-span-2 p-8 flex flex-col group">
                 <div className="mb-auto">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform">
                       <Bot size={28} />
                    </div>
                    <h3 className="text-3xl font-bold mb-3 text-white">{t.bento1Title}</h3>
                    <p className="text-gray-400 leading-relaxed max-w-sm">{t.bento1Desc}</p>
                 </div>
                 
                 {/* Decorative UI Code */}
                 <div className="mt-8 rounded-xl bg-black/50 border border-white/5 p-4 font-mono text-xs space-y-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2">
                       <span className="text-green-500">➜</span>
                       <span className="text-cyan-300">analyze_revenue()</span>
                    </div>
                    <div className="pl-4 text-gray-500">Processing 1,240 records...</div>
                    <div className="pl-4 text-white">Result: Trend is <span className="text-green-400">POSITIVE (+12%)</span></div>
                 </div>
              </CardSpotlight>

              {/* Feature 2: N8N (Wide) */}
              <CardSpotlight className="md:col-span-2 p-8 flex flex-col justify-center relative">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none opacity-0 group-hover:opacity-50 transition-opacity"></div>
                 <div className="flex items-start gap-6 relative z-10">
                    <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                       <Zap size={32} />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-white mb-2">{t.bento2Title}</h3>
                       <p className="text-gray-400 text-sm leading-relaxed">{t.bento2Desc}</p>
                    </div>
                 </div>
              </CardSpotlight>

              {/* Feature 3: Performance */}
              <CardSpotlight className="p-6 flex flex-col justify-end min-h-[200px]">
                 <Cpu className="text-purple-500 mb-4" size={32} />
                 <h3 className="text-lg font-bold text-white mb-1">{t.bento3Title}</h3>
                 <p className="text-xs text-gray-500">{t.bento3Desc}</p>
              </CardSpotlight>

              {/* Feature 4: Simulation (Replaced Themes) */}
              <CardSpotlight className="p-6 flex flex-col justify-end min-h-[200px]">
                 <Sliders className="text-emerald-500 mb-4" size={32} />
                 <h3 className="text-lg font-bold text-white mb-1">{t.bento4Title}</h3>
                 <p className="text-xs text-gray-500">{t.bento4Desc}</p>
                 <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-emerald-500 rounded-full animate-pulse"></div>
                 </div>
              </CardSpotlight>

           </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="border-t border-white/5 pt-16 pb-8">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
              <div>
                 <div className="flex items-center gap-2 mb-4 opacity-50">
                    <BarChart3 size={20} />
                    <span className="font-bold text-xl tracking-tight">Dashy</span>
                 </div>
                 <p className="text-sm text-gray-500 max-w-xs">{t.footerQuote}</p>
              </div>

              <div className="flex gap-16 text-right">
                 <div>
                    <h4 className="text-2xl font-mono font-bold text-white mb-1">{t.stat1}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{t.stat1Label}</p>
                 </div>
                 <div>
                    <h4 className="text-2xl font-mono font-bold text-white mb-1">{t.stat2}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{t.stat2Label}</p>
                 </div>
              </div>
           </div>
           
           <div className="mt-16 flex justify-between items-center text-[10px] text-gray-700 font-mono uppercase tracking-wider">
              <span>{t.copyright}</span>
              <span>All Systems Operational</span>
           </div>
        </footer>

      </main>
    </div>
  );
};
