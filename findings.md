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
- **Delivery Payload:** Live e-commerce platform hosted on Coolify (Dockerized Astro + Node).
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
**Issue**: Serving both Astro (SSR) and Express (API) usually requires two separate containers.
**Resolution**: Using a multi-stage Dockerfile that installs dependencies for both, then uses a single entrypoint script to manage both processes, simplifying Coolify management.

