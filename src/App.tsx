import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, 
  Upload, 
  History, 
  Settings, 
  Menu, 
  X, 
  ChevronRight, 
  Info,
  Database,
  BarChart3,
  Beef,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from './lib/utils';
import { CattleAnalysis } from './types';
import { translations } from './translations';
import AnalysisModule from './components/AnalysisModule';
import Dashboard from './components/Dashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analysis' | 'dashboard' | 'history'>('analysis');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [history, setHistory] = useState<CattleAnalysis[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  const t = translations[lang];

  useEffect(() => {
    const saved = localStorage.getItem('cattle_history');
    if (saved) setHistory(JSON.parse(saved));
    
    const savedTheme = localStorage.getItem('cattle_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const savedLang = localStorage.getItem('cattle_lang') as 'ar' | 'en';
    if (savedLang) {
      setLang(savedLang);
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    } else {
      document.documentElement.dir = 'rtl';
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('cattle_theme', newTheme);
  };

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('cattle_lang', newLang);
  };

  const addToHistory = (analysis: CattleAnalysis) => {
    const newHistory = [analysis, ...history];
    setHistory(newHistory);
    localStorage.setItem('cattle_history', JSON.stringify(newHistory));
  };

  const navItems = [
    { id: 'analysis', label: t.analysis, icon: Dna, color: 'cattle-green' },
    { id: 'dashboard', label: t.dashboard, icon: BarChart3, color: 'cattle-blue' },
    { id: 'history', label: t.history, icon: History, color: 'cattle-purple' },
  ];

  const getActiveColor = (id: string) => {
    switch(id) {
      case 'analysis': return 'text-cattle-green bg-cattle-green/5';
      case 'dashboard': return 'text-cattle-blue bg-cattle-blue/5';
      case 'history': return 'text-cattle-purple bg-cattle-purple/5';
      default: return 'text-cattle-green bg-cattle-green/5';
    }
  };

  const getActiveBorder = (id: string) => {
    switch(id) {
      case 'analysis': return 'bg-cattle-green';
      case 'dashboard': return 'bg-cattle-blue';
      case 'history': return 'bg-cattle-purple';
      default: return 'bg-cattle-green';
    }
  };

  return (
    <div className="flex h-screen bg-cattle-black overflow-hidden selection:bg-cattle-green selection:text-black relative">
      {/* Background Image Overlay */}
      <div 
        className={cn(
          "absolute inset-0 z-0 pointer-events-none bg-cover bg-center transition-all duration-700",
          theme === 'dark' ? "opacity-40 grayscale-0 brightness-90" : "opacity-85 grayscale-0 brightness-105"
        )}
        style={{ 
          backgroundImage: 'url("bison-nature-black-white.jpg")',
        }}
      />
      
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className="relative bg-cattle-black/40 backdrop-blur-2xl border-r border-cattle-border flex flex-col z-50 transition-colors overflow-hidden"
      >
        <div className="p-6 flex flex-col h-full">
          {/* Logo & Toggle Section */}
          <div className="flex items-center justify-between mb-12">
            <div className={cn(
              "w-10 h-10 bg-cattle-green rounded-sm flex items-center justify-center rotate-45 group hover:rotate-0 transition-transform cursor-pointer shrink-0",
              !isSidebarOpen && "mx-auto"
            )}>
              <Beef size={20} className="text-cattle-black -rotate-45 group-hover:rotate-0 transition-transform" />
            </div>
            
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-xl tracking-tighter font-arabic"
              >
                {t.title}
              </motion.span>
            )}
            
            {isSidebarOpen && (
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 border border-cattle-border hover:border-cattle-green transition-colors text-cattle-text/40 hover:text-cattle-green"
              >
                <X size={14} />
              </motion.button>
            )}
          </div>

          {!isSidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(true)}
              className="mb-8 p-3 self-center border border-cattle-border hover:border-cattle-green transition-colors text-cattle-text/40 hover:text-cattle-green"
            >
              <Menu size={18} />
            </button>
          )}
          
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "flex items-center gap-4 p-3 transition-all duration-300 relative group",
                  activeTab === item.id 
                    ? getActiveColor(item.id)
                    : "text-cattle-text/40 hover:text-cattle-text hover:bg-white/5",
                  !isSidebarOpen && "justify-center"
                )}
              >
                <item.icon size={22} className={cn("shrink-0 transition-colors", activeTab === item.id ? "" : "group-hover:text-cattle-blue")} />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0, x: lang === 'en' ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-cattle-text"
                  >
                    {item.label}
                  </motion.span>
                )}
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="sidebarActiveLine"
                    className={cn("absolute left-0 w-1 h-full", getActiveBorder(item.id))}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 flex flex-col items-center gap-6">
            <div className="w-2 h-2 rounded-full bg-cattle-green shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden z-10">
        {/* Header */}
        <header className="h-20 bg-cattle-black/40 backdrop-blur-xl border-b border-cattle-border flex items-center justify-between px-8 z-40">
          <div className="flex items-baseline gap-4">
            <h1 className="text-2xl font-black tracking-tight uppercase font-arabic">
              {t.title} <span className="text-cattle-green">AI</span>
            </h1>
            <span className="text-[10px] uppercase tracking-widest bg-cattle-border px-2 py-1 font-mono">
              {t.status_active}
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleLang}
              className="px-3 py-1 border border-cattle-border hover:border-cattle-green transition-colors text-[10px] font-bold uppercase tracking-widest text-cattle-text"
              title="Switch Language"
            >
              {lang === 'ar' ? 'EN' : 'عربي'}
            </button>

            <button 
              onClick={toggleTheme}
              className="p-2 border border-cattle-border hover:border-cattle-green transition-colors text-cattle-text"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase tracking-widest opacity-40">{t.pwa_status}</p>
              <p className="text-xs font-mono text-cattle-green">{t.pwa_ready}</p>
            </div>
            <div className="w-10 h-10 border border-cattle-border flex items-center justify-center bg-cattle-gray">
              <div className="w-6 h-6 bg-white/10" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {activeTab === 'analysis' && <AnalysisModule onAnalysisComplete={addToHistory} lang={lang} theme={theme} />}
              {activeTab === 'dashboard' && <Dashboard history={history} lang={lang} />}
              {activeTab === 'history' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {history.map((item) => (
                    <CattleHistoryCard key={item.id} analysis={item} lang={lang} />
                  ))}
                  {history.length === 0 && (
                    <div className="col-span-full py-32 text-center border border-dashed border-cattle-border bg-cattle-gray/50 corner-decor">
                      <p className="text-white/20 font-mono text-xs uppercase tracking-widest">{t.no_records}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
      </main>
    </div>
  );
}

function CattleHistoryCard({ analysis, lang }: { analysis: CattleAnalysis, lang: 'ar' | 'en' }) {
  const t = translations[lang];
  return (
    <div className="brutal-card group">
      <div className="aspect-video mb-4 overflow-hidden bg-black border border-cattle-border relative">
        <img 
          src={analysis.imageUrl} 
          alt={analysis.breed} 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
        />
        <div className="absolute top-2 right-2 bg-cattle-green text-black text-[10px] font-bold px-2 py-1">
          {Math.round(analysis.confidence * 100)}% {t.confidence.toUpperCase()}
        </div>
      </div>
      <h3 className="text-xl mb-1 text-cattle-green font-arabic">{analysis.breed}</h3>
      <p className="text-xs font-mono text-cattle-text/50 mb-4">{new Date(analysis.timestamp).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</p>
      <div className="flex gap-2">
        <span className="text-[9px] border border-cattle-border px-2 py-1 uppercase text-cattle-text opacity-60">{analysis.characteristics.origin}</span>
        <span className="text-[9px] border border-cattle-border px-2 py-1 uppercase text-cattle-text opacity-60">{analysis.characteristics.hardiness}</span>
      </div>
    </div>
  );
}
