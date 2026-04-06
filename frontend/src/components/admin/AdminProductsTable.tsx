import { useState } from 'preact/hooks';
import type { Product } from '../../services/apiClient';
import { AdminAPI } from '../../services/apiClient';

export default function AdminProductsTable({ initialProducts }: { initialProducts: Product[] }) {
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState(initialProducts);

    const filtered = products.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) || 
        p.platform.toLowerCase().includes(search.toLowerCase()) ||
        p.id.includes(search)
    );

    const formatPrice = (cents: number) => `€${(cents / 100).toFixed(2)}`;

    const handleDeleteProduct = async (id: string, title: string) => {
        if (!window.confirm(`Weet je zeker dat je "${title}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
            return;
        }

        try {
            await AdminAPI.deleteProduct(id);
            // Update local state to remove the deleted product
            setProducts(current => current.filter(p => p.id !== id));
        } catch (err: any) {
            console.error("Failed to delete product:", err);
            alert(err?.message || "Olielek! Mislukt om het product te verwijderen.");
        }
    };

    return (
        <div class="space-y-6">
            <div class="flex items-center gap-4 bg-[#0a0a0d] border border-white/10 p-4 rounded-xl focus-within:border-deal-green/40 focus-within:ring-1 focus-within:ring-deal-green/20 transition-all font-inter">
                <span class="material-symbols-outlined text-on-surface-variant">search</span>
                <input 
                    type="text" 
                    placeholder="Zoek op titel, platform (bijv. PlayStation 5) of ID..."
                    value={search}
                    onInput={(e: any) => setSearch(e.target.value)}
                    class="bg-transparent border-none text-white text-sm focus:outline-none w-full"
                />
            </div>

            <div class="bg-surface-container-high/20 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm">
                <div class="overflow-x-auto custom-scrollbar">
                    <table class="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr class="border-b border-white/5 bg-surface-container-high/40 text-[10px] font-orbitron uppercase tracking-[0.15em] text-deal-purple">
                                <th class="p-5 font-bold rounded-tl-xl w-16">Foto</th>
                                <th class="p-5 font-bold">Gamedata</th>
                                <th class="p-5 font-bold">Staat</th>
                                <th class="p-5 font-bold">Stock</th>
                                <th class="p-5 font-bold text-deal-green">Prijs</th>
                                <th class="p-5 font-bold text-deal-purple">Inkoop/Marge</th>
                                <th class="p-5 font-bold">Regeling</th>
                                <th class="p-5 font-bold text-right rounded-tr-xl">Acties</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} class="p-12 text-center text-on-surface-variant font-orbitron tracking-widest text-xs uppercase bg-[#0a0a0d]">
                                        <span class="material-symbols-outlined block text-4xl mb-3 opacity-50">search_off</span>
                                        Geen producten gevonden die matchen met "{search}"
                                    </td>
                                </tr>
                            ) : null}
                            {filtered.map(product => (
                                <tr key={product.id} class="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    <td class="p-5">
                                        <div class="w-14 h-14 rounded-lg overflow-hidden bg-black/60 border border-white/10 group-hover:border-deal-green/30 transition-colors">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.title} class="w-full h-full object-cover" loading="lazy" />
                                            ) : (
                                                <span class="material-symbols-outlined text-on-surface-variant flex items-center justify-center w-full h-full text-xl opacity-50">image_not_supported</span>
                                            )}
                                        </div>
                                    </td>
                                    <td class="p-5">
                                        <div class="font-bold text-white text-sm leading-tight mb-1">{product.title}</div>
                                        <div class="text-[10px] text-on-surface-variant uppercase tracking-wider">{product.platform}</div>
                                        {product.isWeekdeal && <span class="inline-block mt-2 bg-deal-green/20 text-deal-green text-[9px] font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(0,255,136,0.1)] uppercase tracking-wider">Weekdeal</span>}
                                    </td>
                                    <td class="p-5">
                                        <span class="text-[10px] font-bold uppercase tracking-wider bg-surface-container-low px-2 py-1 rounded text-on-surface-variant border border-white/5">{product.condition}</span>
                                    </td>
                                    <td class="p-5">
                                        <div class={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-orbitron font-bold text-xs ${product.stock > 0 ? 'bg-white/5 text-white border border-white/10' : 'bg-red-500/10 text-[#ff4b4b] border border-red-500/20'}`}>
                                            {product.stock}
                                        </div>
                                    </td>
                                    <td class="p-5 font-barlow font-black text-lg tracking-wide text-white">
                                        {formatPrice(product.priceInCents)}
                                    </td>
                                    <td class="p-5">
                                        <div class="font-barlow font-bold text-deal-purple/80 text-xs tracking-widest">{formatPrice(product.purchasePriceInCents || 0)}</div>
                                        <div class="font-orbitron font-black text-[12px] text-deal-green mt-0.5">
                                            +{formatPrice((product.priceInCents || 0) - (product.purchasePriceInCents || 0))} 
                                        </div>
                                    </td>
                                    <td class="p-5">
                                        <div class={`inline-block px-3 py-1 rounded text-[9px] font-black uppercase tracking-[0.1em] ${product.taxScheme === 'MARGIN' ? 'bg-deal-purple/10 text-deal-purple border border-deal-purple/20' : 'bg-deal-green/10 text-deal-green border border-deal-green/20'}`}>
                                            {product.taxScheme === 'MARGIN' ? 'Margeregeling' : '21% BTW'}
                                        </div>
                                    </td>
                                    <td class="p-5 text-right space-x-2">
                                        <a href={`/abg-nexus/products/edit/${product.id}`} class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-sm" title="Edit Product">
                                            <span class="material-symbols-outlined text-[18px]">edit</span>
                                        </a>
                                        <button 
                                            onClick={() => handleDeleteProduct(product.id, product.title)}
                                            class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 text-[#ff4b4b] hover:bg-[#ff4b4b] hover:text-white transition-all shadow-sm" 
                                            title="Verwijder Product"
                                        >
                                            <span class="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
            .custom-scrollbar::-webkit-scrollbar { height: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
            `}} />
        </div>
    );
}
