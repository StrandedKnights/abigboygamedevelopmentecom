# A Big Boy's Game — Retro Gaming E-commerce

> Dé retro gaming webshop van Nederland. Originele consoles, games en accessoires.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Astro 4 (SSR mode via `@astrojs/node`) |
| **UI** | Preact + Astro components |
| **Styling** | TailwindCSS 3 |
| **Database** | PostgreSQL via Supabase |
| **ORM** | Prisma 5 |
| **Storage** | Supabase Storage (product images) |
| **Payments** | Mollie (iDEAL, Klarna, Creditcard) |
| **Hosting** | Docker container on Hetzner VPS via Coolify |

## Project Structure

```
frontend/
├── prisma/           # Database schema & migrations
├── public/           # Static assets (images, robots.txt)
├── src/
│   ├── components/   # Reusable UI components (Astro + Preact)
│   ├── config/       # Taxonomy, constants
│   ├── layouts/      # Base and Admin layouts
│   ├── lib/          # Utilities (prisma, supabase, secrets, products)
│   ├── pages/        # File-based routing
│   │   ├── admin/    # Admin dashboard pages
│   │   ├── api/      # API endpoints
│   │   ├── product/  # Product detail pages (dynamic)
│   │   └── *.astro   # Static pages (home, shop, FAQ, etc.)
│   ├── store/        # Client-side state (cart via nanostores)
│   ├── stores/       # Server-side shop state
│   ├── services/     # API client utilities
│   └── styles/       # Global CSS
├── astro.config.mjs  # Astro configuration
└── tailwind.config.mjs
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+
- PostgreSQL database (Supabase recommended)

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials, Mollie API key, etc.

# 4. Generate Prisma client & push schema
npx prisma generate
npx prisma db push  # or: npx prisma migrate deploy

# 5. Start development server
npm run dev
```

The app will be available at `http://localhost:4321`.

### Docker (Production)

```bash
# Build the Docker image
docker build -t abigboysgame .

# Run with environment variables
docker run -p 4321:4321 \
  -e DATABASE_URL="..." \
  -e PUBLIC_SUPABASE_URL="..." \
  -e PUBLIC_SUPABASE_ANON_KEY="..." \
  -e SUPABASE_SERVICE_KEY="..." \
  -e ADMIN_GATEWAY_KEY="..." \
  abigboysgame
```

## Admin Dashboard

The admin panel is behind a gateway key for security-by-obscurity:

1. Navigate to `/admin?key=YOUR_ADMIN_GATEWAY_KEY`
2. Log in with your Supabase Auth credentials
3. Access product management, order management, finance/margeregeling

### Admin Features

- **Products:** CRUD with taxonomy validation, image upload, weekdeal management
- **Orders:** Status management (PENDING → PAID → SHIPPED), RMA restock on cancellation
- **Finance:** Revenue, cost, margin, and VAT (margeregeling) calculations with CSV export

## Environment Variables

See [`.env.example`](frontend/.env.example) for all required variables.

## Deployment

Deployed via **Coolify** on a Hetzner VPS. The `Dockerfile` uses a multi-stage build:
1. Build stage: installs deps, generates Prisma client, builds Astro SSR
2. Production stage: minimal Alpine image running the Node.js SSR server

Docker Secrets are supported via the `entrypoint.sh` script for secure credential injection.

## License

Proprietary — All rights reserved by A Big Boy's Game / Skyco Web Agency.
