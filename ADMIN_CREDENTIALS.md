# Catalyst Digital CMS — Admin Login Credentials & Access Control

This document outlines the administrative login credentials, role definitions, and access permissions for the **Catalyst Digital Content Management System (CMS)**.

---

## 🔐 Login Access URL

- **Login Page URL**: `http://localhost:3000/admin/login` (or `https://yourdomain.com/admin/login` in production)
- **Admin Dashboard**: `http://localhost:3000/admin`

> **Note**: All `/admin/*` routes are protected by the Next.js 16 Proxy layer (`src/proxy.ts`). Unauthenticated visitors attempting to access any admin URL will be automatically redirected to `/admin/login`.

---

## 👥 Administrative Accounts & Credentials

The system comes pre-configured with **4 administrative role profiles** designed for pair-testing and enterprise auditing:

| Role Name | Email Address | Password | Role Key | Scope & Responsibilities |
|---|---|---|---|---|
| **Super Administrator** | `superadmin@catalystdigital.com` | `Admin123!` | `super_admin` | **Unrestricted full system access**: Manage platform maintenance mode, brand identity, admin users, permissions, page toggles, and all content. |
| **Content Administrator** | `content@catalystdigital.com` | `Admin123!` | `content_admin` | **Content & Operations**: Toggle page and section statuses, manage all catalogs (services, projects, team, blog, FAQs), and process inbound client leads. |
| **Staff Content Editor** | `editor@catalystdigital.com` | `Admin123!` | `editor` | **Content Drafting**: Create, update, and manage services, case studies, team profiles, blog articles, and FAQ entries. |
| **Auditor / Viewer** | `auditor@catalystdigital.com` | `Admin123!` | `viewer` | **Read-Only**: Audit permissions, view CMS catalogs and read inbound inquiries without mutation privileges. |

---

## ⚡ Quick One-Click Login Feature

On the `/admin/login` page, you will find **4 Quick Role Selector buttons** below the form. Clicking any role button automatically fills in the corresponding email and password for immediate testing without manual typing:

```
[ Super Administrator ]  [ Content Admin ]
[ Staff Editor ]         [ Read-only Viewer ]
```

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

The system enforces **12 granular permissions** across 4 functional categories (`System`, `Security`, `Content`, `Communication`):

| Permission ID | Capability Description | Super Admin | Content Admin | Editor | Viewer |
|---|---|:---:|:---:|:---:|:---:|
| `maintenance:manage` | Toggle platform-wide maintenance mode | ✅ | ❌ | ❌ | ❌ |
| `settings:manage` | Update brand info, emails, office address | ✅ | ❌ | ❌ | ❌ |
| `users:manage` | Manage admins and inspect RBAC matrices | ✅ | ❌ | ❌ | ❌ |
| `pages:manage` | Activate/deactivate public pages (e.g. `/services`) | ✅ | ✅ | ❌ | ❌ |
| `sections:manage` | Toggle sections on/off & edit headlines | ✅ | ✅ | ❌ | ❌ |
| `services:manage` | Full CRUD for services catalog & icons | ✅ | ✅ | ✅ | ❌ |
| `projects:manage` | Full CRUD for portfolio case studies & tags | ✅ | ✅ | ✅ | ❌ |
| `team:manage` | Full CRUD for leadership team & LinkedIn URLs | ✅ | ✅ | ✅ | ❌ |
| `blog:manage` | Full CRUD for insights, articles, and drafts | ✅ | ✅ | ✅ | ❌ |
| `faqs:manage` | Full CRUD for accordion FAQ entries | ✅ | ✅ | ✅ | ❌ |
| `inquiries:read` | View incoming client contact form leads | ✅ | ✅ | ✅ | ✅ |
| `inquiries:manage` | Update lead workflow status & reply actions | ✅ | ✅ | ❌ | ❌ |

---

## 🔍 Interactive Permission Search Tool

Administrators can audit and verify permissions dynamically inside the admin panel:
- Navigate to **`http://localhost:3000/admin/users`**
- Use the real-time search bar to search for any keyword (e.g., `services`, `maintenance`, `inquiries`)
- Filter capabilities by domain category (`System`, `Content`, `Communication`, `Security`)
- Click any capability to view the detailed operational impact inspector.

---

## 🔒 Security & Session Management

- **Session Cookie**: `catalyst_cms_session` (Base64url-encoded payload with `userId`, `email`, `roleId`, and timestamp expiration).
- **Session Duration**: 7 days (with auto-renewal on login).
- **Route Guard**: Implemented via Next.js 16 file convention `src/proxy.ts`.
- **API Guard**: Mutation API endpoint `/api/admin/cms` verifies permissions server-side on every request.
- **Database Security**: Supabase PostgreSQL tables utilize Row Level Security (RLS) policies defined in `supabase/schema.sql`.

---

## 🛠️ Adding, Editing & Deleting Users & Permissions

You can now manage administrators and capabilities directly inside the Admin Panel UI:
1. **Directly in Admin UI (`/admin/users`)**:
   - **Add Administrator**: Click **"Add Administrator"** in `/admin/users` to provision new users with custom passwords, roles, and status. Passwords are cryptographically hashed using PBKDF2.
   - **Edit / Reset Password**: Click the edit pencil icon on any administrator to change their role, full name, email, or reset their password.
   - **Toggle Status**: Click the active/inactive toggle switch to enable or disable login permissions in real time.
   - **Delete**: Click the trash icon to permanently remove an administrator (with safeguards against deleting your own logged-in account or the last remaining super admin).
   - **Role Permissions Matrix**: Switch to the **"Role Permissions Matrix"** tab to register new capability keys or toggle checkmarks across roles with live database persistence.
2. **In Supabase Database**:
   - Query or inspect the `admin_users`, `permissions`, and `role_permissions` tables directly in your Supabase SQL Editor.
