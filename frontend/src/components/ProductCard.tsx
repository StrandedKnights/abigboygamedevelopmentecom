import type { Product } from '../services/apiClient';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const p = product;
  const platformColor = '#d593ff'; // Default brand color for now

  return (
    <div 
      class="product-card reveal-up rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-[#1a1a22] border border-white/10"
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      {/* Image area */}
      <div class="relative overflow-hidden h-64 bg-[#111118]">
        <img
          src={p.imageUrl || '/images/placeholder.webp'}
          alt={p.title}
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Condition badge */}
        <span class="absolute top-3 left-3 font-orbitron text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-deal-green text-black">
          {p.condition || 'Pre-owned'}
        </span>
        
        {/* Add to cart overlay on hover */}
        <div class="absolute bottom-0 left-0 right-0 py-3 text-center font-orbitron text-[10px] font-bold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-all duration-300 bg-deal-purple text-white shadow-[0_-10px_30px_rgba(213,147,255,0.3)]">
          + Toevoegen
        </div>
      </div>

      {/* Info area */}
      <div class="p-5 space-y-2">
        <h3 class="font-orbitron font-bold text-sm leading-snug line-clamp-1 uppercase tracking-tight text-[#f9f5fd]">
          {p.title}
        </h3>
        <p class="font-orbitron text-[10px] uppercase tracking-wider text-deal-purple">
          {p.platform}
        </p>
        <div class="flex items-center justify-between pt-2">
          <span class="font-orbitron text-lg font-bold text-[#f9f5fd]">
            €{(p.priceInCents / 100).toFixed(2).replace('.', ',')}
          </span>
          <button class="text-on-surface-variant hover:text-deal-green transition-colors">
            <span class="material-symbols-outlined text-base">star</span>
          </button>
        </div>
      </div>
    </div>
  );
}
