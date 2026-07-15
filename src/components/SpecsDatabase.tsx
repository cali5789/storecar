import React, { useState } from 'react';
import { Car } from '../types';
import { CARS } from '../data';
import { Search, Filter, ShieldCheck, Cpu, Wind, Info, X, MapPin, Gauge } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SpecsDatabase: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [originFilter, setOriginFilter] = useState<string>('All');
  const [drivetrainFilter, setDrivetrainFilter] = useState<string>('All');
  const [activeCarId, setActiveCarId] = useState<string | null>(null);

  // Filter lists
  const categories = ['All', 'Hypercar', 'Track Weapon', 'Ultra-Luxury'];
  const origins = ['All', 'Italy', 'Sweden', 'France', 'UK', 'Germany'];
  const drivetrains = ['All', 'AWD', 'RWD'];

  // Filter logic
  const filteredCars = CARS.filter((car) => {
    const matchesSearch =
      car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.engine.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || car.category === categoryFilter;
    const matchesOrigin = originFilter === 'All' || car.origin === originFilter;
    const matchesDrivetrain = drivetrainFilter === 'All' || car.drivetrain === drivetrainFilter;

    return matchesSearch && matchesCategory && matchesOrigin && matchesDrivetrain;
  });

  const activeCar = CARS.find((car) => car.id === activeCarId);

  return (
    <div className="space-y-8 relative">
      {/* Search & Filter Header bar */}
      <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-900 glow-titanium flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
          
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by brand, model, engine configuration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-zinc-900/60 border border-zinc-800 py-2.5 pl-10 pr-4 text-xs text-zinc-100 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 placeholder:text-zinc-600 font-mono"
            />
          </div>

          {/* Quick Stats indicator */}
          <div className="flex items-center text-[11px] font-mono text-zinc-500 gap-2 px-3 bg-zinc-900/30 rounded-lg border border-zinc-900/60">
            <span className="text-gold-400 font-semibold">{filteredCars.length}</span> MODELS CATALOGUED
          </div>
        </div>

        {/* Filter Rows */}
        <div className="flex flex-wrap gap-4 pt-3 border-t border-zinc-900/40">
          
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
              <Filter className="w-3 h-3" /> CATEGORY:
            </span>
            <div className="flex gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20 font-semibold'
                      : 'bg-zinc-900/30 text-zinc-500 border border-zinc-900 hover:text-zinc-400'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Origin Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> ORIGIN:
            </span>
            <div className="flex gap-1 flex-wrap">
              {origins.map((orig) => (
                <button
                  key={orig}
                  onClick={() => setOriginFilter(orig)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                    originFilter === orig
                      ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20 font-semibold'
                      : 'bg-zinc-900/30 text-zinc-500 border border-zinc-900 hover:text-zinc-400'
                  }`}
                >
                  {orig.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Drivetrain Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
              <Gauge className="w-3 h-3" /> DRIVE:
            </span>
            <div className="flex gap-1">
              {drivetrains.map((drv) => (
                <button
                  key={drv}
                  onClick={() => setDrivetrainFilter(drv)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                    drivetrainFilter === drv
                      ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20 font-semibold'
                      : 'bg-zinc-900/30 text-zinc-500 border border-zinc-900 hover:text-zinc-400'
                  }`}
                >
                  {drv.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Cars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCars.map((car) => (
            <motion.div
              key={car.id}
              layout
              onClick={() => setActiveCarId(car.id)}
              className="group cursor-pointer rounded-xl bg-zinc-950 border border-zinc-900/80 p-5 hover:border-gold-500/30 transition-all duration-300 flex flex-col justify-between glow-titanium"
              whileHover={{ y: -3 }}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              {/* Image Thumbnail */}
              <div className="aspect-[16/10] w-full rounded-lg overflow-hidden relative mb-4 bg-zinc-900">
                <img
                  src={car.image}
                  alt={`${car.brand} ${car.model}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-zinc-800 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300">
                  {car.origin}
                </div>
              </div>

              {/* Header Title */}
              <div>
                <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase">
                  {car.brand}
                </span>
                <h3 className="font-display text-lg font-bold text-white group-hover:text-gold-400 transition-colors mb-2">
                  {car.model}
                </h3>
                
                {/* Micro-Spec Sheet */}
                <div className="grid grid-cols-3 gap-2 border-y border-zinc-900 py-3 mb-4 font-mono text-center">
                  <div>
                    <span className="block text-[9px] text-zinc-500 uppercase">HP</span>
                    <span className="text-xs font-semibold text-zinc-200">{car.power} hp</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-zinc-500 uppercase">0-60 MPH</span>
                    <span className="text-xs font-semibold text-zinc-200">{car.acceleration}s</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-zinc-500 uppercase">VMAX</span>
                    <span className="text-xs font-semibold text-red-400 font-bold">{car.topSpeed} mph</span>
                  </div>
                </div>
              </div>

              {/* Info Button */}
              <div className="flex items-center justify-between text-xs font-mono pt-1 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                <span>{car.priceString}</span>
                <span className="flex items-center gap-1 text-[11px] text-gold-400/80 font-semibold group-hover:text-gold-400">
                  <Info className="w-3.5 h-3.5" /> DETAILS
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredCars.length === 0 && (
          <div className="col-span-1 md:col-span-3 text-center py-12 text-zinc-500 font-mono text-xs">
            NO LUXURY MODELS MATCH THE APPLIED CRITERIA.
          </div>
        )}
      </div>

      {/* Expanded Car Detail Overlay (Custom Modal) */}
      <AnimatePresence>
        {activeCar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-4 md:p-10"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              className="w-full max-w-5xl rounded-xl bg-zinc-950 border border-zinc-900 overflow-hidden shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveCarId(null)}
                className="absolute top-5 right-5 z-40 bg-black/60 border border-zinc-800 rounded-full p-2 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Visual Column */}
                <div className="lg:col-span-5 relative bg-zinc-900 aspect-video lg:aspect-auto min-h-[300px]">
                  <img
                    src={activeCar.image}
                    alt={activeCar.model}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-black/30 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-zinc-950 pointer-events-none" />
                </div>

                {/* Content Column */}
                <div className="lg:col-span-7 p-6 md:p-10 text-left overflow-y-auto max-h-[85vh]">
                  {/* Category, Brand, Name */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="rounded bg-gold-500/10 px-2.5 py-0.5 text-[10px] font-mono tracking-wider uppercase text-gold-400 border border-gold-500/20">
                      {activeCar.category}
                    </span>
                    <span className="text-zinc-500 font-mono text-xs">Origin: {activeCar.origin}</span>
                  </div>

                  <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-1">
                    {activeCar.brand} <span className="text-gold-400">{activeCar.model}</span>
                  </h2>
                  <p className="font-mono text-xs text-zinc-400 mb-6 border-b border-zinc-900 pb-4">
                    MSRP: {activeCar.priceString} &middot; production volume: {activeCar.productionVolume} Units Total
                  </p>

                  {/* Core specs block */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-zinc-900/20 border border-zinc-900 mb-6 font-mono text-center">
                    <div>
                      <span className="block text-[9px] text-zinc-500 uppercase mb-1">Curb Weight</span>
                      <span className="text-sm font-semibold text-zinc-200">{activeCar.weight} kg</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-zinc-500 uppercase mb-1">Peak Horsepower</span>
                      <span className="text-sm font-semibold text-zinc-200">{activeCar.power} hp</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-zinc-500 uppercase mb-1">0-60 MPH Acceleration</span>
                      <span className="text-sm font-semibold text-zinc-200">{activeCar.acceleration}s</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-zinc-500 uppercase mb-1">Engine V-Max</span>
                      <span className="text-sm font-bold text-red-400">{activeCar.topSpeed} mph</span>
                    </div>
                  </div>

                  {/* Narrative breakdown */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                        VEHICLE OVERVIEW
                      </h4>
                      <p className="text-zinc-300 text-[13px] font-sans leading-6">
                        {activeCar.description}
                      </p>
                    </div>

                    {/* Highlights */}
                    <div>
                      <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-gold-400" /> Engineering Innovations
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[11px] text-zinc-400">
                        {activeCar.highlights.map((item, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-gold-500 font-bold">&middot;</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Extended Technical specs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-900">
                      {/* Design Ethos panel */}
                      <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-900/60 text-xs">
                        <h5 className="font-display font-semibold text-gold-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5" /> Design Language
                        </h5>
                        <p className="text-zinc-400 font-sans leading-normal text-[11.5px]">
                          {activeCar.designEthos}
                        </p>
                      </div>

                      {/* Aero features panel */}
                      <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-900/60 text-xs">
                        <h5 className="font-display font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Wind className="w-3.5 h-3.5" /> Aerodynamic Systems
                        </h5>
                        <p className="text-zinc-400 font-sans leading-normal text-[11.5px]">
                          {activeCar.aeroFeatures}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
