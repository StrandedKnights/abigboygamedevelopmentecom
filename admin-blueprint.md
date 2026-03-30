# Admin Blueprint - Enterprise Dashboard & CRM

## Core Modules & Architecture

The admin module is designed exclusively for the owners of "A Big Boy's Game". It operates entirely on Astro Server-Side Rendering (SSR) for zero loading spinners, secured by a master password (`bigboy2024`).

### 1. Dashboard Overview (Stats)
- **Tech Stack**: Raw Prisma specific queries executed in the `index.astro` frontmatter.
- **KPIs**:
    - `Total Revenue`: Sum of all `Order.totalAmountInCents` where `status = 'PAID' | 'SHIPPED'`.
    - `Total Orders`: Count of non-cancelled orders.
    - `Low Stock Alerts`: Lists `Product.title` where `stock <= 1`.
- **UI/UX**: Pure CSS staggered fade-in animations on map/cards to simulate a dashboard boot-up sequence without heavy React JS.

### 2. Warehouse & Inventory CRM
- **Current Architecture Flaw**: Attempting to edit an existing product fails because `/admin/products/edit/[id].astro` is missing or unlinked.
- **The Bugfix**:
    1. **Route Creation**: Build the dynamic SSR route `src/pages/admin/products/edit/[id].astro`.
    2. **SSR Fetching**: Fetch the target `Product` using Prisma on load. Fallback 404 if missing.
    3. **Form Pre-fill**: Mount `AdminProductForm` (or `EditProductForm`) passing the fetched product data as initial props.
    4. **PATCH Update Route**: Implement `PATCH /api/admin/products/[id].ts` to handle database updates asynchronously.
- **Features**: Real-time list view, strict taxonomy validation on 30 platforms and 4 conditions, image upload using Node Native Buffer via Supabase Storage.

### 3. Order Management (CRM)
- **Tech Stack**: React (`OrderList.tsx`) combined with Astro payload.
- **Features**:
    - **Search**: Fuzzy search by `customerName` or `customerEmail`.
    - **Status Mutations**: A `select` dropdown to toggle between `PENDING`, `PAID`, `SHIPPED`, `CANCELLED`, `REFUNDED`.
    - **Tracking Codes**: Direct injection mapping to the Prisma `trackingCode` column.

### 4. Financial & Accounting Module (Margin Calculator)
- **Data Schema Change**: `Product` requires a new `purchasePriceInCents` column, and `OrderItem` receives a `purchasePriceAtPurchaseInCents` snapshot column to lock margins at the time of purchase.
- **VAT Calculation via "Margeregeling"**:
    - Because the webshop sells pre-owned (secondhand) goods, standard VAT rules do not apply.
    - **Margin Formula**: `Selling Price - Purchase Price`.
    - **VAT Payable**: `21% of the Margin` (Not 21% of the selling price).
    - **Export**: Generates an accounting tab reporting the true margin per order.

## Action Plan (Execution Breakdown)
*See `task_plan.md` for specific ticked milestones.*

**Phase 1: Foundation & Data Schema**
- Update `schema.prisma` with `purchasePriceInCents`.
- Apply DB Push.

**Phase 2: Fixing the Edit Route & Warehouse (The Bugfix)**
- Build `src/pages/admin/products/edit/[id].astro`.
- Implement `api/admin/products/[id].ts` (PUT/PATCH).

**Phase 3: Security, Dashboard Overview & Animations**
- Secure all routes.
- Implement aggregated DB stats for the Dashboard UI.

**Phase 4: CRM & Finance Module**
- Develop Order CRM List with Tracking injection.
- Build the "Margeregeling" calculator table.
