# Admin Blueprint - Enterprise Dashboard & CRM (Final Blueprint)

## Core Modules & Architecture

The admin module is designed exclusively for the owners of "A Big Boy's Game". It operates entirely on Astro Server-Side Rendering (SSR) for zero loading spinners, secured by a Session-Cookie middleware.

### 1. Dashboard Overview & Analytics (Stats)
- **Tech Stack**: Raw Prisma specific queries executed in the `index.astro` frontmatter.
- **KPIs**:
    - `Total Revenue`: Sum of all `Order.totalAmountInCents` where `status = 'PAID' | 'SHIPPED'`.
    - `Total Orders`: Count of non-cancelled orders.
    - `Low Stock Alerts`: Lists `Product.title` where `stock <= 1`.
- **Visuals**: Chart.js integration showing revenue trends (per day/week).
- **Animations**: Staggered fade-ins for cards.
- **Live Radar**: Display current soft-locks (items in active checkouts).

### 2. Order Management & CRM (Enhanced with RMA)
- **Track & Trace Trigger**: "Verzendbevestiging Versturen" button triggering a pre-formatted email via Resend (or similar) with tracking details.
- **Order History Log**: Persistent logbook per order (e.g., "02-04: Betaald").
- **Status Mutation**: `PENDING`, `PAID`, `SHIPPED`, `CANCELLED`, `REFUNDED`.
- **Automated Restock Flow (RMA)**: Backend API resets `stock` to `1` in `Product` table when order status moves to `CANCELLED` or `REFUNDED`.
- **Mollie Margin Sync**: VAT Rate dynamically sent to Mollie API (`0.00%` for Margin, `21.00%` for Standard).

### 3. Warehouse & Inventory (The Power User Tools)
- **Edit Route**: `src/pages/admin/products/edit/[id].astro` for robust existing product editing.
- **Bulk Operations**: Bulk-edit feature to update prices/stock rapidly.
- **Margin Scheme Toggle**: `taxScheme` (or `isMarginScheme`) stored per Product to toggle Margin vs. Standard 21%.
- **Images**: Robust Node.js buffer conversion for secure Supabase Storage upload.
- **Notifications**: Email triggers for low stock alerts (when hit 1).

### 4. Financial & Accounting Module
- **Margeregeling Export**: Dedicated feature to export a CSV/PDF of the margin-scheme report for the quarter (`Verkoopprijs - Inkoopprijs = Marge -> 21% BTW over Marge`).

### 5. Security & Session Management
- **Auth Upgrade**: Secure Session-Cookie (HttpOnly) with a 24-hour TTL.
- **Middleware**: Astro middleware verification to enforce dashboard access purely over standard HTTP/s state, replacing the simple client-password bypass.

---

## Technical Specifications (RMA & Margins)
* **Margin Scheme**: `Product.taxScheme = 'MARGIN'` calculates VAT only over the profit. Default for retro games. New games get `STANDARD` (21% over full price).
* **RMA Flow**: On CANCEL/REFUND, the server iterates `order.items` and calls a `prisma.product.update` to increment stock, restoring inventory automatically.
