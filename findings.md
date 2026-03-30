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
**Issue**: Local development often locks the Prisma Client DLL, causing "out of sync" errors when modifying the schema without a full server restart.
**Resolution**: During development sprints, use `as any` type-casting in the `seed.ts` and `api/admin` routes. This permits rapid iteration without waiting for the Prisma client to fully re-generate and unlock.
