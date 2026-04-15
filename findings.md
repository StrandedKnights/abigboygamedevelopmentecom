# Findings — A Big Boy's Game Project Discovery & Audit

## 🛡️ BLAST Phase 1: Discovery Answers

- **North Star:** Create the most premium, high-trust digital storefront for retro gaming collectibles in the Benelux, focused on "A Big Boy's Game" branding.
- **Integrations:**
    - **Mollie API:** For iDEAL and Credit Card payments.
    - **Web3Forms:** For serverless contact form handling.
    - **Supabase:** For PostgreSQL database and Auth.
- **Source of Truth:**
    - Primary Data: Production PostgreSQL on Supabase.
    - Reference UI: `source2.html` (Original High-Fidelity Mockup).
- **Delivery Payload:** Unified Astro SSR app hosted on Coolify (replacing the dual Astro/Express setup).
- **Behavioral Rules:** STRICT "No Returns" policy. Branding must feel "Morphism/Glassy" and "Dark Retro".

## 🛠️ Technical Revelations

### 1. Element Centering Reliability
**Issue**: Centering text perfectly inside a circular badge is often botched by browser-specific line-heights.
**Resolution**: Use absolute positioning with `50%` offsets and `translate(-50%, -50%)`. This ignores font-specific baseline metrics.

### 2. Aesthetic Color Theory
**Issue**: Initially used `#d593ff` (too neon), causing eye strain in dark mode.
**Resolution**: Swapped to `#9b5fe0` (Medium Slate Purple). This maintains brand identity while improving readability on `#0e0e13` backgrounds.

### 3. Logo Transparency (The "Morphism" Trick)
**Issue**: User logo has a hard black background, which clashes with slightly-off-black UI elements.
**Resolution**: Implement `mix-blend-lighten`. This drops the black background entirely when layered over the dark theme, making the logo appear transparent/integrated.

### 4. Container Grid Symmetry
**Issue**: Footer columns and header elements frequently misaligned on 1024px-1280px viewports.
**Resolution**: Moved from standard `grid-cols-4` to a responsive `sm:grid-cols-2 lg:grid-cols-4` pattern with optical padding-top on headers to maintain a uniform top-line baseline.

### 5. Deployment Architecture
**Issue**: Serving both Astro (SSR) and Express (API) usually requires two separate containers or complex process management.
**Resolution**: Refactored to a **Unified Astro SSR** architecture. APIs are now handled by Astro API routes (`pages/api/...`), simplifying the Docker image and reducing memory overhead on Coolify.

### 6. Prisma Versioning & Schema Compatibility
**Issue**: Upgrading to Prisma 7.x introduced breaking changes in the `datasource` block (Error `P1012`), requiring a `prisma.config.ts`.
**Resolution**: Pinning both `@prisma/client` and `prisma` to version **5.11.0**. This maintains compatibility with the existing schema structure and ensures a stable connection to Supabase without new configuration overhead.

### 7. Centralized API Enforcement
**Issue**: Fragmentation of data-fetching logic between direct Prisma calls (SSR) and raw `fetch` calls (Client-side) creates a maintenance burden.
**Resolution**: Implemented a mandatory `apiClient.ts` layer. All interactions—including internal loopback requests in SSR—must now route through this service. This ensures that authentication headers, base URLs, and error-handling structures are unified and type-safe across the entire application.

### 8. Supabase Connectivity & Prisma Locking
**Issue**: Using the standard Supabase Pooler (transaction mode) led to persistent `FATAL: Tenant or user not found` errors during high-frequency SSR requests.
**Resolution**: Switched connection strings to the **Direct Supabase Host** (`db.lcffetewbstixbrijuch.supabase.co:5432`). This bypassed the AWS pooler's authentication drift and stabilized all database interactions.

### 9. Admin Dashboard & Image Upload Fixes
**Issue**: Image uploads were failing with 500 errors in production (Linux/Coolify).
**Resolution 1 (Buffer)**: Refactored `File.arrayBuffer()` to use `Buffer.from(arrayBuffer)` for better Node.js compatibility in containerized environments.
**Resolution 2 (Auth)**: Identified "Invalid Compact JWS" error, tracing it back to an incorrectly configured `SUPABASE_SERVICE_ROLE_KEY` in the production environment variables.
**Resolution 3 (Storage)**: Ensured the `product-images` bucket in Supabase is set to 'Public' to allow direct URL access for product cards.
### 10. Mollie Redirects & Webhook Stability
**Issue**: Dynamic origin detection (`Astro.url.origin`) failed behind Coolify's proxy, causing "Invalid Redirect URL" errors in Mollie.
**Resolution**: Hardcoded the Production URL (`https://www.abigboysgamedevelopment.skyco-webagency.nl`) for all redirect and webhook endpoints to ensure 100% reliability.

### 11. Real-time Inventory Sync
**Issue**: Product Detail Pages (PDP) were showing cached/stale stock levels after a purchase or manual update.
**Resolution**: Implemented `Cache-Control: no-store, max-age=0` headers and side-stepped Astro's internal caching for product data fetches, forcing the browser to fetch live data from the database on every visit.

### 12. Integrated Refund & Restock Flow
**Issue**: Refunding a customer required manual action in Mollie AND manual stock adjustment in the database.
**Resolution**: Built a unified "Refund" action in the Admin Dashboard. A single click now:
1. Triggers the Mollie API for a full refund.
2. Updates the Database order status to `REFUNDED`.
3. Automatically increments the Product Stock (+1) back into inventory.
