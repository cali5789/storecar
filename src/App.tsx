import React, { useState, useEffect } from 'react';
import { CARS, BLOG_POSTS } from './data';
import { BlogPost, Car } from './types';
import { BlogCard } from './components/BlogCard';
import { BlogDetail } from './components/BlogDetail';
import { ComparisonLab } from './components/ComparisonLab';
import { SpecsDatabase } from './components/SpecsDatabase';
import {
  Compass,
  BookOpen,
  SlidersHorizontal,
  Flame,
  Award,
  Clock,
  Briefcase,
  Heart,
  ChevronRight,
  TrendingUp,
  MapPin,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'journal' | 'comparison' | 'encyclopedia';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('journal');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  // Virtual Garage state (stores car IDs)
  const [garage, setGarage] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState('');

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load garage from localStorage
  useEffect(() => {
    const savedGarage = localStorage.getItem('enthusiast_garage');
    if (savedGarage) {
      setGarage(JSON.parse(savedGarage));
    } else {
      // Default seed: Bugatti Tourbillon and Porsche GT3 RS
      const defaultGarage = ['bugatti-tourbillon', 'porsche-gt3rs'];
      setGarage(defaultGarage);
      localStorage.setItem('enthusiast_garage', JSON.stringify(defaultGarage));
    }
  }, []);

  const handleToggleGarage = (carId: string) => {
    let updated: string[];
    if (garage.includes(carId)) {
      updated = garage.filter((id) => id !== carId);
    } else {
      updated = [...garage, carId];
    }
    setGarage(updated);
    localStorage.setItem('enthusiast_garage', JSON.stringify(updated));
  };

  // Compute Garage Stats
  const garageCars = CARS.filter((car) => garage.includes(car.id));
  const totalValue = garageCars.reduce((sum, car) => sum + car.price, 0);
  const totalPower = garageCars.reduce((sum, car) => sum + car.power, 0);
  const averageAcc = garageCars.length > 0
    ? (garageCars.reduce((sum, car) => sum + car.acceleration, 0) / garageCars.length).toFixed(2)
    : '0.00';

  const formatCurrency = (val: number) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(2)}M`;
    }
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-gold-500 selection:text-black">
      
      {/* Upper Navigation Rail */}
      <header className="border-b border-zinc-900 bg-zinc-950 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center font-display font-black text-black text-sm tracking-tight shadow-lg shadow-gold-500/15">
              A
            </div>
            <div>
              <span className="font-display text-base font-black tracking-wider text-white">APEX</span>
              <span className="text-[9px] font-mono font-medium text-gold-400 ml-1.5 border border-gold-500/30 px-1.5 py-0.5 rounded bg-gold-950/20">
                LABS
              </span>
            </div>
          </div>

          {/* Central Tabs */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => { setActiveTab('journal'); setSelectedPost(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === 'journal'
                  ? 'bg-zinc-900 text-gold-400 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> THE JOURNAL
            </button>
            <button
              onClick={() => { setActiveTab('comparison'); setSelectedPost(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === 'comparison'
                  ? 'bg-zinc-900 text-gold-400 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> COMPARISON LAB
            </button>
            <button
              onClick={() => { setActiveTab('encyclopedia'); setSelectedPost(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === 'encyclopedia'
                  ? 'bg-zinc-900 text-gold-400 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> ENCYCLOPEDIA
            </button>
          </nav>

          {/* Right Telemetry Clock */}
          <div className="hidden md:flex items-center gap-2 text-zinc-500 text-[11px] font-mono border-l border-zinc-900 pl-6 h-8">
            <Clock className="w-3.5 h-3.5 text-zinc-600" />
            <span>UTC TICK:</span>
            <span className="text-zinc-300 font-bold tracking-widest">{currentTime || '00:00:00'}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          
          {/* 1. EDITORIAL JOURNAL VIEW */}
          {activeTab === 'journal' && !selectedPost && (
            <motion.div
              key="journal-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-12"
            >
              {/* Showcase Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-zinc-950 rounded-xl border border-zinc-900 overflow-hidden glow-titanium">
                
                {/* Hero Story details */}
                <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-between text-left">
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono bg-gold-500/10 text-gold-400 border border-gold-500/20 px-2.5 py-1 rounded">
                      FEATURED ARTICLE
                    </span>
                    <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                      The V16 Renaissance
                    </h1>
                    <p className="text-zinc-400 text-sm leading-relaxed font-sans">
                      Bugatti abandons W16 quad-turbos for a high-revving 9,500 RPM Cosworth V16 coupled with state-of-the-art radial flux electric power. Step inside the horological cockpit.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-zinc-900 flex items-center justify-between">
                    <div className="text-xs font-mono text-zinc-500">
                      <span>BY ALEXANDER THORNE</span>
                      <span className="block text-[10px] text-zinc-600">6 min read &middot; Bugatti Tourbillon</span>
                    </div>
                    <button
                      onClick={() => setSelectedPost(BLOG_POSTS[0])}
                      className="flex items-center gap-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black px-4 py-2.5 text-xs font-mono font-medium transition-all cursor-pointer"
                    >
                      READ STORY <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Big Banner Visual */}
                <div className="lg:col-span-7 relative bg-zinc-900 aspect-video lg:aspect-auto min-h-[300px]">
                  <img
                    src={BLOG_POSTS[0].featuredImage}
                    alt="Bugatti Tourbillon"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-101"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/30 pointer-events-none" />
                </div>
              </div>

              {/* Bento Grid with Journal List & Virtual Garage */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Article Feed */}
                <div className="lg:col-span-8 space-y-6 text-left">
                  <h2 className="font-display text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-gold-500" /> Engineering Chronicles
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {BLOG_POSTS.slice(1).map((post) => (
                      <BlogCard
                        key={post.id}
                        post={post}
                        onClick={() => setSelectedPost(post)}
                      />
                    ))}
                  </div>
                </div>

                {/* Virtual Garage Widget (Sidebar) */}
                <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                  
                  {/* Virtual Garage Panel */}
                  <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-900 glow-titanium relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-xl pointer-events-none" />
                    
                    <h3 className="font-display text-sm font-semibold text-zinc-100 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <Award className="w-4 h-4 text-gold-400" /> Virtual Garage
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-500 mb-6">
                      BUILD YOUR ULTIMATE HYPERCAR STABLE & TRACK COMBINED SPEC STATISTICS.
                    </p>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-6 font-mono text-center">
                      <div className="bg-zinc-900/40 border border-zinc-900 p-2.5 rounded-lg">
                        <span className="block text-[9px] text-zinc-500 uppercase mb-0.5">Worth</span>
                        <span className="text-xs font-bold text-gold-400">{formatCurrency(totalValue)}</span>
                      </div>
                      <div className="bg-zinc-900/40 border border-zinc-900 p-2.5 rounded-lg">
                        <span className="block text-[9px] text-zinc-500 uppercase mb-0.5">Total HP</span>
                        <span className="text-xs font-bold text-zinc-200">{totalPower} hp</span>
                      </div>
                      <div className="bg-zinc-900/40 border border-zinc-900 p-2.5 rounded-lg">
                        <span className="block text-[9px] text-zinc-500 uppercase mb-0.5">Avg 0-60</span>
                        <span className="text-xs font-bold text-red-400">{averageAcc}s</span>
                      </div>
                    </div>

                    {/* Parked Cars List / Selectors */}
                    <div className="space-y-2 border-t border-zinc-900/60 pt-4">
                      <h4 className="font-display text-[10px] font-bold text-zinc-500 tracking-wider uppercase mb-3">
                        Garage Inventory Checklist
                      </h4>

                      <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                        {CARS.map((car) => {
                          const isParked = garage.includes(car.id);
                          return (
                            <div
                              key={car.id}
                              className="flex items-center justify-between py-1.5 px-3 rounded bg-zinc-900/20 border border-zinc-900/60 text-xs font-mono"
                            >
                              <span className="text-zinc-300 truncate max-w-[170px]">
                                {car.brand} <span className="text-zinc-500">{car.model}</span>
                              </span>
                              
                              <button
                                onClick={() => handleToggleGarage(car.id)}
                                className={`px-2 py-1 rounded text-[9px] font-semibold transition-all cursor-pointer ${
                                  isParked
                                    ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-500 border border-zinc-800'
                                }`}
                              >
                                {isParked ? 'PARKED' : '+ PARK'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Curated quote card */}
                  <div className="rounded-xl border border-zinc-900 p-5 bg-zinc-900/10 text-left">
                    <p className="text-xs italic text-zinc-400 leading-normal mb-3">
                      "I don't just build cars. I design functional artwork that harnesses the wind and respects mechanical clockwork."
                    </p>
                    <span className="text-[10px] font-mono text-zinc-500">— HORACIO PAGANI</span>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* 1B. JOURNAL DETAIL VIEW */}
          {activeTab === 'journal' && selectedPost && (
            <motion.div
              key="journal-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <BlogDetail
                post={selectedPost}
                onBack={() => setSelectedPost(null)}
              />
            </motion.div>
          )}

          {/* 2. SPEC LAB / COMPARISON LAB VIEW */}
          {activeTab === 'comparison' && (
            <motion.div
              key="comparison-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <ComparisonLab />
            </motion.div>
          )}

          {/* 3. ENCYCLOPEDIA DATABASE VIEW */}
          {activeTab === 'encyclopedia' && (
            <motion.div
              key="encyclopedia-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <SpecsDatabase />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-[11px] font-mono text-zinc-600 mt-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            &copy; {new Date().getFullYear()} APEX AUTOMOTIVE MEDIA. ALL DESIGN INTEGRITY PROTECTED.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-gold-400 cursor-pointer">COSWORTH ALLIANCE</span>
            <span className="text-zinc-800">|</span>
            <span className="hover:text-gold-400 cursor-pointer">HOROLOGIC LABS</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
