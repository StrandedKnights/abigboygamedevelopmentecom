import { map } from 'nanostores';

export interface ShopFiltersState {
  search: string;
  platforms: string[];
  conditions: string[];
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  sortBy: 'newest' | 'price_asc' | 'price_desc';
  page: number;
}

// Default state derived from URL (if we're on client side)
const getInitialState = (): ShopFiltersState => {
  if (typeof window === 'undefined') {
    return {
      search: '',
      platforms: [],
      conditions: [],
      minPrice: 0,
      maxPrice: 1000,
      inStockOnly: false,
      sortBy: 'newest',
      page: 1
    };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get('search') || '',
    platforms: params.get('platforms')?.split(',').filter(Boolean) || [],
    conditions: params.get('conditions')?.split(',').filter(Boolean) || [],
    minPrice: parseInt(params.get('minPrice') || '0') / 100,
    maxPrice: parseInt(params.get('maxPrice') || '100000') / 100,
    inStockOnly: params.get('inStockOnly') === 'true',
    sortBy: (params.get('sortBy') as any) || 'newest',
    page: parseInt(params.get('page') || '1')
  };
};

export const $shopFilters = map<ShopFiltersState>(getInitialState());

// Helper to update the store and the URL synchronously
export function updateFilters(updates: Partial<ShopFiltersState>) {
  const currentState = $shopFilters.get();
  const newState = { ...currentState, ...updates, page: updates.page ?? 1 };
  
  $shopFilters.set(newState);

  // Update URL history without full page reload
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams();
    if (newState.search) params.set('search', newState.search);
    if (newState.platforms.length) params.set('platforms', newState.platforms.join(','));
    if (newState.conditions.length) params.set('conditions', newState.conditions.join(','));
    if (newState.minPrice > 0) params.set('minPrice', (newState.minPrice * 100).toString());
    if (newState.maxPrice < 1000) params.set('maxPrice', (newState.maxPrice * 100).toString());
    if (newState.inStockOnly) params.set('inStockOnly', 'true');
    if (newState.sortBy !== 'newest') params.set('sortBy', newState.sortBy);
    if (newState.page > 1) params.set('page', newState.page.toString());

    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newURL);
  }
}
