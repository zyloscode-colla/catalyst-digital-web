# Google Stitch Master Redesign Prompt & Specification

This document serves as the master prompt and specification for Google Stitch to redesign the Catalyst Digital web user interface. It outlines global styles, design tokens, primitives, feature components, and page-by-page section layouts.

---

## 1. Global Vibe, Theme & Design Tokens

### The Visual Vibe: "Cyber-Premium Glassmorphism"
Create a state-of-the-art, high-end tech portfolio. The design must look extremely premium, responsive, and alive.
*   **Theme**: Dark mode by default (very dark slate/violet background, not pure black).
*   **Styling Elements**: 
    *   Glassmorphic panels with subtle translucent backgrounds, fine borders, and backdrop blurs (`backdrop-filter: blur(12px)`).
    *   Vibrant, glowing gradients (Indigo to Violet to Cyan) for accent highlights and active elements.
    *   Thin border lines (`1px border-slate-800/80`) to partition components cleanly.
*   **Typography**: Clean, modern, high-contrast sans-serif pairing (e.g., **Outfit** or **Plus Jakarta Sans** for headers, and **Inter** for body text). High typographic contrast.
*   **Animations & Micro-interactions**: Smooth transitions (`transition-all duration-300 ease-out`), interactive cards that elevate and glow on hover, custom scrollbars, and button hover slide-glow effects.

