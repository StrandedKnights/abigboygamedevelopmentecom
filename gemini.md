# A Big Boy's Game — Project Constitution (gemini.md)

## North Star
Premium, dark-themed headless e-commerce for "A Big Boy's Game" — pre-owned retro gaming. No returns. Quality guaranteed.

## Source of Truth
- Design: `source2.html` in root project directory
- Backend: Express + Prisma + Mollie (`backend/`)
- Frontend: Astro + Tailwind CSS v3 (`frontend/`)
- Logo: `/frontend/public/images/logo.jpg` (user-provided, has black bg → use mix-blend-lighten)
- Deployment: Dockerfile for Coolify hosting (Frontend on port 4321, Backend on port 3000)

## Data Schema

### Product
```json
{ "id": "cuid", "title": "String", "platform": "String", "priceInCents": "Int", "stock": "Int", "condition": "String", "imageUrl": "String", "isLegacy": "Boolean" }
```

### Order
```json
{ "id": "cuid", "customerEmail": "String", "customerName": "String", "totalAmountInCents": "Int", "molliePaymentId": "String?", "status": "PENDING|PAID|CANCELED|EXPIRED|FAILED", "trackingCode": "String?" }
```

## Behavioral Rules
1. **No Returns**: All copy = "alle verkopen zijn definitief". Never mention bedenktijd/retour.
2. **Dark Only**: `#0e0e13` backgrounds. Inline `style` as Tailwind fallback.
3. **Typography**: Barlow Condensed (major headings), Orbitron (UI labels/accents), Space Grotesk (sub), Inter (body).
4. **Neon accents**: Deep Purple `#9b5fe0`, deal green `#00FF88`. Per-platform colors (Xbox=green, Sega=blue, etc.)
5. **Logo in hero**: Use `mix-blend-lighten` + `opacity-25` for full-bleed hero background.

## Architectural Invariants
- Frontend fetches from `http://localhost:3000/api/` (Requires mapping in production via ENV)
- Images optimized via Sharp on upload
- Mollie handles payments
- Tailwind inline `style` fallback mandatory for dark theme guarantee

## Component Inventory
| Component | File | Status |
|---|---|---|
| TopNavBar | `components/TopNavBar.astro` | ✅ Done — `#9b5fe0` branding |
| HeroSection | `components/HeroSection.astro` | ✅ Done — logo bg, Barlow typography |
| BentoCategoryGrid | `components/BentoCategoryGrid.astro` | ✅ Done — bold cards, absolute badge centering |
| NieuwsteToevoegingen | `components/NieuwsteToevoegingen.astro` | ✅ Done — scroll arrows, reference matching |
| WeekdealsBanner | `components/WeekdealsBanner.astro` | ✅ Done |
| TrustBar | `components/TrustBar.astro` | ✅ Done — no-returns copy, deep purple icons |
| Footer | `components/Footer.astro` | ✅ Done — `#9b5fe0` tone down |
