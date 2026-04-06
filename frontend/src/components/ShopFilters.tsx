import { useState, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $shopFilters, updateFilters } from '../stores/shopStore';
import { PLATFORMS, CONDITIONS, PLATFORM_GROUPS, PRICE_RANGES } from '../config/taxonomy';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Relevantie (Nieuwste)' },
  { value: 'price_asc', label: 'Prijs laag naar hoog' },
  { value: 'price_desc', label: 'Prijs hoog naar laag' }
];

export default function ShopFilters() {
  const filters = useStore($shopFilters);
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [expandedBrands, setExpandedBrands] = useState<string[]>(['Nintendo', 'PlayStation']);

  // Sync internal state when store changes
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

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

  const toggleBrand = (brand: string) => {
    setExpandedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const setPriceRange = (range: typeof PRICE_RANGES[number]) => {
    const updates: any = { minPrice: 0, maxPrice: 1000 };
    if ('max' in range) updates.maxPrice = range.max / 100;
    if ('min' in range) updates.minPrice = range.min / 100;
    updateFilters(updates);
  };

  const isRangeActive = (range: typeof PRICE_RANGES[number]) => {
    if ('max' in range) return filters.maxPrice === range.max / 100 && filters.minPrice === 0;
    if ('min' in range) return filters.minPrice === range.min / 100;
    return false;
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
            title="Sorteer Filter"
            class="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg py-2.5 pl-4 pr-10 text-[9px] sm:text-[10px] focus:outline-none focus:border-deal-green/50 text-white appearance-none cursor-pointer font-orbitron font-bold tracking-[0.15em] uppercase transition-all whitespace-nowrap text-ellipsis"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} class="bg-[#1a1a22] text-white py-2">{opt.label}</option>
            ))}
          </select>
          <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">expand_more</span>
        </div>
      </div>

      {/* Platforms Accordion */}
      <div>
        <h3 class="font-orbitron text-[10px] tracking-[0.2em] uppercase text-deal-purple mb-4">PLATFORMS</h3>
        <div class="space-y-3">
          {PLATFORM_GROUPS.map(group => (
            <div key={group.brand} class="border border-white/5 rounded-xl overflow-hidden bg-white/2">
              <button 
                onClick={() => toggleBrand(group.brand)}
                class="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors group"
              >
                <div class="flex items-center gap-2">
                   <div class={`w-1 h-3 rounded-full transition-colors ${expandedBrands.includes(group.brand) ? 'bg-deal-green' : 'bg-deal-purple/30'}`}></div>
                   <span class={`font-orbitron text-[10px] font-bold tracking-widest uppercase transition-colors ${expandedBrands.includes(group.brand) ? 'text-white' : 'text-on-surface-variant'}`}>{group.brand}</span>
                </div>
                <span class={`material-symbols-outlined text-sm text-on-surface-variant transition-transform duration-300 ${expandedBrands.includes(group.brand) ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              
              <div class={`transition-all duration-300 ease-in-out ${expandedBrands.includes(group.brand) ? 'max-h-96 opacity-100 p-3 pt-0' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                 <div class="space-y-2 mt-1">
                   {group.platforms.map(p => (
                     <label key={p} class="flex items-center gap-3 group cursor-pointer py-0.5">
                       <div 
                         onClick={() => togglePlatform(p)}
                         class={`w-3.5 h-3.5 rounded border transition-all flex items-center justify-center flex-shrink-0 ${
                           filters.platforms.includes(p) 
                           ? 'bg-deal-green border-deal-green shadow-[0_0_10px_rgba(0,255,136,0.3)]' 
                           : 'border-outline-variant/30 group-hover:border-deal-green/50'
                         }`}
                       >
                         {filters.platforms.includes(p) && <span class="material-symbols-outlined text-[8px] text-black font-bold">check</span>}
                       </div>
                       <span class={`text-[11px] font-medium transition-colors tracking-wide ${filters.platforms.includes(p) ? 'text-white' : 'text-on-surface-variant group-hover:text-white'}`}>
                         {p}
                       </span>
                     </label>
                   ))}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <h3 class="font-orbitron text-[10px] tracking-[0.2em] uppercase text-deal-purple mb-4">CONDITIE</h3>
        <div class="space-y-2">
          {CONDITIONS.map(c => (
            <label key={c} class="flex items-center gap-3 group cursor-pointer">
              <div 
                onClick={() => toggleCondition(c)}
                class={`w-4 h-4 rounded border transition-all flex items-center justify-center flex-shrink-0 ${
                  filters.conditions.includes(c) 
                  ? 'bg-deal-green border-deal-green shadow-[0_0_10px_rgba(0,255,136,0.3)]' 
                  : 'border-outline-variant/50 group-hover:border-deal-green/50'
                }`}
              >
                {filters.conditions.includes(c) && <span class="material-symbols-outlined text-[10px] text-black font-bold">check</span>}
              </div>
              <span class={`text-[11px] font-medium transition-colors tracking-wide ${filters.conditions.includes(c) ? 'text-white' : 'text-on-surface-variant group-hover:text-white'}`}>
                {c}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-orbitron text-[10px] tracking-[0.2em] uppercase text-deal-purple">MAXIMALE PRIJS</h3>
          <span class="font-orbitron text-[10px] text-deal-green font-bold text-right px-2 py-1 bg-deal-green/10 border border-deal-green/20 rounded shadow-[0_0_10px_rgba(0,255,136,0.1)]">
            {filters.maxPrice < 1000 ? `€${filters.maxPrice}` : 'Geen Limiet'}
          </span>
        </div>
        <div class="px-2 relative">
          <input 
            type="range"
            title="Maximum Prijs"
            min="10"
            max="1000"
            step="10"
            value={filters.maxPrice}
            onInput={(e: any) => updateFilters({ maxPrice: Number(e.target.value) })}
            class="w-full h-1.5 bg-surface-container-high rounded-full appearance-none cursor-pointer transition-all custom-range-slider"
          />
          <div class="flex justify-between mt-2 px-1">
            <span class="text-[9px] font-orbitron text-on-surface-variant/50">€10</span>
            <span class="text-[9px] font-orbitron text-on-surface-variant/50">€1000+</span>
          </div>
        </div>
      </div>

      {/* In Stock */}
      <div class="pt-4 space-y-3">
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

        {/* Weekdeals */}
        <label class="flex items-center gap-3 group cursor-pointer p-3 bg-deal-green/5 border border-deal-green/20 rounded-xl hover:border-deal-green/50 transition-all">
          <div 
            onClick={() => updateFilters({ isWeekdeal: !filters.isWeekdeal })}
            class={`w-5 h-5 rounded-md border transition-all flex items-center justify-center flex-shrink-0 ${
              filters.isWeekdeal 
              ? 'bg-deal-green border-deal-green shadow-[0_0_15px_rgba(0,255,136,0.4)]' 
              : 'border-deal-green/30 group-hover:border-deal-green/50'
            }`}
          >
            {filters.isWeekdeal && <span class="material-symbols-outlined text-[12px] text-black font-bold">check</span>}
          </div>
          <div class="flex-1">
            <span class="block text-[10px] font-black text-deal-green uppercase tracking-wider flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">bolt</span> Actieve Deals</span>
            <span class="text-[8px] text-on-surface-variant font-medium">Toon alleen de geprijsde Weekdeals</span>
          </div>
        </label>
      </div>

      <button 
        onClick={() => updateFilters({ search: '', platforms: [], conditions: [], minPrice: 0, maxPrice: 1000, sortBy: 'newest', isWeekdeal: false, inStockOnly: false })}
        class="w-full py-3.5 bg-surface-container-high/40 border border-outline-variant/20 rounded-xl font-orbitron text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant hover:text-white hover:border-deal-green/40 hover:bg-surface-container-high transition-all"
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
        
        .custom-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #00FF88;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
          transition: transform 0.2s;
        }
        .custom-range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
      `}} />
    </div>
  );
}
