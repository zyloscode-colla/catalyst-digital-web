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

---

## 🏛️ Numerical Role Hierarchy & Governance Tiers

To prevent privilege escalation and enforce separation of duties, the system enforces a strict **Numerical Authority Rank**:

| Tier Level | Role Name | Rank Value | Manageable Tiers | Max Assignable Role |
|---|---|:---:|---|---|
| **Tier 1** | `super_admin` | **100** | All other tiers (`content_admin`, `editor`, `viewer`, and other `super_admin` except self) | `super_admin` (100) |
| **Tier 2** | `content_admin` | **75** | `editor` (50) & `viewer` (25) | `editor` (50) |
| **Tier 3** | `editor` | **50** | `viewer` (25) | `viewer` (25) |
| **Tier 4** | `viewer` | **25** | None (Read-only) | None |

### 🔒 Core Security Rules:
1. **Self-Privilege Guard**: An administrator can **never** alter their own access tier/role, deactivate their own account, or delete themselves.
2. **Hierarchical Boundary**: An administrator at Rank $R$ can **only** manage or alter accounts with strictly lower rank ($R_{target} < R$). Lower-credential administrators cannot edit, deactivate, or delete higher or equal rank administrators.
3. **Role Assignment Containment**: An administrator can **never** grant a role equal to or higher than their own authority tier ($R_{assign} < R_{requester}$).
4. **Policy Matrix Exclusive**: Only Super Administrators (`Rank 100`) have authority to modify the system Role Permissions Matrix or register new capability keys.

---

## 🍪 Cookies & Live Session Management

The system features real-time session tracking, cryptographic cookie hardening, and live Supabase PostgreSQL synchronization:

- **Cookie Name**: `catalyst_cms_session`
- **Security Flags**:
  - `HttpOnly: true` (Prevents client-side scripts from reading session tokens, mitigating XSS attacks).
  - `SameSite: Lax` (Defends against cross-site request forgery CSRF).
  - `Secure`: Enforced on HTTPS/Production environments.
  - `Max-Age: 7 Days` (604,800 seconds).
- **Live Database Validation**:
  - On every authenticated request, `getCurrentUser()` validates the session against live Supabase `admin_users`.
  - If an administrator is deactivated (`is_active: false`) or deleted in Supabase, their session cookie is **instantly invalidated** and rejected on their very next click.
  - If an administrator's role is updated in Supabase, the active session **dynamically reflects the new role** immediately without requiring re-login.
- **Session Governance UI (`/admin/users` -> Cookies & Active Sessions Tab)**:
  - View all active devices and login sessions with IP addresses and user-agents.
  - One-click **"Revoke Session"** to terminate specific devices.
  - **"Log Out Other Devices"** action to invalidate all other active sessions while preserving the current console session.

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
