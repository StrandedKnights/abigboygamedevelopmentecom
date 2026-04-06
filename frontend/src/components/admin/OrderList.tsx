import { useState } from 'preact/hooks';
import { AdminAPI, type Order } from '../../services/apiClient';

export default function OrderList({ initialOrders }: { initialOrders: Order[] }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [search, setSearch] = useState('');

    const filtered = orders.filter(o => 
        o.id.includes(search) || 
        o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        (o.customerName && o.customerName.toLowerCase().includes(search.toLowerCase()))
    );

    const updateStatus = async (orderId: string, newStatus: string, currentTracking: string | null | undefined = null) => {
        let tracking = currentTracking;
        
        // If transitioning to SHIPPED, prompt for a tracking code
        if (newStatus === 'SHIPPED') {
            const code = prompt("Voer PostNL/DHL Tracking Code in (Dit activeert straks de bevestigingsmail):", currentTracking || "");
            if (code === null) return; // User cancelled
            tracking = code.trim();
        }

        try {
            const updated = await AdminAPI.updateOrderStatus(orderId, newStatus, tracking || undefined);
            
            // Re-sync local state
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any, trackingCode: tracking } : o));
            
            if (newStatus === 'SHIPPED') {
                alert(`Order voltooid! Tracking bijgewerkt en voorbereid voor email-uitvoeringslijn.`);
            }
        } catch (e: any) {
            alert("Status update mislukt: " + e.message);
        }
    };

    const formatPrice = (cents: number) => `€${(cents / 100).toFixed(2)}`;
    
    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status: string) => {
        if (status === 'PENDING') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        if (status === 'PAID') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        if (status === 'SHIPPED') return 'bg-deal-green/10 text-deal-green border-deal-green/20';
        if (status === 'CANCELLED') return 'bg-red-500/10 text-red-500 border-red-500/20';
        return 'bg-white/10 text-white border-white/20';
    };

    return (
        <div class="space-y-6">
            <div class="flex items-center gap-4 bg-[#0a0a0d] border border-white/10 p-4 rounded-xl mb-4 font-inter focus-within:border-deal-green/50 focus-within:ring-1 focus-within:ring-deal-green/20 transition-all">
                <span class="material-symbols-outlined text-on-surface-variant">search</span>
                <input 
                    type="text" 
                    placeholder="Zoek op Order ID, Klantnaam of Emailadres..."
                    value={search}
                    onInput={(e: any) => setSearch(e.target.value)}
                    class="bg-transparent border-none text-white focus:outline-none w-full text-sm"
                />
            </div>

            <div class="overflow-x-auto custom-scrollbar">
                <table class="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr class="border-b border-white/5 bg-surface-container-high/40 text-[10px] font-orbitron uppercase tracking-[0.15em] text-deal-purple">
                            <th class="p-5 font-bold rounded-tl-xl">Klant INFO</th>
                            <th class="p-5 font-bold">Bestelling</th>
                            <th class="p-5 font-bold">Totaalprijs</th>
                            <th class="p-5 font-bold">Status</th>
                            <th class="p-5 font-bold text-right rounded-tr-xl">Acties</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} class="p-12 text-center text-on-surface-variant font-orbitron tracking-widest text-xs uppercase bg-[#0a0a0d]/50">
                                    Geen orders gevonden.
                                </td>
                            </tr>
                        ) : null}
                        {filtered.map(order => (
                            <tr key={order.id} class="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td class="p-5">
                                    <div class="font-bold text-white text-sm mb-1">{order.customerName || 'Gast'}</div>
                                    <div class="text-[11px] text-on-surface-variant">{order.customerEmail}</div>
                                    <div class="text-[9px] text-on-surface-variant/50 mt-2 font-mono" title={order.id}>{order.id.split('-')[0]}...</div>
                                </td>
                                <td class="p-5">
                                    <div class="text-[10px] text-on-surface-variant mb-2 bg-[#0a0a0d] inline-block px-2 py-1 rounded">
                                        {formatDate(order.createdAt)}
                                    </div>
                                    <ul class="space-y-1">
                                        {(order.items || []).map(item => (
                                            <li key={item.id} class="text-[11px] text-white flex gap-2 items-start">
                                                <span class="font-bold text-deal-green">x{item.quantity}</span>
                                                <span class="truncate max-w-[200px]" title={item.product?.title}>{item.product?.title || 'Unknown Product'}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td class="p-5 font-barlow font-black text-xl text-white tracking-wider">
                                    {formatPrice(order.totalAmountInCents)}
                                </td>
                                <td class="p-5">
                                    <select 
                                        value={order.status}
                                        title="Order Status Aanpassen"
                                        disabled={order.status === 'SHIPPED' || order.status === 'CANCELLED'}
                                        onChange={(e: any) => updateStatus(order.id, e.target.value, order.trackingCode)}
                                        class={`border px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest font-orbitron appearance-none text-center outline-none transition-all focus:ring-2 ring-white/20 ${
                                            order.status === 'SHIPPED' || order.status === 'CANCELLED' ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:border-white/40'
                                        } ${getStatusColor(order.status)}`}
                                    >
                                        <option value="PENDING" class="bg-[#131319] text-white">PENDING (Afwachtend)</option>
                                        <option value="PAID" class="bg-[#131319] text-white">PAID (Betaald)</option>
                                        <option value="SHIPPED" class="bg-[#131319] text-white">SHIPPED (Verzonden)</option>
                                        <option value="CANCELLED" class="bg-[#131319] text-white">CANCELLED (Geannuleerd)</option>
                                    </select>
                                    
                                    {order.trackingCode && order.status === 'SHIPPED' && (
                                        <div class="mt-2 text-[10px] bg-deal-green/5 border border-deal-green/10 text-deal-green px-2 py-1 rounded inline-flex items-center gap-1 font-mono cursor-help" title="Tracking Code Verbonden">
                                            <span class="material-symbols-outlined text-[12px]">local_shipping</span>
                                            {order.trackingCode}
                                        </div>
                                    )}
                                </td>
                                <td class="p-5 text-right w-32">
                                    <button 
                                        onClick={() => updateStatus(order.id, 'SHIPPED', order.trackingCode)}
                                        class="p-2 bg-[#0a0a0d] border border-white/10 rounded-lg text-on-surface-variant hover:text-deal-green hover:border-deal-green/40 transition-all font-orbitron text-[10px] uppercase tracking-widest block w-full text-center"
                                        disabled={order.status === 'SHIPPED'}
                                    >
                                        VERZEND
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
