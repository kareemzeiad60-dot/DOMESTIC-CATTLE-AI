import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Search, Zap, AlertCircle, RefreshCw, Info } from 'lucide-react';
import { CattleAnalysis } from '../types';
import { translations } from '../translations';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface AnalysisModuleProps {
  onAnalysisComplete: (analysis: CattleAnalysis) => void;
  lang: 'ar' | 'en';
  theme: 'dark' | 'light';
}

export default function AnalysisModule({ onAnalysisComplete, lang, theme }: AnalysisModuleProps) {
  const t = translations[lang];
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CattleAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
      setResult(null);
      setError(null);
      setErrorDetail(null);
    }
  };

  const analyzeCattle = async () => {
    if (!preview) return;
    setIsAnalyzing(true);
    setError(null);
    setErrorDetail(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': lang === 'ar' ? 'ar' : 'en'
        },
        body: JSON.stringify({ image: preview })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "SERVER_ERROR");
      }

      const jsonResult = await response.json();
      
      const analysis: CattleAnalysis = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        imageUrl: preview,
        ...jsonResult
      };

      setResult(analysis);
      onAnalysisComplete(analysis);
    } catch (err: any) {
      console.error(err);
      const isKnownError = err.message !== "SERVER_ERROR" && err.message !== "Failed to fetch";
      setError(isKnownError ? "Analysis Failed" : "System Integrity Error");
      setErrorDetail(err.message === "SERVER_ERROR" 
        ? "The local analysis engine encountered a technical fault. Please check model availability."
        : err.message === "Failed to fetch"
        ? "Local database sync failed. Verify engine runtime status."
        : err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="space-y-4 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-cattle-green" />
          <h1 className="text-4xl font-black tracking-tight leading-none uppercase font-arabic">{t.analysis}</h1>
        </div>
        <p className={cn(
          "font-mono text-[10px] uppercase tracking-widest max-w-xl transition-colors duration-500",
          theme === 'dark' ? "text-cattle-text/40" : "text-black font-bold"
        )}>
          {t.subtitle} :: Machine extraction pipeline active.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Section */}
        <section className="lg:col-span-7 space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative min-h-[500px] border border-cattle-border bg-cattle-gray/30 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden corner-decor group",
              !preview && "hover:border-cattle-green/50 hover:bg-cattle-green/5"
            )}
          >
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-100 transition-all duration-700" />
            ) : (
              <div className="text-center space-y-4 z-10">
                <div className="w-14 h-14 border border-dashed border-cattle-text/20 rounded-full flex items-center justify-center mx-auto transition-all group-hover:border-cattle-green/50 group-hover:scale-110">
                  <Upload className="text-cattle-text/20 group-hover:text-cattle-green" size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity">{t.drop_image}</p>
                  <p className="text-[8px] text-cattle-text/20 font-mono mt-1">{t.supported}</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>

          <button
            onClick={analyzeCattle}
            disabled={!preview || isAnalyzing}
            className={cn(
              "w-full brutal-button flex items-center justify-center gap-3 h-14",
              isAnalyzing && "opacity-50 cursor-not-allowed"
            )}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                {t.analyzing}
              </>
            ) : (
              <>
                <Zap size={16} />
                {t.init_scan}
              </>
            )}
          </button>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/5 border border-red-500/30 p-5 flex flex-col gap-2 overflow-hidden"
              >
                <div className="flex items-center gap-3 text-red-500">
                  <AlertCircle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{error}</span>
                </div>
                {errorDetail && (
                  <p className="text-[9px] font-mono text-red-400/60 uppercase leading-relaxed ml-7">
                    {errorDetail}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Result Section */}
        <section className="lg:col-span-5 relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {!result && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 border border-cattle-border flex flex-col items-center justify-center text-center p-10 bg-cattle-gray/30 backdrop-blur-sm"
              >
                <div className="w-16 h-16 border border-cattle-border rotate-45 flex items-center justify-center mb-8 opacity-20">
                  <Search size={24} className="-rotate-45" />
                </div>
                <h3 className="font-bold text-cattle-text/20 uppercase tracking-[0.3em] text-[10px]">{t.awaiting}</h3>
                <p className="text-[9px] text-cattle-text/10 font-mono mt-3">{t.signal_null}</p>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-cattle-black/90 z-10 flex flex-col items-center justify-center space-y-8"
              >
                    <div className="flex gap-1 items-end h-8">
                      <motion.div animate={{ height: [4, 32, 4] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-1 bg-cattle-green" />
                      <motion.div animate={{ height: [4, 32, 4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.1 }} className="w-1 bg-cattle-blue" />
                      <motion.div animate={{ height: [4, 32, 4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1 bg-cattle-purple" />
                      <motion.div animate={{ height: [4, 32, 4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.3 }} className="w-1 bg-cattle-amber" />
                      <motion.div animate={{ height: [4, 32, 4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1 bg-cattle-green" />
                    </div>
                <div className="text-center font-mono opacity-30">
                  <p className="text-[9px] tracking-widest animate-pulse mb-1">{t.decoding}</p>
                  <p className="text-[9px] tracking-widest animate-pulse">{t.extracting}</p>
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-cattle-green text-black p-6 corner-decor">
                  <p className="text-[9px] font-mono font-bold tracking-[0.3em] uppercase opacity-60">{t.verified}</p>
                  <h2 className="text-5xl font-black italic tracking-tighter leading-none mt-2 font-arabic">{result.breed}</h2>
                </div>

                {result.topMatches && (
                  <div className="space-y-4 p-6 border border-cattle-border bg-cattle-gray/30 backdrop-blur-sm">
                    <h3 className="text-[10px] font-bold text-cattle-green uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Zap size={12} /> {t.top_matches}
                    </h3>
                    <div className="space-y-3">
                      {result.topMatches.map((match, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono uppercase">
                            <span className={cn(idx === 0 ? "text-cattle-green" : "text-white/40")}>
                              #{idx + 1} {match.breed}
                            </span>
                            <span className="text-white/20">{Math.round(match.confidence * 100)}%</span>
                          </div>
                          <div className="h-1 bg-white/5 w-full overflow-hidden flex">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${match.confidence * 100}%` }}
                              className={cn(
                                "h-full", 
                                idx === 0 ? "bg-cattle-green" : 
                                idx === 1 ? "bg-cattle-blue" :
                                idx === 2 ? "bg-cattle-purple" :
                                idx === 3 ? "bg-cattle-amber" : "bg-white/20"
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-6 p-6 border border-cattle-border bg-cattle-gray/50 backdrop-blur-md">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-cattle-green uppercase tracking-widest flex items-center gap-2">
                       {t.overview}
                    </h4>
                    <p className="text-xs leading-relaxed text-cattle-text/60 font-medium">{result.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-px bg-cattle-border">
                    <CharacteristicItem label={t.origin} value={result.characteristics.origin} />
                    <CharacteristicItem label={t.hardiness} value={result.characteristics.hardiness} />
                    <CharacteristicItem label={t.weight} value={result.characteristics.weightRange} />
                    {result.characteristics.milkProduction && (
                      <CharacteristicItem label={t.utility} value={result.characteristics.milkProduction} />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-cattle-text/20 uppercase tracking-widest px-1">
                  <span>BIO_ID: {result.id.split('-')[0]}</span>
                  <span className="text-cattle-green opacity-50">{t.confidence}: {Math.round(result.confidence * 100)}%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}

function CharacteristicItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-cattle-black/40 p-4 border-cattle-border group hover:bg-cattle-green/5 transition-colors">
      <p className="text-[8px] font-mono text-cattle-green/60 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-[11px] font-bold uppercase tracking-tight text-cattle-text/90">{value}</p>
    </div>
  );
}
