import { useState, useEffect } from 'preact/hooks';
import { useStore } from '@nanostores/preact';
import { $shopFilters, updateFilters } from '../stores/shopStore';
import { ProductsAPI, type Product } from '../services/apiClient';
import ProductCard from './ProductCard';

interface ProductGridProps {
  initialProducts: Product[];
  initialMeta: { totalItems: number };
}

export default function ProductGrid({ initialProducts, initialMeta }: ProductGridProps) {
  const filters = useStore($shopFilters);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [meta, setMeta] = useState(initialMeta);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ProductsAPI.getShopProducts({
        search: filters.search,
        platforms: filters.platforms.join(','),
        conditions: filters.conditions.join(','),
        maxPrice: filters.maxPrice * 100, // Convert to cents
        inStockOnly: filters.inStockOnly,
        sortBy: filters.sortBy,
        page: filters.page,
        limit: 12
      });
      setProducts(response.products);
      setMeta(response.meta);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Er is een fout opgetreden bij het laden van de producten.');
    } finally {
      setLoading(false);
    }
  };

  // Only fetch on client side after the initial SSR
  useEffect(() => {
    // Skip initial fetch on client boot to avoid duplicate request (SSR already fetched initial state)
    // Actually, we need to fetch whenever any filter changes
    fetchProducts();
  }, [filters]);

  const totalPages = Math.ceil(meta.totalItems / 12);

  return (
    <div class="flex-1 space-y-12">
      {loading ? (
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-30 pointer-events-none transition-opacity">
          {[...Array(6)].map((_, i) => (
            <div key={i} class="h-96 bg-surface-container-high rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div class="glass-panel p-20 text-center">
          <span class="material-symbols-outlined text-4xl text-deal-purple mb-4">error</span>
          <h3 class="font-orbitron font-bold text-white uppercase mb-2">Fout bij laden</h3>
          <p class="text-on-surface-variant text-sm mb-6">{error}</p>
          <button onClick={fetchProducts} class="px-8 py-2 bg-deal-green text-black font-orbitron text-xs font-bold uppercase rounded-lg">Probeer Opnieuw</button>
        </div>
      ) : products.length > 0 ? (
        <>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
          
          {/* Pagination */}
          <div class="mt-16 flex items-center justify-between border-t border-white/5 pt-8">
            <p class="font-headline text-[10px] text-on-surface-variant uppercase tracking-widest">
              Pagina {filters.page} van {Math.max(1, totalPages)}
            </p>
            
            <div class="flex gap-3">
              {filters.page > 1 && (
                <button 
                  onClick={() => updateFilters({ page: filters.page - 1 })}
                  class="px-6 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg font-orbitron text-[10px] font-bold uppercase tracking-widest text-white hover:border-deal-green transition-all"
                >
                  VORIGE
                </button>
              )}
              {filters.page < totalPages && (
                <button 
                  onClick={() => updateFilters({ page: filters.page + 1 })}
                  class="px-6 py-2.5 bg-deal-green text-black border border-deal-green rounded-lg font-orbitron text-[10px] font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all"
                >
                  VOLGENDE
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div class="glass-panel p-20 text-center">
          <span class="material-symbols-outlined text-6xl text-on-surface-variant opacity-20 mb-4 block">inventory_2</span>
          <h3 class="font-orbitron font-black text-xl text-white uppercase tracking-widest mb-2">Geen resultaten gevonden</h3>
          <p class="text-on-surface-variant text-sm max-w-sm mx-auto">
            Probeer de filters aan te passen of een andere zoekterm te gebruiken om te vinden wat je zoekt.
          </p>
          <button 
            onClick={() => updateFilters({ search: '', platforms: [], conditions: [], maxPrice: 500 })}
            class="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-lg font-orbitron text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all"
          >
            Filters Herstellen
          </button>
        </div>
      )}
    </div>
  );
}