### Color Tokens
*   **Background (Primary Dark)**: `slate-950` (#030712)
*   **Surface (Cards/Panels)**: `slate-900/50` (#0f172a with transparency)
*   **Accent Color (Main)**: `indigo-500` (#6366f1) -> `indigo-600` (#4f46e5) on hover
*   **Accent Glow**: Neon Indigo/Cyan gradient
*   **Text Main**: `slate-100` (#f8fafc)
*   **Text Muted/Secondary**: `slate-400` (#94a3b8)
*   **Borders**: `slate-800/80`

---

## 2. Shared Layout & Primitives (Layer 2 & 3)

### Global Layout Pieces
*   **Navbar (`components/layout/Navbar.tsx`)**:
    *   Glassmorphic floating navbar with backdrop blur (`bg-slate-950/75 backdrop-blur-md`).
    *   Thin border line at the bottom (`border-b border-slate-800/60`).
    *   Active links underlined with an indigo glow line.
    *   Primary CTA Button: Glowing outline with slide-over text transition.
    *   Mobile Navigation: Slips down smoothly from the top with full-bleed glass panel.
*   **Footer (`components/layout/Footer.tsx`)**:
    *   Monochromatic dark aesthetic. Multi-column layout for brand, company links, contact details, legal, and social icons.
    *   Social icons should glow on hover with the accent color.
*   **Section Wrapper (`components/ui/SectionWrapper.tsx`)**:
    *   Applies a uniform vertical padding (`py-20 md:py-28`) and layout container constraint (`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`).

### UI Primitives
*   **Button**: 
    *   `primary`: Glowing Indigo/Violet gradient with hover-to-slide overlay.
    *   `outline`: Minimal border with a subtle neon hover overlay.
    *   `ghost`: Slate text, turns indigo on hover.
*   **Card**: Glassmorphic panels with `bg-slate-900/40 backdrop-blur border border-slate-800/50 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all`.
*   **Badge**: Pill-shaped indicator with soft background and colorful border (e.g. `bg-indigo-500/10 text-indigo-400 border border-indigo-500/20`).

---

## 3. Page-wise Redesign Details

### 3.1. Home Page (`src/app/page.tsx`)
Create a captivating introductory experience.

*   **Hero Section (`sections/home/HeroSection.tsx`)**:
    *   **Layout**: Split 2-column or focused centered layout with a glowing background mesh gradient.
    *   **Left Column**: Eyebrow badge ("Now Launching v2.0"), bold giant h1 heading with gradient text, and primary/secondary CTAs.
    *   **Right Column**: An interactive mock glass terminal or data visualizer that pulses with network graph animations.
*   **Stats Section (`sections/home/StatsSection.tsx`)**:
    *   Grid of 4 high-impact metric counters. 
    *   Hovering over any stat scales the card up slightly, and the number shifts color with a subtle transition.
*   **Services Overview Section (`sections/home/ServicesOverviewSection.tsx`)**:
    *   Introductory header with "What We Do".
    *   A grid of 6 glassmorphic service cards, each displaying custom-themed icons that animate or light up on hover.
*   **Team Preview Section (`sections/home/TeamPreviewSection.tsx`)**:
    *   Grid showcasing 4 core leadership members with high-contrast grayscale portraits that transition to color on hover.
*   **Clients Section (`sections/home/ClientsSection.tsx`)**:
    *   An infinite horizontal marquee slider containing monochrome client logos. The logos glow slightly when hovered.
*   **CTA Banner Section (`sections/_shared/CTABannerSection.tsx`)**:
    *   A full-width, deep-gradient banner block with an asymmetric glass panel containing a bold call-to-action ("Ready to transform your brand?").

---

### 3.2. Services Page (`src/app/services/page.tsx`)
Deep dive into service offerings and capabilities.

*   **Services Hero Section (`sections/services/ServicesHeroSection.tsx`)**:
    *   Large clean title with glowing backlights, indicating technological precision.
*   **Services Grid Section (`sections/services/ServicesGridSection.tsx`)**:
    *   Large, robust service card components.
    *   Each card features a detailed list of features, interactive hover states, and dynamic expansion or link previews.
*   **Services In Action Section (`sections/services/ServicesInActionSection.tsx`)**:
    *   Horizontal showcase slider of mini case studies or services applied in real projects, linking directly to the Work page.

---

### 3.3. Work/Portfolio Page (`src/app/work/page.tsx`)
Showcase digital products and achievements.

*   **Work Hero Section (`sections/work/WorkHeroSection.tsx`)**:
    *   Minimalist typography, clean layout, emphasizing visual content.
*   **Projects Filter Section (`sections/work/ProjectsFilterSection.tsx`)**:
    *   Glassmorphic tab-bar navigation for categories (e.g. "All", "Web", "Mobile", "AI/ML"). Active states show a sliding capsule background indicator.
*   **Projects Grid Section (`sections/work/ProjectsGridSection.tsx`)**:
    *   A 3-column project showcase grid.
    *   Each project card uses a dark overlay on top of high-resolution mockups. Hovering zooms the image slightly, displaying project metadata (tags, title, description) and a custom arrow CTA icon.
*   **Case Study Section (`sections/work/CaseStudySection.tsx`)**:
    *   Featured showcase study section. Highlighting 3 key metrics (e.g. "+300% Engagement", "99.9% Uptime") in glowing stats pills alongside a mock dashboard visualization.
*   **Results Section (`sections/work/ResultsSection.tsx`)**:
    *   A pillar grid illustrating performance achievements and technology benchmarks.

---

### 3.4. About Page (`src/app/about/page.tsx`)
Tell the story, values, and vision of Catalyst Digital.

*   **About Hero Section (`sections/about/AboutHeroSection.tsx`)**:
    *   Atmospheric backdrop mesh lighting with clean corporate narrative copy.
*   **Timeline Section (`sections/about/TimelineSection.tsx`)**:
    *   Vertical timeline rail. Milestones alternate sides or light up as the user scrolls past.
*   **Team Section (`sections/about/TeamSection.tsx`)**:
    *   Filterable team grid with role badges, social cards, and interactive hover tooltips.
*   **Values Section (`sections/about/ValuesSection.tsx`)**:
    *   Grid of 3 core values (e.g. "Innovation", "Transparency", "Execution"). Uses high-contrast typography and subtle vector shapes.

---

### 3.5. Blog Page (`src/app/blog/page.tsx`)
A content-rich editorial feed.

*   **Blog Hero Section (`sections/blog/BlogHeroSection.tsx`)**:
    *   Features a centered minimal search bar with a glassmorphic frame and input highlight glow.
*   **Featured Post Section (`sections/blog/FeaturedPostSection.tsx`)**:
    *   A full-width showcase layout (large landscape banner image side-by-side with post information). Highlighted badge indicating "Featured".
*   **Posts Grid Section (`sections/blog/PostsGridSection.tsx`)**:
    *   Clean masonry or standard 3-column post grid. Author details and reading time badges are cleanly formatted.
*   **Blog Sidebar Section (`sections/blog/BlogSidebarSection.tsx`)**:
    *   Glass widgets on the side for tag clouds, search, newsletter subscription, and popular categories.

---

### 3.6. Contact Page (`src/app/contact/page.tsx`)
Conversion-focused, highly interactive page.

*   **Contact Hero Section (`sections/contact/ContactHeroSection.tsx`)**:
    *   Bold, clean header.
*   **Contact Form Section (`sections/contact/ContactFormSection.tsx`)**:
    *   Split-screen grid layout:
        *   **Left Column**: Minimalist client-oriented details (email, phone, address, and live status indicator: "Average response: Under 2 hours").
        *   **Right Column**: Highly-polished glass form inputs. Interactive validation states: border changes from indigo to emerald on success, or ruby on error.
*   **Office Section (`sections/contact/OfficeSection.tsx`)**:
    *   Dark vector-style map showing pins of global office locations with clean popup cards.
*   **FAQ Section (`sections/contact/FaqSection.tsx`)**:
    *   Accordion list of frequently asked questions. Accordions open with smooth height transition animations.
