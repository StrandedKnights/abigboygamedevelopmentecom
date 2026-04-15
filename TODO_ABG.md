# PROJECT TODO — A Big Boy's Game 🚀

Dit document bevat de resterende stappen die nodig zijn om de webshop volledig "Launch Ready" te maken. 
**Focus: De stap van catalogus naar werkende verkoopmachine.**

---

## 🔝 PRIORITEIT 1: Live Checkout & Mollie (Phase 7)
*De belangrijkste stap. Zonder dit kunnen mensen niks kopen.*

- [x] **Mollie API Sessie (Backend)**
    - Implementeer `/api/checkout` API route die een `OrderItem` array ontvangt.
    - Maak een Mollie `payment` aan met de juiste `totalAmount` en metadata (Order ID).
    - Redirect de gebruiker naar de Mollie Betaallink.
    - **[TECHNICAL LOG - 06 APR]**: Problemen met dynamische `Astro.url.origin` (vanwege de Coolify proxy) opgelost door Mollie "redirectUrl" en "webhookUrl" keihard vast te zetten (`hardcoded`) op de productie URL.
- [x] **Webhook Handler (Cruciaal)**
    - Maak `/api/webhooks/mollie` aan om status-updates te ontvangen (Paid, Cancelled, Expired).
    - Update de Prisma Database: Zet `Order` status op **PAID** zodra de webhook bevestigt.
    - Update Voorraad: Trek de gekochte items automatisch af van de `Product` voorraad.
- [x] **Success & Fail Pages**
    - Ontwerp `/checkout/success.astro`: Een mooie "Bedankt voor je bestelling!" pagina in Cyberpunk Morphism stijl met het Ordernummer.
    - Ontwerp `/checkout/cancel.astro`: Een vriendelijke pagina voor als de klant de betaling afbreekt.
- [x] **Mollie Refund & Restock System**
    - [NEW] Refund-functie toegevoegd aan Admin Dashboard voor directe terugbetalingen via Mollie API.
    - [NEW] Automatische restock van producten bij refunds en geannuleerde bestellingen.
    - **[TECHNICAL LOG - 06 APR]**: `api/abg-nexus/orders/refund/[id].ts` gebouwd met de allernieuwste `mollieClient.paymentRefunds.create()` SDK syntax. Transactie triggert een soft-delete-achtige status update naar `REFUNDED` en doorloopt de `order.items` map om bij alle onderliggende producten `stock: { increment: quantity }` uit te voeren. Dit garandeert synchrone inventory correctie op de website.

---

## 📧 PRIORITEIT 2: Post-Purchase Automation
*Zorg dat de klant weet dat alles goed is gegaan.*

- [ ] **Bevestigingsmail (Klant)**
    - Zodra de betaling binnen is (via de webhook), verstuur een automatische mail met de factuur of order-overzicht.
- [ ] **Notificatie (Admin)**
    - Ontvang zelf een melding (Telegram/Email) zodat je direct weet dat er iets ingepakt moet worden.

---

## 💅 PRIORITEIT 3: UI/UX & SEO Polish
*De details die het project "A-Grade" maken.*

- [ ] **Product Catalogus Filters**
    - Voeg "Filter op Prijs" (Slider) toe aan de Sidebar in `/shop`.
    - Zorg dat de URL parameters (`?priceMin=10`) altijd gesynct blijven als je de pagina ververst.
- [ ] **Dynamic Meta Tags (SEO)**
    - Zorg dat elke Product Details Pagina (PDP) automatisch de juiste `<title>` en `meta description` heeft (voor Google en Social Media sharing).
- [ ] **Sitemap & Robots**
    - Genereer `sitemap.xml` en `robots.txt` om ervoor te zorgen dat Google je nieuwe pages direct begint te indexeren.

---

## 🛠️ ADMIN DASHBOARD: Laatste Puntjes
- [ ] **Order Tracking Flow**
    - Nu we de Tracking Code kunnen injecteren in de Admin, moet er nog een "Verstuur Mail naar Klant" trigger komen die de code naar hen mailt.
- [x] **Order Status Integriteit**
    - **[TECHNICAL LOG - 06 APR]**: Status lock ingebouwd op voltooide bestellingen. De interface voor statussen is nu "disabled" wanneer een bestelling de eindstaten (`SHIPPED`, `CANCELLED`, `REFUNDED`) heeft bereikt. Hiermee wordt accidentele overschrijving of dubbele actie (b.v. nog een keer op Refund drukken) vermeden via frontend validatie met duidelijke visuele feedback (grijze uitstraling).
- [ ] **Dashboard Charts**
    - (Optioneel) Voeg een eenvoudige grafiek toe aan het Dashboard voor omzetverloop over de laatste 30 dagen.

---

> [!IMPORTANT]
> **Eerstvolgende stap voor jou:** 
> Start met de **Mollie Checkout Flow**. Het API-skelet staat al in `src/pages/api/checkout.ts`, maar moet nu gekoppeld worden aan de echte Mollie-client en de database.

*Laatste Update: 7 April 2026*
