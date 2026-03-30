# Task Plan — A Big Boy's Game (BLAST Protocol)

## 🏗️ Phase 1: Blueprint (B) [COMPLETED]
- [x] Initial Architecture Design (Unified Astro SSR)
- [x] Define North Star & Discovery Answers (in `findings.md`)
- [x] Lock Data Schemas (in `gemini.md`)
- [x] Research & Audit existing components
- [x] Prisma Native Integration (Singleton + 5.11.0 Fix)

## ⚡ Phase 2: Link (L) [COMPLETED]
- [x] Test Mollie API connection (Sandbox)
- [x] Verify Web3Forms access key integration
- [x] Connect Frontend to Production Database (Supabase)
- [x] **Update BLAST protocol documents** (`gemini.md`, `findings.md`, `progress.md`)

## ⚙️ Phase 3: Architect (A) [COMPLETED]
- [x] Component Library Implementation (Bento, Hero, etc.)
- [x] Contact Page & Form Integration
- [x] Legal & Customer Service Pages Structure
- [x] **Implementation of `/api/products` (Advanced Filtering API)**
- [x] **Implementation of `/shop` (Astro SSR avec URL Sync)**
- [x] Global State Management (Shopping Cart with Nano Stores)
- [x] Checkout Logic & Payment Redirects (Astro API routes)

## ✨ Phase 4: Stylize (S) [COMPLETED]
- [x] Apply "Morphism" Dark Theme globally
- [x] Integrate Barlow & Orbitron Typography
- [x] Brand Color Tone-Down (`#d593ff` -> `#9b5fe0`)
- [x] Add Micro-interactions (Hover states, Typewriter animation)
- [x] Polish Shop Filter UI (Glassmorphic Sidebar)
- [x] **Cyberpunk PDP (Full SSR high-fidelity implementation)**
- [x] **Nanostores Cart Visuals (Cyberpunk Drawer logic)**

## 🚀 Phase 5: Trigger (T) [IN PROGRESS]
- [x] Dockerization (Unified Astro build)
- [x] GitHub Push & Production Sync
- [x] Admin Authentication (Master Password Bypass)
- [x] **Documentation Sync (Gemini, Findings, Progress, Task) COMPLETED**
- [ ] Final Production Launch & Testing (Coolify)

## 🛠️ Phase 6: Enterprise Admin Dashboard (CMS & CRM) [COMPLETED]
- [x] **Phase 6.1: Foundation & Data Schema**
    - [x] Update `schema.prisma` with `purchasePriceInCents` for the Margin Calculator.
    - [x] Run `prisma db push` and update `apiClient.ts` types.
- [x] **Phase 6.2: Fixing the Edit Route & Warehouse (Bugfix)**
    - [x] Create `src/pages/admin/products/edit/[id].astro` (SSR fetching).
    - [x] Implement `PATCH /api/admin/products/[id].ts`.
    - [x] Add Form fields for `Koopprijs (Inkoop)` and enforce strict taxonomy.
- [x] **Phase 6.3: Dashboard Overview & Animations**
    - [x] SSR Aggregation for Revenue, Orders, and Low Stock in `index.astro`.
    - [x] Implement CSS staggered fade-ins and number counting animations.
- [x] **Phase 6.4: CRM & Finance Module (The Margin Calculator)**
    - [x] Order search and status mutation (`PATCH` route).
    - [x] "Margeregeling" calculator: VAT calculated at 21% of the margin (Selling - Purchase).

## 🛒 Phase 7: Checkout & Post-Purchase [NEXT]
- [ ] **Mollie API Integration (Live Checkout Flow)**
- [ ] **Order Success & Receipt Pages**
- [ ] **Order Management CRM expansion (Klantgegevens + Tracking)**

---
*Last Updated: 2026-03-30*
