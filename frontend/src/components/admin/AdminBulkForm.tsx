import { useState } from 'preact/hooks';
import type { Product } from '../../services/apiClient';

interface BulkProduct extends Product {
    _status?: 'idle' | 'changed' | 'saving' | 'saved' | 'error';
}

export default function AdminBulkForm({ initialProducts }: { initialProducts: BulkProduct[] }) {
    const [products, setProducts] = useState(
        initialProducts.map(p => ({
            ...p,
            _priceInput: (p.priceInCents / 100).toFixed(2),
            _purchaseInput: p.purchasePriceInCents ? (p.purchasePriceInCents / 100).toFixed(2) : '',
            _stockInput: String(p.stock),
            _status: 'idle'
        }))
    );
    const [isSavingAll, setIsSavingAll] = useState(false);

    const handleInputChange = (id: string, field: string, value: string) => {
        setProducts(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, [field]: value, _status: 'changed' };
            }
            return p;
        }));
    };

    const handleSaveAll = async () => {
        setIsSavingAll(true);
        const changedProducts = products.filter(p => p._status === 'changed');
        
        for (const product of changedProducts) {
            // Update UI status
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, _status: 'saving' } : p));
            
            try {
                const parsePrice = Math.round(parseFloat((product as any)._priceInput) * 100);
                const parsePurchase = parseFloat((product as any)._purchaseInput);
                const parsePurchaseInCents = !isNaN(parsePurchase) ? Math.round(parsePurchase * 100) : null;
                const parseStock = parseInt((product as any)._stockInput, 10);

                const res = await fetch(`/api/abg-nexus/products/${product.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: product.title,
                        platform: product.platform,
                        condition: product.condition || 'USED',  // Mock default bypass
                        priceInCents: parsePrice,
                        purchasePriceInCents: parsePurchaseInCents,
                        stock: parseStock,
                        taxScheme: product.taxScheme,
                        imageUrl: product.imageUrl || 'https://via.placeholder.com/150', // Mock
                        isWeekdeal: product.isWeekdeal || false
                    })
                });

                if (!res.ok) throw new Error("Failed");

                setProducts(prev => prev.map(p => p.id === product.id ? { ...p, _status: 'saved' } : p));
            } catch (err) {
                setProducts(prev => prev.map(p => p.id === product.id ? { ...p, _status: 'error' } : p));
            }
        }
        setIsSavingAll(false);
    };

    const changedCount = products.filter(p => p._status === 'changed').length;

    return (
        <div>
            <div class="flex justify-between items-center mb-6">
                <p class="text-[10px] uppercase font-orbitron font-bold text-on-surface-variant tracking-widest">{products.length} Producten Geladen</p>
                <button 
                    onClick={handleSaveAll}
                    disabled={changedCount === 0 || isSavingAll}
                    class="bg-deal-green text-black px-6 py-2 rounded-lg font-orbitron font-black text-xs tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(0,255,136,0.4)] flex items-center gap-2"
                >
                    {isSavingAll ? <span class="material-symbols-outlined animate-spin text-sm">refresh</span> : <span class="material-symbols-outlined text-sm">save</span>}
                    {isSavingAll ? 'Bezig met Opslaan...' : `Opslaan (${changedCount} wijzigingen)`}
                </button>
            </div>

            <table class="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr class="border-b border-white/5 bg-surface-container-high/40 text-[10px] font-orbitron uppercase tracking-[0.15em] text-deal-purple">
                        <th class="p-4 font-bold rounded-tl-xl w-1/3">Titel & Platform</th>
                        <th class="p-4 font-bold w-1/6">Tax Scheme</th>
                        <th class="p-4 font-bold w-1/6">Inkoop (€)</th>
                        <th class="p-4 font-bold w-1/6">Verkoop (€)</th>
                        <th class="p-4 font-bold w-1/6">Voorraad</th>
                        <th class="p-4 font-bold w-16 text-right rounded-tr-xl">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p: any) => (
                        <tr key={p.id} class={`border-b border-white/5 transition-colors ${p._status === 'changed' ? 'bg-white/5' : 'hover:bg-white/5'}`}>
                            <td class="p-4">
                                <div class="font-bold text-white text-sm truncate max-w-[250px]">{p.title}</div>
                                <div class="text-[10px] text-on-surface-variant mt-1 tracking-wider uppercase">{p.platform}</div>
                            </td>
                            <td class="p-4">
                                <select 
                                    class="bg-[#0a0a0d] border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-deal-green focus:outline-none w-full"
                                    value={p.taxScheme}
                                    title={`Tax Scheme voor ${p.title}`}
                                    onChange={(e: any) => handleInputChange(p.id, 'taxScheme', e.target.value)}
                                >
                                    <option value="MARGIN">Marge</option>
                                    <option value="STANDARD">Standaard (21%)</option>
                                </select>
                            </td>
                            <td class="p-4">
                                <input 
                                    type="number" step="0.01" 
                                    title={`Inkoopprijs voor ${p.title}`}
                                    placeholder="0.00"
                                    class="bg-[#0a0a0d] border border-white/10 rounded px-3 py-1.5 text-sm text-deal-purple font-bold w-full focus:border-deal-green focus:outline-none"
                                    value={p._purchaseInput}
                                    onInput={(e: any) => handleInputChange(p.id, '_purchaseInput', e.target.value)}
                                />
                            </td>
                            <td class="p-4">
                                <input 
                                    type="number" step="0.01" 
                                    title={`Verkoopprijs voor ${p.title}`}
                                    placeholder="0.00"
                                    class="bg-[#0a0a0d] border border-white/10 rounded px-3 py-1.5 text-sm text-deal-green font-bold w-full focus:border-deal-green focus:outline-none"
                                    value={p._priceInput}
                                    onInput={(e: any) => handleInputChange(p.id, '_priceInput', e.target.value)}
                                />
                            </td>
                            <td class="p-4">
                                <input 
                                    type="number" 
                                    title={`Voorraad voor ${p.title}`}
                                    placeholder="0"
                                    class={`bg-[#0a0a0d] border border-white/10 rounded px-3 py-1.5 text-sm font-bold w-20 focus:border-deal-green focus:outline-none ${parseInt(p._stockInput) === 0 ? 'text-[#ff4b4b] border-red-500/50' : 'text-white'}`}
                                    value={p._stockInput}
                                    onInput={(e: any) => handleInputChange(p.id, '_stockInput', e.target.value)}
                                />
                            </td>
                            <td class="p-4 text-right">
                                {p._status === 'changed' && <span class="w-3 h-3 rounded-full bg-yellow-500 inline-block shadow-[0_0_8px_rgba(234,179,8,0.5)]"></span>}
                                {p._status === 'saving' && <span class="material-symbols-outlined text-yellow-500 animate-spin text-sm">refresh</span>}
                                {p._status === 'saved' && <span class="material-symbols-outlined text-deal-green text-sm">check_circle</span>}
                                {p._status === 'error' && <span class="material-symbols-outlined text-[#ff4b4b] text-sm">error</span>}
                                {p._status === 'idle' && <span class="text-on-surface-variant text-[10px]">-</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
