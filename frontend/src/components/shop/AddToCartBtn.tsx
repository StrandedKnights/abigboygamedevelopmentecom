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
        class="w-full h-16 rounded-xl flex items-center justify-center gap-3 font-orbitron font-bold text-sm uppercase tracking-[0.2em] transition-all"
        style="background: #1a1a22; border: 1px solid rgba(72,71,77,0.3); color: #76747b; cursor: not-allowed;"
      >
        <span class="material-symbols-outlined">block</span>
        Uitverkocht
      </button>
    );
  }

  return (
    <div class="relative w-full">
      <button 
        onClick={handleAdd}
        disabled={added}
        class={`w-full h-16 rounded-xl flex items-center justify-center gap-3 font-orbitron font-bold text-sm uppercase tracking-[0.2em] transition-all relative overflow-hidden group hvr-neon-green`}
        style={added 
          ? "background: #131319; border: 1px solid #d593ff; color: #f9f5fd;" 
          : "background: #00FF88; border: 1px solid #00FF88; color: #000;"
        }
      >
        {/* Hover glow effect (only when not added) */}
        {!added && (
            <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        )}
        
        <span class="material-symbols-outlined">
          {added ? 'check_circle' : 'shopping_bag'}
        </span>
        
        {added ? 'In je mandje' : 'Toevoegen aan Vault'}
      </button>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
            <div className="bg-[#d593ff] text-white px-8 py-4 rounded-full font-orbitron text-xs font-black uppercase tracking-widest shadow-[0_0_40px_rgba(213,147,255,0.4)] flex items-center gap-3 border border-white/20">
                <span className="material-symbols-outlined text-lg">verified</span>
                Added to your vault!
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
        .hvr-neon-green:hover:not(:disabled) {
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.4);
            transform: translateY(-2px);
        }
      `}} />
    </div>
  );
}
