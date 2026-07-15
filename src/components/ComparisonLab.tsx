import React, { useState, useEffect } from 'react';
import { Car } from '../types';
import { CARS } from '../data';
import { HelpCircle, Sparkles, RefreshCw, Trophy, Zap, Compass, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ComparisonLab: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['bugatti-tourbillon', 'pagani-utopia']);
  const [isRacing, setIsRacing] = useState(false);
  const [raceProgress, setRaceProgress] = useState(0); // 0 to 100
  const [racePositions, setRacePositions] = useState<Record<string, number>>({}); // id -> distance (meters)
  const [raceSpeeds, setRaceSpeeds] = useState<Record<string, number>>({}); // id -> mph
  const [raceResults, setRaceResults] = useState<Array<{ id: string; et: number; trapSpeed: number; position: number }>>([]);

  const selectedCars = CARS.filter((car) => selectedIds.includes(car.id));

  const handleToggleCar = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
    // Reset race state on selection change
    handleResetRace();
  };

  const handleResetRace = () => {
    setIsRacing(false);
    setRaceProgress(0);
    setRacePositions({});
    setRaceSpeeds({});
    setRaceResults([]);
  };

  // Run Physics Drag Race Simulation
  const startDragRace = () => {
    handleResetRace();
    setIsRacing(true);
    
    // Physics constants
    const targetDistance = 402.336; // Quarter mile in meters
    const timeStep = 0.05; // 50ms simulation intervals
    
    // Initialize simulation variables
    const positions: Record<string, number> = {};
    const velocities: Record<string, number> = {}; // m/s
    const elapsedTimes: Record<string, number> = {};
    const finalEt: Record<string, number> = {};
    const finalTrapSpeed: Record<string, number> = {};
    const finished: Record<string, boolean> = {};

    selectedCars.forEach((car) => {
      positions[car.id] = 0;
      velocities[car.id] = 0.1; // small kick-off velocity
      elapsedTimes[car.id] = 0;
      finished[car.id] = false;
    });

    let currentSimTime = 0;
    const maxSimTime = 15.0; // safety limit

    // Full numerical integration loop
    while (Object.values(finished).some((f) => !f) && currentSimTime < maxSimTime) {
      currentSimTime += timeStep;

      selectedCars.forEach((car) => {
        if (finished[car.id]) return;

        elapsedTimes[car.id] = currentSimTime;

        const mass = car.weight;
        const hp = car.power;
        const drivetrain = car.drivetrain;

        // Convert HP to Watts
        const powerInWatts = hp * 745.7;

        // Traction launch limits: AWD launches at 1.15g max, RWD at 0.78g max due to tire friction
        const gravity = 9.81;
        const maxTractionAcc = drivetrain === 'AWD' ? 1.15 * gravity : 0.78 * gravity;

        // Force = Power / Velocity
        const velocity = velocities[car.id];
        let engineForce = powerInWatts / velocity;

        // Cap engine force by weight and traction (clutch / wheelspin phase)
        const maxTractionForce = mass * maxTractionAcc;
        if (engineForce > maxTractionForce) {
          engineForce = maxTractionForce;
        }

        // Aerodynamic drag force: F_drag = 0.5 * rho * Cd * A * v^2
        // Approximating drag coefficient and frontal area based on category
        const cdA = car.category === 'Track Weapon' ? 0.45 : 0.38; // Track weapons have higher drag due to wings
        const rho = 1.2; // air density kg/m3
        const dragForce = 0.5 * rho * cdA * velocity * velocity;

        // Net force and acceleration
        const netForce = engineForce - dragForce;
        const acceleration = Math.max(0.1, netForce / mass);

        // Update velocity & position
        velocities[car.id] += acceleration * timeStep;
        positions[car.id] += velocities[car.id] * timeStep;

        // Check if car crossed the line
        if (positions[car.id] >= targetDistance) {
          finished[car.id] = true;
          finalEt[car.id] = currentSimTime;
          finalTrapSpeed[car.id] = velocities[car.id] * 2.23694; // m/s to mph
        }
      });
    }

    // Now animate the visual progress based on the simulation results
    // We want the total animation to take 4.5 seconds
    const totalAnimDuration = 4500;
    const renderInterval = 50; // 50ms ticks
    const steps = totalAnimDuration / renderInterval;
    let stepCount = 0;

    const intervalId = setInterval(() => {
      stepCount++;
      const ratio = stepCount / steps;
      setRaceProgress(Math.min(100, ratio * 100));

      const updatedPositions: Record<string, number> = {};
      const updatedSpeeds: Record<string, number> = {};

      selectedCars.forEach((car) => {
        const et = finalEt[car.id];
        const trapMph = finalTrapSpeed[car.id];
        
        // Visual compression factor to make them fit the timeline
        const carTime = ratio * (et + 0.5); // buffer for deceleration
        
        if (carTime >= et) {
          // Finished
          updatedPositions[car.id] = targetDistance;
          updatedSpeeds[car.id] = trapMph;
        } else {
          // Approximate position/speed during the run using a power curve for visual smooth representation
          const completionRatio = carTime / et;
          // distance follows roughly a quadratic path
          updatedPositions[car.id] = targetDistance * Math.pow(completionRatio, 1.8);
          // speed increases with log-ish curve
          updatedSpeeds[car.id] = trapMph * Math.pow(completionRatio, 0.65);
        }
      });

      setRacePositions(updatedPositions);
      setRaceSpeeds(updatedSpeeds);

      if (stepCount >= steps) {
        clearInterval(intervalId);
        
        // Compile results sorted by elapsed time
        const results = selectedCars.map((car) => ({
          id: car.id,
          et: finalEt[car.id],
          trapSpeed: finalTrapSpeed[car.id],
          position: 0 // Will fill next
        }));
        results.sort((a, b) => a.et - b.et);
        
        const finalRankings = results.map((res, index) => ({
          ...res,
          position: index + 1
        }));

        setRaceResults(finalRankings);
        setIsRacing(false);
      }
    }, renderInterval);
  };

  // Identify Best Spec values to highlight them in the grid
  const getBestSpec = (specName: keyof Car, type: 'min' | 'max'): string | number => {
    let bestValue = type === 'min' ? Infinity : -Infinity;
    let bestId = '';

    selectedCars.forEach((car) => {
      const val = car[specName];
      if (typeof val === 'number') {
        if (type === 'min' && val < bestValue) {
          bestValue = val;
          bestId = car.id;
        } else if (type === 'max' && val > bestValue) {
          bestValue = val;
          bestId = car.id;
        }
      }
    });

    return bestId;
  };

  const bestHpId = getBestSpec('power', 'max');
  const bestSpeedId = getBestSpec('topSpeed', 'max');
  const bestWeightId = getBestSpec('weight', 'min');
  const bestAccId = getBestSpec('acceleration', 'min');
  const bestPriceId = getBestSpec('price', 'min');

  return (
    <div className="space-y-12">
      {/* Roster Picker Section */}
      <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-900 glow-titanium">
        <h2 className="font-display text-xl font-bold text-zinc-100 mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-gold-500" /> Comparison Lab Matrix
        </h2>
        <p className="text-zinc-400 text-xs font-mono mb-6">
          SELECT 2 OR 3 LUXURY MODELS TO CONSTRUCT AN APEX SPEC SHEET COMPARISON.
        </p>

        {/* Small Horizontal Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {CARS.map((car) => {
            const isSelected = selectedIds.includes(car.id);
            const isDisabled = !isSelected && selectedIds.length >= 3;
            
            return (
              <button
                key={car.id}
                disabled={isDisabled}
                onClick={() => handleToggleCar(car.id)}
                className={`relative p-3 rounded-lg border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gold-500/10 border-gold-500/40 text-white shadow-md'
                    : isDisabled
                    ? 'opacity-40 bg-zinc-950 border-zinc-900 cursor-not-allowed'
                    : 'bg-zinc-900/40 border-zinc-900 hover:border-zinc-800 text-zinc-400'
                }`}
              >
                <div>
                  <span className="block text-[9px] font-mono tracking-wider text-zinc-500 uppercase">
                    {car.brand}
                  </span>
                  <span className="block text-xs font-semibold font-display line-clamp-1">
                    {car.model}
                  </span>
                </div>
                
                <span className="text-[10px] font-mono text-zinc-500">
                  {car.power} hp
                </span>
                
                {isSelected && (
                  <div className="absolute top-1 right-1.5 flex items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Spec Matrix */}
      <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-950">
        <table className="w-full text-left border-collapse font-mono text-xs text-zinc-300">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-900/30">
              <th className="p-4 font-display text-zinc-500 w-1/4">SPECIFICATIONS</th>
              {selectedCars.map((car) => (
                <th key={car.id} className="p-4 w-1/4">
                  <span className="block text-[10px] font-mono tracking-widest text-gold-500 uppercase">{car.brand}</span>
                  <span className="text-sm font-bold font-display text-white">{car.model}</span>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-zinc-900/60">
            {/* Class/Category */}
            <tr>
              <td className="p-4 text-zinc-500 font-sans">Category</td>
              {selectedCars.map((car) => (
                <td key={car.id} className="p-4">
                  <span className="rounded bg-zinc-900 px-2 py-0.5 text-[10px] border border-zinc-800 text-zinc-300">
                    {car.category}
                  </span>
                </td>
              ))}
            </tr>
            
            {/* Base MSRP */}
            <tr>
              <td className="p-4 text-zinc-500 font-sans">Price (USD)</td>
              {selectedCars.map((car) => (
                <td key={car.id} className={`p-4 ${car.id === bestPriceId ? 'text-gold-400 font-semibold' : ''}`}>
                  {car.priceString}
                  {car.id === bestPriceId && <span className="ml-2 text-[9px] font-semibold bg-gold-500/10 px-1 py-0.5 rounded">BEST VALUE</span>}
                </td>
              ))}
            </tr>

            {/* Powertrain Description */}
            <tr>
              <td className="p-4 text-zinc-500 font-sans">Engine / Hybridization</td>
              {selectedCars.map((car) => (
                <td key={car.id} className="p-4 text-zinc-400 leading-normal max-w-[200px]">
                  {car.engine}
                </td>
              ))}
            </tr>

            {/* Peak HP */}
            <tr>
              <td className="p-4 text-zinc-500 font-sans">Horsepower</td>
              {selectedCars.map((car) => (
                <td key={car.id} className={`p-4 ${car.id === bestHpId ? 'text-green-400 font-bold' : ''}`}>
                  {car.power} hp
                  {car.id === bestHpId && <span className="ml-2 text-[9px] bg-green-500/10 px-1 py-0.5 rounded">APEX POWER</span>}
                </td>
              ))}
            </tr>

            {/* Torque */}
            <tr>
              <td className="p-4 text-zinc-500 font-sans">Torque</td>
              {selectedCars.map((car) => (
                <td key={car.id} className="p-4 text-zinc-100">
                  {car.torque} Nm
                </td>
              ))}
            </tr>

            {/* 0-60 MPH */}
            <tr>
              <td className="p-4 text-zinc-500 font-sans">0 - 60 MPH Time</td>
              {selectedCars.map((car) => (
                <td key={car.id} className={`p-4 ${car.id === bestAccId ? 'text-green-400 font-bold' : ''}`}>
                  {car.acceleration} seconds
                  {car.id === bestAccId && <span className="ml-2 text-[9px] bg-green-500/10 px-1 py-0.5 rounded">FASTEST</span>}
                </td>
              ))}
            </tr>

            {/* V-Max Top Speed */}
            <tr>
              <td className="p-4 text-zinc-500 font-sans">Top Speed</td>
              {selectedCars.map((car) => (
                <td key={car.id} className={`p-4 ${car.id === bestSpeedId ? 'text-red-400 font-bold animate-pulse' : ''}`}>
                  {car.topSpeed} mph
                  {car.id === bestSpeedId && <span className="ml-2 text-[9px] bg-red-500/10 px-1 py-0.5 rounded">FASTEST</span>}
                </td>
              ))}
            </tr>

            {/* Total Curb Weight */}
            <tr>
              <td className="p-4 text-zinc-500 font-sans">Weight (Curb)</td>
              {selectedCars.map((car) => (
                <td key={car.id} className={`p-4 ${car.id === bestWeightId ? 'text-green-400 font-bold' : ''}`}>
                  {car.weight} kg
                  {car.id === bestWeightId && <span className="ml-2 text-[9px] bg-green-500/10 px-1 py-0.5 rounded">LIGHTEST</span>}
                </td>
              ))}
            </tr>

            {/* Power-to-weight calculation */}
            <tr>
              <td className="p-4 text-zinc-500 font-sans flex items-center gap-1">
                Power-to-Weight
                <div className="group relative">
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-600 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 w-48 bg-black border border-zinc-800 text-zinc-400 p-2 rounded text-[10px] hidden group-hover:block z-50 leading-normal">
                    Horsepower per metric ton (1,000 kg). Higher means better physical acceleration.
                  </div>
                </div>
              </td>
              {selectedCars.map((car) => {
                const ratio = Math.round((car.power / car.weight) * 1000);
                return (
                  <td key={car.id} className="p-4 font-bold text-zinc-100">
                    {ratio} hp / ton
                  </td>
                );
              })}
            </tr>

            {/* Transmission */}
            <tr>
              <td className="p-4 text-zinc-500 font-sans">Gearbox</td>
              {selectedCars.map((car) => (
                <td key={car.id} className="p-4 text-zinc-300 leading-normal">
                  {car.transmission}
                </td>
              ))}
            </tr>

            {/* Drivetrain Layout */}
            <tr>
              <td className="p-4 text-zinc-500 font-sans">Drivetrain</td>
              {selectedCars.map((car) => (
                <td key={car.id} className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    car.drivetrain === 'AWD' 
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                      : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  }`}>
                    {car.drivetrain}
                  </span>
                </td>
              ))}
            </tr>

            {/* Rarity and Production */}
            <tr>
              <td className="p-4 text-zinc-500 font-sans">Production Volume</td>
              {selectedCars.map((car) => (
                <td key={car.id} className="p-4 text-zinc-400">
                  {car.productionVolume} Units Total
                </td>
              ))}
            </tr>

            {/* Origin */}
            <tr>
              <td className="p-4 text-zinc-500 font-sans">Manufactured</td>
              {selectedCars.map((car) => (
                <td key={car.id} className="p-4 text-zinc-300">
                  {car.origin}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Custom Power-to-weight Gauge comparison chart */}
      <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-900">
        <h3 className="font-display text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold-400" /> Powertrain Density (HP per Metric Ton)
        </h3>
        
        <div className="space-y-4">
          {selectedCars.map((car) => {
            const ratio = Math.round((car.power / car.weight) * 1000);
            // Cap visual max at 1200 for chart scaling
            const pct = Math.min(100, (ratio / 1200) * 100);
            
            return (
              <div key={car.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-300 font-semibold">{car.brand} {car.model}</span>
                  <span className="text-gold-400 font-bold">{ratio} hp / ton</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gold-600 to-gold-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1/4 Mile Drag Race Physics Simulator */}
      <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-red-500" /> Quarter-Mile (0-400m) Physics Simulator
            </h3>
            <p className="text-zinc-500 text-xs font-mono mt-1">
              ACCELERATION CURVES CALCULATE TRACTION SLIPPAGE, MASS RATIOS, AND AERODYNAMIC SPOILER DRAG.
            </p>
          </div>

          <div className="flex gap-2">
            {raceResults.length > 0 && (
              <button
                onClick={handleResetRace}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> RESET
              </button>
            )}
            <button
              disabled={isRacing}
              onClick={startDragRace}
              className="flex items-center gap-2 rounded-lg bg-red-500 hover:bg-red-600 px-5 py-2.5 text-xs font-mono font-semibold text-white tracking-wider transition-all shadow-lg shadow-red-950/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" /> {isRacing ? 'SIMULATING RUN...' : 'INITIATE DRAG RACE'}
            </button>
          </div>
        </div>

        {/* Visual Track Area */}
        <div className="bg-[#0b0b0c] rounded-xl border border-zinc-900 p-6 space-y-6 relative">
          
          {/* Track Lanes */}
          <div className="space-y-8 relative">
            {/* Start Line, Finish Line markers */}
            <div className="absolute left-16 top-0 bottom-0 border-l border-zinc-800 border-dashed z-0 pointer-events-none">
              <span className="absolute -top-5 left-1 text-[9px] font-mono text-zinc-600 uppercase tracking-widest">START</span>
            </div>
            <div className="absolute right-8 top-0 bottom-0 border-l border-red-500/40 border-dashed z-0 pointer-events-none">
              <span className="absolute -top-5 right-1 text-[9px] font-mono text-red-500/80 uppercase tracking-widest">FINISH</span>
            </div>

            {selectedCars.map((car, index) => {
              // Current distance (0 to 402m)
              const distance = racePositions[car.id] || 0;
              const speed = raceSpeeds[car.id] || 0;
              // Translate 402m into visual percentage (with offset for car icon size)
              const pct = (distance / 402.336) * 100;
              // Visual adjustment for starting point
              const visualPct = 8 + (pct * 0.82); 

              return (
                <div key={car.id} className="relative h-12 flex items-center">
                  {/* Lane Striping */}
                  <div className="absolute inset-0 bg-zinc-950/50 border-y border-zinc-900/60 rounded flex items-center px-4">
                    <span className="text-[10px] font-mono text-zinc-600 font-bold mr-4">LANE {index + 1}</span>
                    <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[120px]">
                      {car.brand} {car.model}
                    </span>
                  </div>

                  {/* Racing Object Indicator */}
                  <div
                    style={{ left: `${visualPct}%` }}
                    className="absolute z-10 -translate-x-1/2 flex items-center gap-2.5 transition-all duration-75"
                  >
                    {/* Car Silhouette/Badge */}
                    <div className="h-8 w-14 rounded bg-zinc-900 border border-gold-500/30 flex items-center justify-center relative glow-gold bg-cover bg-center overflow-hidden"
                         style={{ backgroundImage: `url(${car.image})` }}>
                      <div className="absolute inset-0 bg-black/40 hover:bg-transparent transition-all" />
                      <span className="absolute bottom-0.5 right-1.5 text-[8px] font-mono font-bold text-white bg-black/60 px-1 rounded">
                        {car.drivetrain}
                      </span>
                    </div>

                    {/* Live Specs telemetry */}
                    <div className="hidden sm:flex flex-col text-[9px] font-mono leading-tight bg-black/80 p-1.5 rounded border border-zinc-800">
                      <span className="text-zinc-400">{Math.round(distance)} m</span>
                      <span className="text-gold-400 font-bold">{Math.round(speed)} MPH</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Track Texture Gridlines */}
          <div className="absolute inset-0 pointer-events-none opacity-5 border border-zinc-800 grid grid-cols-12 rounded-xl" />
        </div>

        {/* Live Race Results readout */}
        <AnimatePresence>
          {raceResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="mt-6 p-5 rounded-xl border border-gold-500/20 bg-gold-950/5"
            >
              <h4 className="font-display text-xs font-semibold text-gold-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Trophy className="w-4 h-4" /> Official 1/4 Mile Speed slips
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                {raceResults.map((result) => {
                  const car = CARS.find((c) => c.id === result.id)!;
                  const isWinner = result.position === 1;

                  return (
                    <div
                      key={result.id}
                      className={`p-4 rounded-lg border flex flex-col justify-between ${
                        isWinner
                          ? 'bg-gold-500/10 border-gold-500/40 text-white'
                          : 'bg-zinc-900/30 border-zinc-900 text-zinc-400'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] uppercase font-bold text-zinc-500">
                            POSITION {result.position}
                          </span>
                          {isWinner && <span className="text-[10px] font-bold text-gold-400">APEX CHAMPION</span>}
                        </div>
                        <h5 className="font-display text-sm font-bold text-white mb-3">
                          {car.brand} {car.model}
                        </h5>
                      </div>

                      <div className="space-y-2 border-t border-zinc-900/40 pt-3">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">ELAPSED TIME (ET)</span>
                          <span className={`font-bold ${isWinner ? 'text-gold-400' : 'text-zinc-100'}`}>
                            {result.et.toFixed(3)} s
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">TRAP SPEED</span>
                          <span className="text-zinc-100">
                            {result.trapSpeed.toFixed(1)} mph
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-500">
                          <span>DRIVETRAIN / WEIGHT</span>
                          <span>{car.drivetrain} / {car.weight} kg</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
