import { useState } from 'preact/hooks';
import { AdminAPI } from '../../services/apiClient';

export default function AdminProductForm({ platforms, conditions }: { platforms: readonly string[], conditions: readonly string[] }) {
    const [title, setTitle] = useState('');
    const [platform, setPlatform] = useState(platforms[0] || '');
    const [condition, setCondition] = useState(conditions[0] || '');
    const [price, setPrice] = useState('0.00');
    const [stock, setStock] = useState('1');
    const [isWeekdeal, setIsWeekdeal] = useState(false);
    
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleImageChange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // 1. Upload Image First
            let imageUrl = '';
            if (imageFile) {
                const uploadRes = await AdminAPI.uploadImage(imageFile);
                if (!uploadRes.success || !uploadRes.imageUrl) {
                    const detailedError = uploadRes.error || "Onbekende serverfout bij uploaden naar Supabase.";
                    throw new Error(detailedError);
                }
                imageUrl = uploadRes.imageUrl;
            } else {
                throw new Error("Een afbeelding is verplicht voor webshop producten.");
            }

            // 2. Create Product
            const priceInCents = Math.round(parseFloat(price) * 100);
            const stockUnits = parseInt(stock, 10);

            if (isNaN(priceInCents) || priceInCents <= 0) throw new Error("Ongeldige prijs.");
            if (isNaN(stockUnits) || stockUnits < 0) throw new Error("Ongeldige voorraad.");

            await AdminAPI.createProduct({
                title,
                platform,
                condition,
                priceInCents,
                stock: stockUnits,
                isWeekdeal,
                imageUrl
            });

            setSuccess(true);
            setTitle('');
            setPrice('0.00');
            setStock('1');
            setImageFile(null);
            setImagePreview(null);
            window.scrollTo(0, 0);

        } catch (err: any) {
            setError(err.message || 'Mislukt om product aan te maken');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} class="space-y-6">
            {error && (
                <div class="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3">
                    <span class="material-symbols-outlined text-red-500 text-xl">error</span>
                    <p class="text-red-400 text-sm font-medium">{error}</p>
                </div>
            )}

            {success && (
                <div class="bg-deal-green/10 border border-deal-green/30 p-4 rounded-xl flex items-center gap-3">
                    <span class="material-symbols-outlined text-deal-green text-xl">check_circle</span>
                    <p class="text-deal-green text-sm font-bold tracking-wide">Product succesvol gepubliceerd naar de shop!</p>
                </div>
            )}

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Data */}
                <div class="space-y-6">
                    <div>
                        <label class="block font-orbitron text-[10px] font-bold text-deal-purple uppercase tracking-[0.2em] mb-2">Game / Console Titel</label>
                        <input type="text" required value={title} onInput={(e: any) => setTitle(e.target.value)} class="w-full bg-[#0a0a0d] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-deal-green focus:shadow-[0_0_15px_rgba(0,255,136,0.1)] transition-all font-inter" placeholder="bijv. The Legend of Zelda: Ocarina of Time" />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-orbitron text-[10px] font-bold text-deal-purple uppercase tracking-[0.2em] mb-2">Platform</label>
                            <select required value={platform} title="Platform Selectie" onChange={(e: any) => setPlatform(e.target.value)} class="w-full bg-[#0a0a0d] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-deal-green transition-all appearance-none">
                                {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label class="block font-orbitron text-[10px] font-bold text-deal-purple uppercase tracking-[0.2em] mb-2">Staat (Conditie)</label>
                            <select required value={condition} title="Conditie Selectie" onChange={(e: any) => setCondition(e.target.value)} class="w-full bg-[#0a0a0d] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-deal-green transition-all appearance-none">
                                {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block font-orbitron text-[10px] font-bold text-deal-purple uppercase tracking-[0.2em] mb-2">Koopprijs (€)</label>
                            <div class="relative">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">€</span>
                                <input type="number" step="0.01" required value={price} onInput={(e: any) => setPrice(e.target.value)} class="w-full bg-[#0a0a0d] border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white text-sm font-barlow font-bold focus:outline-none focus:border-deal-green transition-all" placeholder="0.00" />
                            </div>
                        </div>
                        <div>
                            <label class="block font-orbitron text-[10px] font-bold text-deal-purple uppercase tracking-[0.2em] mb-2">Voorraad</label>
                            <input type="number" required min="0" value={stock} onInput={(e: any) => setStock(e.target.value)} class="w-full bg-[#0a0a0d] border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-barlow font-bold focus:outline-none focus:border-deal-green transition-all" placeholder="1" />
                        </div>
                    </div>

                    <div>
                        <label class="flex items-center gap-3 p-4 bg-[#0a0a0d] border border-white/10 rounded-lg cursor-pointer hover:border-deal-green/50 transition-all select-none">
                            <input type="checkbox" checked={isWeekdeal} onChange={(e: any) => setIsWeekdeal(e.target.checked)} class="w-5 h-5 accent-deal-green rounded border-white/20 bg-transparent" />
                            <div>
                                <span class="block text-sm font-bold text-white mb-0.5">Markeren als Weekdeal</span>
                                <span class="text-[10px] text-on-surface-variant uppercase tracking-wider">Wordt bovenaan op de homepagina getoond met vlam layer.</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Right Column: Image */}
                <div>
                    <label class="block font-orbitron text-[10px] font-bold text-deal-purple uppercase tracking-[0.2em] mb-2">Product Foto (Direct Upload)</label>
                    <div class="bg-[#0a0a0d] border border-white/10 border-dashed rounded-xl overflow-hidden relative group aspect-square flex items-center justify-center hover:border-deal-green/50 transition-colors">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" class="w-full h-full object-cover" />
                        ) : (
                            <div class="text-center p-6 point-events-none">
                                <span class="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-4 block group-hover:text-deal-green/50 transition-colors">add_photo_alternate</span>
                                <p class="text-xs text-on-surface-variant font-medium">Klik of sleep om een front-cover foto te uploaden</p>
                            </div>
                        )}
                        <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/webp" 
                            onChange={handleImageChange}
                            required
                            title="Upload Product Foto"
                            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {imagePreview && (
                            <div class="absolute inset-x-0 bottom-0 p-3 bg-black/60 backdrop-blur-sm text-center">
                                <span class="text-[10px] text-white font-orbitron uppercase tracking-widest font-bold">Foto Geselecteerd (Klik om te wijzigen)</span>
                            </div>
                        )}
                    </div>
                    <p class="text-[10px] text-on-surface-variant mt-3 text-center">Images worden direct opgeslagen in de Supabase Storage Bucket.</p>
                </div>
            </div>

            <div class="pt-6 border-t border-white/10 mt-6 flex justify-end">
                <button type="submit" disabled={loading} class="bg-deal-green text-black px-8 py-4 rounded-xl font-orbitron font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? (
                        <><span class="material-symbols-outlined animate-spin text-sm">refresh</span> Bezig met Uploaden & Opslaan...</>
                    ) : (
                        <><span class="material-symbols-outlined text-sm">publish</span> Product Publiceren</>
                    )}
                </button>
            </div>
        </form>
    );
}
