import { useState, useEffect, useRef } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $shopFilters, updateFilters, type ShopFiltersState } from '../stores/shopStore';

const ALL_PLATFORMS = [
  'PlayStation 5', 'PlayStation 4', 'PlayStation 3', 'PlayStation 2', 'PlayStation 1', 'PSP', 'PS Vita',
  'Nintendo Switch', 'Nintendo Wii U', 'Nintendo Wii', 'Nintendo GameCube', 'Nintendo 64', 'SNES', 'NES',
  'GameBoy', 'GameBoy Color', 'GameBoy Advance', 'Nintendo DS', 'Nintendo 3DS',
  'Xbox Series X', 'Xbox One', 'Xbox 360', 'Xbox Classic',
  'Sega Dreamcast', 'Sega Saturn', 'Sega Genesis', 'Sega Game Gear',
  'PC', 'Atari', 'Neo Geo'
];

const CONDITIONS = [
  { value: 'NEW', label: 'Nieuw' },
  { value: 'CIB', label: 'CIB (Compleet)' },
  { value: 'LOOSE', label: 'Loose (Alleen disk/card)' },
  { value: 'NO_MANUAL', label: 'Zonder handleiding' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Relevantie (Nieuwste)' },
  { value: 'price_asc', label: 'Prijs laag naar hoog' },
  { value: 'price_desc', label: 'Prijs hoog naar laag' }
];

export default function ShopFilters() {
  const filters = useStore($shopFilters);
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice);

  // Sync internal state when store changes (e.g. from "Clear Filters")
  useEffect(() => {
    setLocalSearch(filters.search);
    setLocalMaxPrice(filters.maxPrice);
  }, [filters.search, filters.maxPrice]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        updateFilters({ search: localSearch });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const togglePlatform = (p: string) => {
    const next = filters.platforms.includes(p)
      ? filters.platforms.filter(x => x !== p)
      : [...filters.platforms, p];
    updateFilters({ platforms: next });
  };

  const toggleCondition = (c: string) => {
    const next = filters.conditions.includes(c)
      ? filters.conditions.filter(x => x !== c)
      : [...filters.conditions, c];
    updateFilters({ conditions: next });
  };

  return (
    <div class="space-y-8">
      {/* Search */}
      <div class="relative group">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm group-focus-within:text-deal-green transition-colors">search</span>
        <input 
          type="text"
          value={localSearch}
          onInput={(e: any) => setLocalSearch(e.target.value)}
          placeholder="Producten zoeken..."
          class="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-deal-green/50 focus:ring-1 focus:ring-deal-green/20 transition-all font-inter text-white"
        />
      </div>

      {/* Sorting */}
      <div>
        <h3 class="font-orbitron text-[10px] tracking-[0.2em] uppercase text-deal-purple mb-4">SORTEREN OP</h3>
        <div class="relative">
          <select 
            value={filters.sortBy}
            onChange={(e: any) => updateFilters({ sortBy: e.target.value })}
            class="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg py-2.5 px-4 text-xs focus:outline-none focus:border-deal-green/50 text-white appearance-none cursor-pointer font-orbitron font-bold tracking-widest uppercase transition-all"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} class="bg-[#1a1a22] text-white py-2">{opt.label}</option>
            ))}
          </select>
          <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">expand_more</span>
        </div>
      </div>

      {/* Platforms */}
      <div>
        <h3 class="font-orbitron text-[10px] tracking-[0.2em] uppercase text-deal-purple mb-4">PLATFORMS</h3>
        <div class="space-y-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
          {ALL_PLATFORMS.map(p => (
            <label key={p} class="flex items-center gap-3 group cursor-pointer py-0.5">
              <div 
                onClick={() => togglePlatform(p)}
                class={`w-4 h-4 rounded border transition-all flex items-center justify-center flex-shrink-0 ${
                  filters.platforms.includes(p) 
                  ? 'bg-deal-green border-deal-green shadow-[0_0_10px_rgba(0,255,136,0.3)]' 
                  : 'border-outline-variant/50 group-hover:border-deal-green/50'
                }`}
              >
                {filters.platforms.includes(p) && <span class="material-symbols-outlined text-[10px] text-black font-bold">check</span>}
              </div>
              <span class={`text-[11px] font-medium transition-colors tracking-wide ${filters.platforms.includes(p) ? 'text-white' : 'text-on-surface-variant group-hover:text-white'}`}>
                {p}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <h3 class="font-orbitron text-[10px] tracking-[0.2em] uppercase text-deal-purple mb-4">CONDITIE</h3>
        <div class="space-y-2">
          {CONDITIONS.map(c => (
            <label key={c.value} class="flex items-center gap-3 group cursor-pointer">
              <div 
                onClick={() => toggleCondition(c.value)}
                class={`w-4 h-4 rounded border transition-all flex items-center justify-center flex-shrink-0 ${
                  filters.conditions.includes(c.value) 
                  ? 'bg-deal-green border-deal-green shadow-[0_0_10px_rgba(0,255,136,0.3)]' 
                  : 'border-outline-variant/50 group-hover:border-deal-green/50'
                }`}
              >
                {filters.conditions.includes(c.value) && <span class="material-symbols-outlined text-[10px] text-black font-bold">check</span>}
              </div>
              <span class={`text-[11px] font-medium transition-colors tracking-wide ${filters.conditions.includes(c.value) ? 'text-white' : 'text-on-surface-variant group-hover:text-white'}`}>
                {c.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div>
        <div class="flex justify-between items-center mb-5">
          <h3 class="font-orbitron text-[10px] tracking-[0.2em] uppercase text-deal-purple">PRIJS</h3>
          <span class="font-orbitron text-xs font-black text-deal-green bg-deal-green/10 px-2 py-0.5 rounded border border-deal-green/20 shadow-[0_0_10px_rgba(0,255,136,0.1)] transition-all">
            MAX €{localMaxPrice}
          </span>
        </div>
        <div class="px-1 relative">
          <input 
            type="range"
            min="0"
            max="500"
            step="10"
            value={localMaxPrice}
            title="Snel Prijs Filter"
            onInput={(e: any) => setLocalMaxPrice(parseInt(e.target.value))}
            onChange={(e: any) => updateFilters({ maxPrice: parseInt(e.target.value) })}
            class="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-deal-green focus:outline-none"
          />
          <div class="flex justify-between mt-4">
            <div class="flex flex-col items-center">
               <div class="w-px h-1 bg-deal-green/50 mb-1"></div>
               <span class="font-orbitron text-[11px] font-black text-white bg-[#1a1a22] px-2 py-0.5 border border-white/20 rounded shadow-[0_0_15px_rgba(255,255,255,0.05)]">€0</span>
            </div>
            <div class="flex flex-col items-center">
               <div class="w-px h-1 bg-deal-green/30 mb-1"></div>
               <span class="font-orbitron text-[11px] font-black text-white/70 bg-[#1a1a22] px-2 py-0.5 border border-white/10 rounded">€250</span>
            </div>
            <div class="flex flex-col items-center">
               <div class="w-px h-1 bg-deal-green/30 mb-1"></div>
               <span class="font-orbitron text-[11px] font-black text-white/90 bg-[#1a1a22] px-2 py-0.5 border border-white/10 rounded">€500+</span>
            </div>
          </div>
        </div>
      </div>

      {/* In Stock */}
      <div class="pt-4">
        <label class="flex items-center gap-3 group cursor-pointer p-3 bg-surface-container-low/50 border border-outline-variant/10 rounded-xl hover:border-deal-green/30 transition-all">
          <div 
            onClick={() => updateFilters({ inStockOnly: !filters.inStockOnly })}
            class={`w-5 h-5 rounded-md border transition-all flex items-center justify-center flex-shrink-0 ${
              filters.inStockOnly 
              ? 'bg-deal-green border-deal-green shadow-[0_0_15px_rgba(0,255,136,0.4)]' 
              : 'border-outline-variant/50 group-hover:border-deal-green/50'
            }`}
          >
            {filters.inStockOnly && <span class="material-symbols-outlined text-[12px] text-black font-bold">check</span>}
          </div>
          <div class="flex-1">
            <span class="block text-[10px] font-black text-white uppercase tracking-wider">Voorradig</span>
            <span class="text-[8px] text-on-surface-variant font-medium">Verberg niet leverbaar artikelen</span>
          </div>
        </label>
      </div>

      <button 
        onClick={() => updateFilters({ search: '', platforms: [], conditions: [], maxPrice: 500, sortBy: 'newest' })}
        class="w-full py-3.5 bg-surface-container-high/40 border border-outline-variant/20 rounded-xl font-orbitron text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant hover:text-white hover:border-deal-green/40 hover:bg-surface-container-high transition-all group"
      >
        Filters Wissen
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(213, 147, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(213, 147, 255, 0.4);
        }
        input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 18px;
            height: 18px;
            background: #00FF88;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 15px rgba(0,255,136,0.6);
            border: 3px solid #0e0e13;
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.15);
            box-shadow: 0 0 25px rgba(0,255,136,0.8);
        }
      `}} />
    </div>
  );
}
