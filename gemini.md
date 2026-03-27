# A Big Boy's Game — Project Constitution (gemini.md)

## North Star
Premium, dark-themed headless e-commerce for "A Big Boy's Game" — pre-owned retro gaming. No returns. Quality guaranteed.

## Source of Truth
- Design: `source2.html` in root project directory
- Backend: Astro API Routes + Prisma Native
- Frontend: Astro + Tailwind CSS v3 (SSR Enabled)
- Logo: `/frontend/public/images/logo.jpg` (user-provided, has black bg → use mix-blend-lighten)
- Deployment: Dockerfile for Coolify hosting (Unified Astro app on port 4321)

## Data Schema

### Product
```json
{ 
  "id": "cuid", 
  "title": "String", 
  "platform": "String (PlayStation|Nintendo|Xbox|Sega)", 
  "priceInCents": "Int", 
  "stock": "Int", 
  "condition": "String (NEW|LIKE NEW|GOOD|FAIR)", 
  "imageUrl": "String", 
  "isLegacy": "Boolean",
  "category": "String",
  "createdAt": "DateTime",
  "updatedAt": "DateTime"
}
```

### Order
```json
{ 
  "id": "cuid", 
  "customerEmail": "String", 
  "customerName": "String", 
  "totalAmountInCents": "Int", 
  "molliePaymentId": "String?", 
  "status": "PENDING|PAID|CANCELED|EXPIRED|FAILED", 
  "trackingCode": "String?",
  "orderNumber": "String (Optional, for Web3Forms correlation)",
  "createdAt": "DateTime"
}
```

### Contact Submission (Web3Forms)
```json
{
  "access_key": "ID",
  "name": "String",
  "email": "String",
  "subject": "String?",
  "message": "String",
  "order_number": "String?"
}
```

## Behavioral Rules
1. **No Returns**: All copy = "alle verkopen zijn definitief". Never mention "bedenktijd" or "retour" unless clarifying they don't exist.
2. **Dark Theme Invariant**: Backgrounds must be `#0e0e13` (Morphism Dark). 
3. **Typography Standards**: 
    - Barlow Condensed: ALL CAPS for H1/H2 headings.
    - Orbitron: 0.3em letter-spacing for UI labels and accents.
    - Inter: Standard body text, 1.6 leading.
4. **Neon Brand Accents**:
    - Primary Purple: `#9b5fe0`
    - Deal Green: `#00FF88` (used for savings/trust badges)
    - Per-Platform: Xbox (`#107c10`), PlayStation (`#003791`), Nintendo (`#e60012`).
5. **Logo Rendering**: The logo has a black background. Use `mix-blend-lighten` to make it transparent on the dark UI.
6. **Error Handling**: Every API response must include a `status` (success/error), `data` (payload), and `message` (human-readable).

## Architectural Invariants
- **Architecture**: Unified Astro Project (No standalone Express server).
- **SSR Strategy**: Astro SSR for all dynamic pages (Shop, Checkout, Success).
- **Data Layer**: Prisma ORM with singleton pattern in `src/lib/prisma.ts`.
- **Payment Lifecycle**: Webhook-driven status updates handled by Astro API routes.
- **CI/CD**: Auto-deployment to Coolify on push to `main` branch.
- **Asset Optimization**: All product images processed via Sharp to WebP format.
- **Centralized API**: ABSOLUTE RULE — All frontend-to-backend communication MUST route through `src/services/apiClient.ts`. No raw `fetch` or direct Prisma calls in the UI layer.

## Maintenance Log
| Date | Change | Reason |
|---|---|---|
| 2026-03-26 | Integrated Web3Forms | Added professional contact capability. |
| 2026-03-26 | Updated Subcategories | Aligned categories with user inventory (PS2, Switch, Xbox 360). |
| 2026-03-26 | Global Purple Refinement | Swapped `#d593ff` for `#9b5fe0` for better accessibility. |
| 2026-03-27 | Architecture Refactor | Migrated from Express to Astro-native SSR + Prisma Client 5.11.0. |
| 2026-03-27 | API Centralization | Enforced `apiClient.ts` as the single source of truth for all network requests. |


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
