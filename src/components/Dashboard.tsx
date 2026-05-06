import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, PieChart, Info, Database } from 'lucide-react';
import { CattleAnalysis } from '../types';
import { translations } from '../translations';
import { cn } from '../lib/utils';

interface DashboardProps {
  history: CattleAnalysis[];
  lang: 'ar' | 'en';
}

export default function Dashboard({ history, lang }: DashboardProps) {
  const t = translations[lang];
  const totalAnalyzed = history.length;
  const breeds = Array.from(new Set(history.map(h => h.breed)));
  const uniqueBreeds = breeds.length;
  
  // Calculate most frequent breed
  const breedCounts = history.reduce((acc: any, h) => {
    acc[h.breed] = (acc[h.breed] || 0) + 1;
    return acc;
  }, {});
  
  const topBreed = Object.entries(breedCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A';

  const stats = [
    { label: t.total_analyzed, value: totalAnalyzed, icon: BarChart3, color: 'text-cattle-blue' },
    { label: t.breeds_detected, value: uniqueBreeds, icon: PieChart, color: 'text-cattle-purple' },
    { label: t.top_breed, value: topBreed, icon: TrendingUp, color: 'text-cattle-amber', isText: true },
  ];

  return (
    <div className="space-y-10">
      <header className="space-y-4 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-cattle-green" />
          <h1 className="text-4xl font-black tracking-tight leading-none uppercase font-arabic">{t.metrics}</h1>
        </div>
        <p className="text-cattle-text/40 font-mono text-[10px] uppercase tracking-widest max-w-xl">
          {t.subtitle} :: Local Engine v1.0.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="brutal-card border-cattle-border hover:border-cattle-green group relative"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-2 border border-cattle-text/5 transition-colors group-hover:border-cattle-green/50", stat.color)}>
                <stat.icon size={18} />
              </div>
              <Info size={12} className="text-cattle-text/10" />
            </div>
            <p className="text-[9px] font-mono text-cattle-text/30 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <p className={cn(
              "font-black tracking-tighter uppercase",
              stat.isText ? "text-xl truncate" : "text-5xl leading-none"
            )}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Distribution Chart */}
        <div className="lg:col-span-7 brutal-card space-y-8 corner-decor">
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-cattle-text/50">{t.distribution}</h3>
          <div className="space-y-6">
            {Object.entries(breedCounts).slice(0, 5).map(([breed, count]: any, idx) => {
              const percentage = Math.round((count / totalAnalyzed) * 100);
              const barColor = idx === 0 ? "bg-cattle-green" : 
                               idx === 1 ? "bg-cattle-blue" :
                               idx === 2 ? "bg-cattle-purple" :
                               idx === 3 ? "bg-cattle-amber" : "bg-cattle-green";
              return (
                <div key={breed} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                    <span className="font-arabic">{breed}</span>
                    <span className={cn("font-bold", barColor.replace('bg-', 'text-'))}>{percentage}%</span>
                  </div>
                  <div className="h-1 bg-white/5 w-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn("h-full", barColor)}
                    />
                  </div>
                </div>
              );
            })}
            {totalAnalyzed === 0 && (
              <p className="text-[10px] text-cattle-text/10 font-mono italic text-center py-10 tracking-widest uppercase">{t.no_records}</p>
            )}
          </div>
        </div>

        {/* System Info */}
        <div className="lg:col-span-5 brutal-card border-none bg-cattle-green/90 backdrop-blur-sm text-cattle-black flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Database size={20} />
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">{t.system_status}</h3>
            </div>
            <div className="space-y-4 font-mono text-[10px] uppercase tracking-widest">
              <div className="flex justify-between border-b border-cattle-black/10 pb-2">
                <span className="opacity-60">{t.engine}</span>
                <span className="font-bold text-xs leading-none">LOCAL_V1_CORE</span>
              </div>
              <div className="flex justify-between border-b border-cattle-black/10 pb-2">
                <span className="opacity-60">{t.pipeline}</span>
                <span className="font-bold text-xs leading-none">Phenotypic Scan</span>
              </div>
              <div className="flex justify-between border-b border-cattle-black/10 pb-2">
                <span className="opacity-60">{t.persistence}</span>
                <span className="font-bold text-xs leading-none">Encrypted Local</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">{t.uptime}</span>
                <span className="font-bold text-xs leading-none">99.998%</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 p-3 border-2 border-cattle-black font-black uppercase text-[10px] tracking-[0.3em] text-center cursor-pointer hover:bg-cattle-black hover:text-cattle-green transition-all active:scale-[0.98]">
            {t.optimize}
          </div>
        </div>
      </div>
    </div>
  );
}
