import { useStore } from '@nanostores/preact';
import { cartItems, removeFromCart } from '../../store/cartStore';
import { isCartOpen } from '../../store/uiStore';
import { useEffect } from 'preact/hooks';

export default function CartDrawer() {
  const $cartItems = useStore(cartItems);
  const $isOpen = useStore(isCartOpen);

  useEffect(() => {
    if ($isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [$isOpen]);

  const cartTotal = $cartItems.reduce((acc, item) => acc + item.priceInCents, 0);
  const formattedTotal = (cartTotal / 100).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });

  return (
    <>
      {/* Overlay Backdrop */}
      {$isOpen && (
        <div 
          onClick={() => isCartOpen.set(false)}
          class="fixed inset-0 bg-black/60 z-[60] transition-opacity animate-in fade-in duration-300"
        ></div>
      )}

      {/* Cart Drawer */}
      <aside 
        class={`fixed right-0 top-0 h-full w-full md:w-[35%] lg:w-[30%] z-[70] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-outline-variant/30 transform transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${$isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          background: 'rgba(14, 14, 19, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)'
        }}
      >
        <div 
          class="absolute inset-0 opacity-20"
          style={{
            background: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.05) 0px, rgba(0, 0, 0, 0.05) 1px, transparent 1px, transparent 2px)',
            pointerEvents: 'none'
          }}
        ></div>
        
        {/* Header */}
        <header class="relative p-8 flex items-center justify-between z-10">
          <h2 class="font-orbitron text-2xl font-bold tracking-[0.2em] text-on-surface">
            JOUW KLUIS
          </h2>
          <button 
            onClick={() => isCartOpen.set(false)}
            class="w-10 h-10 flex items-center justify-center rounded-sm bg-surface-container-high hover:bg-surface-variant text-on-surface-variant transition-all hover:text-primary active:scale-95"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
          {/* Decorative Accent */}
          <div class="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
        </header>

        {/* Cart Items List */}
        <div class="flex-grow overflow-y-auto px-8 py-6 space-y-8 z-10" style={{ scrollbarWidth: 'none' }}>
          {$cartItems.length === 0 ? (
            <div class="h-full flex flex-col items-center justify-center text-center opacity-50">
              <span class="material-symbols-outlined text-6xl mb-4 text-[#d593ff]">search_off</span>
              <p class="font-orbitron text-sm uppercase tracking-widest text-[#f9f5fd]">De kluis is leeg.</p>
            </div>
          ) : (
            $cartItems.map((item) => (
              <div key={item.id} class="group flex gap-4 items-start relative">
                <div class="w-24 h-24 bg-surface-container-highest rounded-sm overflow-hidden shrink-0 border border-outline-variant/20 group-hover:border-primary/50 transition-colors p-2">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    class="w-full h-full object-contain filter drop-shadow-md opacity-80 group-hover:opacity-100 transition-opacity" 
                  />
                </div>
                
                <div class="flex-grow flex flex-col justify-between h-24 py-1">
                  <div>
                    <div class="flex justify-between items-start">
                      <h3 class="font-headline font-bold text-lg text-on-surface leading-tight line-clamp-1 truncate w-[80%]">{item.title}</h3>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        class="text-on-surface-variant hover:text-error transition-colors"
                      >
                        <span class="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                    <span class="font-inter text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 bg-surface-container-high text-on-surface-variant border border-outline-variant/20 inline-block mt-1">
                      {item.platform}
                    </span>
                  </div>
                  
                  <div class="flex justify-between items-end">
                    <div class="flex items-center gap-3 opacity-50 pointer-events-none">
                      <button class="w-6 h-6 flex items-center justify-center text-xs border border-outline-variant/30 hover:border-primary/50 text-on-surface-variant">-</button>
                      <span class="font-orbitron text-xs">01</span>
                      <button class="w-6 h-6 flex items-center justify-center text-xs border border-outline-variant/30 hover:border-primary/50 text-on-surface-variant">+</button>
                    </div>
                    <span class="font-orbitron font-bold text-primary-dim">
                      €{(item.priceInCents / 100).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Suggestion Module */}
          <div class="mt-12 p-4 bg-surface-container-low border-l-2 border-tertiary-fixed/30">
            <p class="font-inter text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Power-up suggestie:</p>
            <div class="flex gap-3 items-center">
              <div class="w-12 h-12 bg-surface-container-high shrink-0 rounded-sm overflow-hidden p-1 flex items-center justify-center">
                <span class="material-symbols-outlined text-tertiary-fixed text-2xl">cleaning_services</span>
              </div>
              <div class="flex-grow">
                <p class="font-headline font-bold text-xs text-on-surface">Premium Gevalideerd & Gepoetst</p>
                <p class="font-orbitron text-[10px] text-tertiary-fixed">€ 4.99</p>
              </div>
              <button class="text-tertiary-fixed hover:scale-110 transition-transform">
                <span class="material-symbols-outlined">add_circle</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer class="p-8 bg-surface-container-lowest border-t border-outline-variant/20 space-y-6 relative overflow-hidden z-10 w-full">
          {/* Totals Section */}
          <div class="space-y-2">
            <div class="flex justify-between items-center font-inter text-xs tracking-widest text-on-surface-variant uppercase">
              <span>Subtotaal</span>
              <span>{formattedTotal}</span>
            </div>
            <div class="flex justify-between items-center font-inter text-xs tracking-widest text-on-surface-variant uppercase">
              <span>Verzending</span>
              <span class="text-tertiary-fixed">BEREKEND IN KASSA</span>
            </div>
            <div class="pt-4 flex justify-between items-end border-t border-outline-variant/10">
              <span class="font-orbitron text-sm tracking-[0.2em] text-on-surface">TOTAAL</span>
              <div class="text-right">
                <span class="block font-inter text-[10px] text-on-surface-variant uppercase mb-1">Incl. BTW</span>
                <span class="font-orbitron text-2xl font-black text-on-surface shadow-primary/20">{formattedTotal}</span>
              </div>
            </div>
          </div>
          
          {/* Massive Neon Checkout Button */}
          <a href={cartTotal > 0 ? "/checkout" : "#"} class="block w-full">
            <button 
              disabled={cartTotal === 0}
              class={`w-full py-5 text-on-tertiary-fixed font-orbitron font-extrabold tracking-[0.15em] text-[11px] md:text-sm rounded-sm transition-all group flex items-center justify-center gap-2 md:gap-3 ${cartTotal > 0 ? 'bg-tertiary-fixed hover:bg-tertiary-fixed-dim hover:shadow-[0_0_30px_rgba(0,253,135,0.4)] active:scale-[0.98]' : 'bg-surface-container-high opacity-50 cursor-not-allowed'}`}
            >
              <span>AFREKENEN VIA MOLLIE</span>
              <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </a>
          
          {/* Mollie Badges / Trust */}
          <div class="flex justify-center items-center gap-6 pt-2">
            <span class="font-inter text-[9px] text-slate-500 uppercase tracking-widest opacity-60">Veilig Betalen:</span>
            <div class="flex gap-3 opacity-40 hover:opacity-100 transition-opacity">
              <span class="material-symbols-outlined text-sm">credit_card</span>
              <span class="material-symbols-outlined text-sm">account_balance</span>
              <span class="material-symbols-outlined text-sm">payments</span>
            </div>
          </div>
          
          {/* Bottom Accent Glow */}
          <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 w-64 h-20 bg-tertiary-fixed/10 blur-[50px] pointer-events-none"></div>
        </footer>
      </aside>
    </>
  );
}
