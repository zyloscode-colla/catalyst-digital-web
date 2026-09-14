# Catalyst Digital — Enterprise Web Platform & CMS

Catalyst Digital is an enterprise-grade web application and Content Management System (CMS) engineered with **Next.js 16 (Turbopack)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL)**.

---

## 🚀 Key Features

- **Enterprise Admin Console**: Full CRUD operations for Services, Projects, Leadership Team, Blog/Insights, FAQs, and Inbound Inquiries.
- **Page & Section Master Toggles**: Dynamically turn entire public routes (e.g. `/services`, `/work`) active or inactive, or toggle individual landing page sections with custom offline notices.
- **Platform Maintenance Mode**: Master kill-switch to route public traffic to a branded `/maintenance` page while authenticated administrators bypass downtime.
- **Role-Based Access Control (RBAC)**: 12 granular permissions across 4 roles (`super_admin`, `content_admin`, `editor`, `viewer`) with an interactive **Permission Search Tool** in the admin panel.
- **Supabase Cloud Database**: Production PostgreSQL architecture with 19 tables, indexes, Row Level Security (RLS) policies, and foreign key relations.
- **Dual-Mode Data Architecture**: Queries live Supabase tables when configured, with seamless in-memory fallback for local development.
- **Performance & SEO**: Native image lazy-loading, dynamic Lucide vector icons, and semantic HTML5 hierarchy.

---

## 🔐 Administrative Login Credentials

For full details on accounts, passwords, and permissions, see:
👉 **[ADMIN_CREDENTIALS.md](./ADMIN_CREDENTIALS.md)**

### Quick Reference:
- **Login URL**: `http://localhost:3000/admin/login`
- **Dashboard URL**: `http://localhost:3000/admin`

| Role | Email | Password | Scope |
|---|---|---|---|
| **Super Admin** | `superadmin@catalystdigital.com` | `Admin123!` | Unrestricted full system access & maintenance |
| **Content Admin** | `content@catalystdigital.com` | `Admin123!` | Page & section toggles, catalogs, inquiries |
| **Staff Editor** | `editor@catalystdigital.com` | `Admin123!` | Services, projects, team, blog, FAQs |
| **Viewer** | `auditor@catalystdigital.com` | `Admin123!` | Read-only inspection & auditing |

*(One-click login buttons are also available on the login screen for rapid role testing).*

---

## 🛠️ Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/zyloscode-colla/catalyst-digital-web.git
cd catalyst-digital-web
npm install
```

### 2. Environment Configuration
Copy the template file to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
```

### 3. Run the Database Schema (Supabase)
Paste and run the contents of [`supabase/schema.sql`](./supabase/schema.sql) in your **Supabase SQL Editor**.

### 4. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the live website, or [http://localhost:3000/admin](http://localhost:3000/admin) to open the CMS console.

---

## 📁 Project Architecture

```
src/
├── app/                  # Next.js 16 App Router pages
│   ├── (public)/         # /, /services, /work, /about, /blog, /contact
│   ├── admin/            # CMS Admin Console (/admin/*)
│   ├── api/              # API Routes (/api/contact, /api/admin/*)
│   └── maintenance/      # Public downtime screen
├── components/
│   ├── admin/            # Sidebar, TopNav, and administrative widgets
│   ├── features/         # ServiceCard, ProjectCard, TeamCard, ContactForm
│   ├── layout/           # Navbar, Footer, PageOfflineNotice
│   └── ui/               # Atomic design primitives (Button, Card, Heading, DynamicIcon)
├── lib/
│   ├── auth/             # Session encoding, RBAC matrix, and permission search
│   ├── cms/              # Unified service provider & seed store
│   └── supabase/         # Dual-context Supabase clients
├── proxy.ts              # Next.js 16 Proxy route guards & maintenance interceptor
└── types/                # Strict TypeScript domain and CMS interfaces
```

---

## 🧪 Testing & Verification

```bash
# Type check and lint
npm run lint

# Production build validation
npm run build
```

---

## 📄 Documentation

- [ADMIN_CREDENTIALS.md](./ADMIN_CREDENTIALS.md) — Login credentials, passwords, and RBAC matrix.
- [docs/SOFTWARE_REQUIREMENTS_SPECIFICATION.md](./docs/SOFTWARE_REQUIREMENTS_SPECIFICATION.md) — Full software requirements specification (SRS) audit.
- [supabase/schema.sql](./supabase/schema.sql) — Complete PostgreSQL database schema and seed script.
