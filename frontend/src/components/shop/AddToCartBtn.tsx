import { useState, useEffect } from 'preact/hooks';
import { addToCart, isItemInCart } from '../../store/cartStore';

interface Product {
  id: string;
  title: string;
  priceInCents: number;
  imageUrl: string;
  platform: string;
  stock: number;
}

interface Props {
  product: Product;
  isAvailable: boolean;
}

export default function AddToCartBtn({ product, isAvailable }: Props) {
  const [added, setAdded] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Sync state on mount (in case item is already in cart)
  useEffect(() => {
    if (isItemInCart(product.id)) {
      setAdded(true);
    }
  }, [product.id]);

  const handleAdd = () => {
    if (!isAvailable || added) return;

    addToCart(product);
    setAdded(true);
    setShowToast(true);

    // Auto hide toast
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!isAvailable) {
    return (
      <button 
        disabled
        class="w-full bg-surface-container-high text-on-surface-variant py-6 font-orbitron font-black text-xl tracking-[0.15em] rounded-xl opacity-50 cursor-not-allowed uppercase"
      >
        UITVERKOCHT
      </button>
    );
  }

  return (
    <div class="relative w-full">
      <button 
        onClick={handleAdd}
        disabled={added}
        class={`w-full py-6 font-orbitron font-black text-xl tracking-[0.15em] rounded-xl uppercase transition-all duration-300 ${added ? 'bg-surface-container-high text-[#d593ff] border border-[#d593ff]/30 cursor-default' : 'bg-[#00FF88] text-[#0e0e13] hover:brightness-110 active:scale-[0.98] shadow-[0_0_30px_rgba(0,255,136,0.3)]'}`}
      >
        {added ? 'IN JE KLUIS' : 'IN WINKELWAGEN'}
      </button>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
            <div className="bg-[#d593ff] text-white px-8 py-4 rounded-full font-orbitron text-xs font-black uppercase tracking-widest shadow-[0_0_40px_rgba(213,147,255,0.4)] flex items-center gap-3 border border-white/20">
                <span className="material-symbols-outlined text-lg">verified</span>
                Toegevoegd aan je kluis!
            </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-in {
          0% { transform: translate(-50%, 100px); opacity: 0; }
          70% { transform: translate(-50%, -20px); opacity: 1; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}} />
    </div>
  );
}
