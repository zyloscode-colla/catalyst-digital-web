-- ==============================================================================
-- Catalyst Digital - Enterprise Supabase PostgreSQL Schema & Seed Migration
-- Production Grade Content Management System (CMS)
-- Compatible with Supabase PostgreSQL 15+
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean Existing Schema (if rerun)
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS contact_inquiries CASCADE;
DROP TABLE IF EXISTS key_metrics CASCADE;
DROP TABLE IF EXISTS featured_case_study CASCADE;
DROP TABLE IF EXISTS work_results CASCADE;
DROP TABLE IF EXISTS service_cases CASCADE;
DROP TABLE IF EXISTS core_values CASCADE;
DROP TABLE IF EXISTS timeline_milestones CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS section_configs CASCADE;
DROP TABLE IF EXISTS pages_config CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;

-- ==============================================================================
-- 3. Core System & Settings Tables
-- ==============================================================================

-- Global Site Configuration & Maintenance Mode
CREATE TABLE site_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    site_name VARCHAR(255) NOT NULL DEFAULT 'Catalyst Digital',
    tagline TEXT NOT NULL DEFAULT 'A Software Development Studio building practical, scalable solutions for real operational challenges.',
    primary_email VARCHAR(255) NOT NULL DEFAULT 'ceo@catalystdigitals.com',
    support_email VARCHAR(255) NOT NULL DEFAULT 'hceo@catalystdigitals.com',
    phone VARCHAR(100) NOT NULL DEFAULT '+94 72 280 0104',
    headquarters VARCHAR(255) NOT NULL DEFAULT 'Colombo, Sri Lanka',
    office_address_1 VARCHAR(255) NOT NULL DEFAULT 'Colombo',
    office_address_2 VARCHAR(255) NOT NULL DEFAULT 'Sri Lanka',
    linkedin_url VARCHAR(500) NOT NULL DEFAULT 'https://www.linkedin.com/company/catalyst-digital',
    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    maintenance_title VARCHAR(255) NOT NULL DEFAULT 'Platform Under Scheduled Maintenance',
    maintenance_message TEXT NOT NULL DEFAULT 'We are deploying performance enhancements and updates. Our team will be back online shortly.',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Public Page Configuration (Enables entire page activation / deactivation)
CREATE TABLE pages_config (
    slug VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    offline_message TEXT DEFAULT 'This section is currently being updated. Please check back soon.',
    meta_description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Section Configuration (Enables individual section toggling and headline editing)
CREATE TABLE section_configs (
    id VARCHAR(100) PRIMARY KEY,
    page_slug VARCHAR(100) NOT NULL REFERENCES pages_config(slug) ON DELETE CASCADE,
    section_key VARCHAR(100) NOT NULL,
    section_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    eyebrow VARCHAR(255),
    heading TEXT,
    subheading TEXT,
    content_json JSONB DEFAULT '{}'::jsonb,
    display_order INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- 4. Content Domain Tables
-- ==============================================================================

-- Services Catalog
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100) NOT NULL DEFAULT 'Code2',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Projects / Case Studies
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    image VARCHAR(500) NOT NULL DEFAULT '/images/work/placeholder.jpg',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Leadership & Team Members
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    image VARCHAR(1000) NOT NULL,
    linkedin VARCHAR(500) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Blog Posts & Insights
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT,
    author VARCHAR(255) NOT NULL DEFAULT 'Catalyst Digital Team',
    date VARCHAR(100) NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    cover_image VARCHAR(500) DEFAULT '/images/blog/cover.jpg',
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Frequently Asked Questions (FAQ)
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Historical Milestones / Timeline
CREATE TABLE timeline_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Core Values
CREATE TABLE core_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Service In Action Case Snapshots
CREATE TABLE service_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    result_tag VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Work Results Pillars
CREATE TABLE work_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Quantitative Key Metrics
CREATE TABLE key_metrics (
    id VARCHAR(100) PRIMARY KEY,
    context VARCHAR(50) NOT NULL, -- 'home' or 'about'
    label VARCHAR(255) NOT NULL,
    value INT NOT NULL,
    suffix VARCHAR(20) DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Featured Case Study Spotlight (Work Page)
CREATE TABLE featured_case_study (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'primary',
    eyebrow VARCHAR(255) NOT NULL DEFAULT 'Featured transformation',
    title VARCHAR(255) NOT NULL DEFAULT 'Revolutionizing LogiCore Global Infrastructure',
    description TEXT NOT NULL DEFAULT 'We redesigned the backbone of a multi-region platform to improve reliability, delivery speed, and global operational visibility.',
    image VARCHAR(500) NOT NULL DEFAULT '/images/work/logicore.jpg',
    cta_href VARCHAR(500) NOT NULL DEFAULT '/work/logicore-global-infrastructure',
    metric_1_label VARCHAR(100) NOT NULL DEFAULT 'Efficiency Increase',
    metric_1_value VARCHAR(100) NOT NULL DEFAULT '40%',
    metric_2_label VARCHAR(100) NOT NULL DEFAULT 'Platform Uptime',
    metric_2_value VARCHAR(100) NOT NULL DEFAULT '99.99%',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Contact Inquiries Inbox
CREATE TABLE contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'new', -- 'new', 'in_review', 'contacted', 'archived'
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- 5. Role-Based Access Control (RBAC) & Admin Users
-- ==============================================================================

CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE permissions (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE role_permissions (
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(100) REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE RESTRICT DEFAULT 'editor',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- ==============================================================================
-- 6. Indexes for High-Performance Queries
-- ==============================================================================

CREATE INDEX idx_services_active_order ON services(is_active, display_order);
CREATE INDEX idx_projects_active_order ON projects(is_active, display_order);
CREATE INDEX idx_team_active_order ON team_members(is_active, display_order);
CREATE INDEX idx_blog_published_date ON blog_posts(is_published, created_at DESC);
CREATE INDEX idx_faqs_active_order ON faqs(is_active, display_order);
CREATE INDEX idx_inquiries_status_created ON contact_inquiries(status, created_at DESC);
CREATE INDEX idx_section_configs_page ON section_configs(page_slug, display_order);

-- ==============================================================================
-- 7. Seed Initial Data (Matching 100% of Current Site Content)
-- ==============================================================================

-- Site Settings
INSERT INTO site_settings (id, site_name, tagline, primary_email, support_email, phone, headquarters, office_address_1, office_address_2, linkedin_url, maintenance_mode)
VALUES (
    'default',
    'Catalyst Digital',
    'A Software Development Studio building practical, scalable solutions for real operational challenges.',
    'ceo@catalystdigitals.com',
    'hceo@catalystdigitals.com',
    '+94 72 280 0104',
    'Colombo, Sri Lanka',
    'Colombo',
    'Sri Lanka',
    'https://www.linkedin.com/company/catalyst-digital',
    FALSE
);

-- Pages Config
INSERT INTO pages_config (slug, title, is_active, display_order, meta_description) VALUES
('home', 'Home', TRUE, 1, 'Catalyst Digital - Build reliable digital experiences with cross-functional product engineering teams.'),
('services', 'Services', TRUE, 2, 'Explore core services across product engineering, UI/UX design, cloud devops, and AI solutions.'),
('work', 'Work', TRUE, 3, 'Proven impact in action through real-world software transformations and scalable platforms.'),
('about', 'About', TRUE, 4, 'Learn about Catalyst Digital, our journey, senior team, and core values.'),
('blog', 'Blog', TRUE, 5, 'Insights, patterns, and lessons from modern software engineering and digital delivery.'),
('contact', 'Contact', TRUE, 6, 'Get in touch with Catalyst Digital to discuss your digital product and engineering needs.');

-- Section Configs
INSERT INTO section_configs (id, page_slug, section_key, section_name, is_active, eyebrow, heading, subheading, display_order) VALUES
('home_hero', 'home', 'hero', 'Hero Section', TRUE, 'Digital product partner', 'Build reliable digital experiences with Catalyst Digital', 'A Software Development Studio building practical, scalable solutions for real operational challenges.', 1),
('home_stats', 'home', 'stats', 'Key Metrics', TRUE, NULL, NULL, NULL, 2),
('home_services', 'home', 'services', 'Services Overview', TRUE, 'Services', 'Cross-functional teams to ship faster', 'From strategy to scale, we bring product, design, and engineering under one delivery model.', 3),
('home_team', 'home', 'team', 'Team Preview', TRUE, 'Our Team', 'Senior specialists focused on outcomes', 'Work directly with strategists, designers, and engineers who stay close to your product goals.', 4),
('home_clients', 'home', 'clients', 'Tech Stack Strip', TRUE, NULL, 'TECH STACK WE WORK WITH', NULL, 5),
('home_cta', 'home', 'cta', 'Call to Action Banner', TRUE, 'Ready to build?', 'Let''s launch your next digital product with confidence.', 'Tell us what you are building, where you are blocked, and the momentum you need next.', 6),

('services_hero', 'services', 'services_hero', 'Services Hero', TRUE, 'Our Expertise', 'Scalable solutions for modern enterprises', 'We combine deep technical expertise with strategic thinking to build software that works at scale. Explore our core service offerings.', 1),
('services_grid', 'services', 'services_grid', 'Services Catalog Grid', TRUE, NULL, NULL, NULL, 2),
('services_in_action', 'services', 'services_in_action', 'Services in Action', TRUE, 'Case Snapshots', 'Services in action', 'See how we apply these capabilities to solve real-world challenges for growth-stage teams.', 3),
('services_cta', 'services', 'cta', 'Services CTA Banner', TRUE, 'Ready to build?', 'Let''s launch your next digital product with confidence.', 'Tell us what you are building, where you are blocked, and the momentum you need next.', 4),

('work_hero', 'work', 'work_hero', 'Work Hero', TRUE, 'Case Studies', 'Our impact in action', 'We do not just ship code. We solve business challenges with engineering excellence and measurable outcomes.', 1),
('work_filters', 'work', 'work_filters', 'Projects Filter Bar', TRUE, NULL, NULL, NULL, 2),
('work_grid', 'work', 'work_grid', 'Projects Grid', TRUE, NULL, NULL, NULL, 3),
('work_case_study', 'work', 'work_case_study', 'Featured Case Study', TRUE, 'Featured transformation', 'Revolutionizing LogiCore Global Infrastructure', 'We redesigned the backbone of a multi-region platform to improve reliability, delivery speed, and global operational visibility.', 4),
('work_results', 'work', 'work_results', 'Engineering Results Pillars', TRUE, NULL, NULL, NULL, 5),
('work_cta', 'work', 'cta', 'Work CTA Banner', TRUE, 'Ready to build?', 'Let''s launch your next digital product with confidence.', 'Tell us what you are building, where you are blocked, and the momentum you need next.', 6),

('about_hero', 'about', 'about_hero', 'About Hero', TRUE, 'Who We Are', 'Empowering businesses through purpose-built technology.', 'We are Catalyst Digital, a product and engineering partner that helps teams move from ideas to measurable outcomes with confidence.', 1),
('about_journey', 'about', 'timeline', 'Our Journey / Timeline', TRUE, NULL, 'Our journey', 'How we evolved from a focused team into a trusted product partner.', 2),
('about_team', 'about', 'team', 'Leadership Team Showcase', TRUE, 'Team', 'The minds behind the mission', 'Cross-functional experts in strategy, design, and engineering, aligned around meaningful outcomes.', 3),
('about_values', 'about', 'values', 'Core Values', TRUE, NULL, 'Our core values', 'Principles that shape how we build, collaborate, and make decisions every day.', 4),
('about_stats', 'about', 'stats', 'About Achievements Stats', TRUE, NULL, NULL, NULL, 5),
('about_cta', 'about', 'cta', 'About CTA Banner', TRUE, 'Ready to build?', 'Let''s launch your next digital product with confidence.', 'Tell us what you are building, where you are blocked, and the momentum you need next.', 6),

('blog_hero', 'blog', 'blog_hero', 'Blog Hero', TRUE, 'Latest Updates', 'Our insights', 'Thoughts, patterns, and lessons from our work across design, engineering, and digital delivery.', 1),
('blog_featured', 'blog', 'blog_featured', 'Featured Post Slot', TRUE, NULL, 'Featured post', NULL, 2),
('blog_grid', 'blog', 'blog_grid', 'Recent Articles Grid', TRUE, NULL, 'Recent articles', NULL, 3),
('blog_sidebar', 'blog', 'blog_sidebar', 'Blog Sidebar Widgets', TRUE, NULL, NULL, NULL, 4),
('blog_load_more', 'blog', 'load_more', 'Pagination Section', TRUE, NULL, NULL, NULL, 5),
('blog_cta', 'blog', 'cta', 'Blog CTA Banner', TRUE, 'Ready to build?', 'Let''s launch your next digital product with confidence.', 'Tell us what you are building, where you are blocked, and the momentum you need next.', 6),

('contact_hero', 'contact', 'contact_hero', 'Contact Hero', TRUE, 'Get in touch', 'Let''s turn your vision into reality.', 'Have a complex problem or a bold idea? Our experts are ready to jump in and start building.', 1),
('contact_form', 'contact', 'contact_form', 'Inbound Message Form', TRUE, NULL, 'Send us a message', 'Share your goals. We usually reply within one business day.', 2),
('contact_details', 'contact', 'contact_details', 'Direct Contact Details', TRUE, NULL, 'Contact Details', NULL, 3),
('contact_office', 'contact', 'contact_office', 'Physical Office Presence', TRUE, NULL, 'Find us', NULL, 4),
('contact_trust', 'contact', 'contact_trust', 'Client Trust Badge', TRUE, NULL, 'Trusted by 200+ companies', 'From high-growth startups to Fortune 500 enterprises.', 5),
('contact_faq', 'contact', 'faq', 'Common Questions (FAQ)', TRUE, NULL, 'Common questions', 'Everything you need to know before working with us.', 6);

-- Services
INSERT INTO services (slug, title, description, icon, display_order) VALUES
('product-engineering', 'Product Engineering', 'Design and build resilient web products with modern architecture and clean delivery loops.', 'Code2', 1),
('ui-ux-design', 'UI/UX Design', 'Craft intuitive interfaces and design systems that improve conversion and reduce user friction.', 'Palette', 2),
('cloud-devops', 'Cloud & DevOps', 'Automate infrastructure, deployments, and observability to keep platforms fast and stable.', 'Cloud', 3),
('data-ai-solutions', 'Data & AI Solutions', 'Turn business data into decisions with analytics pipelines, dashboards, and applied AI workflows.', 'Bot', 4),
('qa-automation', 'QA Automation', 'Scale testing with reliable automation suites that catch regressions before customers do.', 'ShieldCheck', 5),
('growth-optimization', 'Growth Optimization', 'Improve funnel performance through experimentation, technical SEO, and conversion-focused updates.', 'TrendingUp', 6);

-- Projects
INSERT INTO projects (slug, title, description, tags, image, display_order) VALUES
('finstream-wealth-platform', 'FinStream: AI-powered Wealth Platform', 'Portfolio forecasting and automated advisory workflows for modern investment teams.', ARRAY['AI', 'Web'], '/images/work/finstream.jpg', 1),
('ecodrive-logistics-optimization', 'EcoDrive: Global Logistics Optimization', 'Operational intelligence for cross-region fleet planning and route efficiency.', ARRAY['Cloud', 'Data'], '/images/work/ecodrive.jpg', 2),
('healthsync-patient-portal', 'HealthSync: Interoperable Patient Portal', 'Secure care coordination experience with unified records and messaging flows.', ARRAY['Mobile', 'Security'], '/images/work/healthsync.jpg', 3),
('nexa-commerce-enterprise-eshop', 'Nexa Commerce: Enterprise E-shop', 'High-throughput commerce platform with optimized checkout and catalog pipelines.', ARRAY['Web', 'API'], '/images/work/nexcommerce.jpg', 4),
('datavault-ledger-security', 'DataVault: Distributed Ledger Security', 'Tamper-resistant audit rails and trust infrastructure for regulated operations.', ARRAY['Blockchain', 'Security'], '/images/work/datavault.jpg', 5),
('aura-creative-portfolio', 'Aura: Creative Portfolio Experience', 'Content-first digital platform with interactive storytelling and fast delivery.', ARRAY['Design', 'Web'], '/images/work/aura.jpg', 6);

-- Team Members
INSERT INTO team_members (name, role, image, linkedin, display_order) VALUES
('Ashoka Jayasinghe', 'CEO & Co-founder', 'https://media.licdn.com/dms/image/v2/C5103AQE0c9drmB6x3Q/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1531893469759?e=2147483647&v=beta&t=FWCjtqz5l7dbDzhSHsHgjF2rfM_S90yg7SW2e30BHaU', 'https://www.linkedin.com/in/ashoka-jayasinghe-89b4b5258/', 1),
('Aruna Jalath', 'CTO & Co-founder', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80', 'https://www.linkedin.com/in/aruna-jalath-7a41a363/?originalSubdomain=lk', 2),
('ZylosCode', 'CDO & Co-founder', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80', 'https://www.linkedin.com/in/zylos-code-069408403/', 3),
('Thilini Karunaratne', 'COO', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80', 'https://www.linkedin.com/in/thilini-karunaratne-857895362/?originalSubdomain=lk', 4);

-- FAQs
INSERT INTO faqs (question, answer, display_order) VALUES
('What is your typical project timeline?', 'Most projects launch between 6 to 12 weeks depending on scope. We define milestones early and share weekly progress.', 1),
('How do you handle project pricing?', 'We use scoped delivery plans with transparent estimates. Engagements can be fixed-scope, retainer, or phased delivery.', 2),
('What technologies do you specialize in?', 'Our teams work across modern web platforms, cloud infrastructure, automation, and AI-enabled product workflows.', 3),
('Do you offer post-launch support?', 'Yes. We provide monitoring, maintenance, optimization, and roadmap support after launch based on your needs.', 4);

-- Timeline Milestones
INSERT INTO timeline_milestones (year, title, description, display_order) VALUES
('2018', 'Founded with a Product-first Vision', 'We started as a small engineering team focused on solving difficult business problems with clarity.', 1),
('2020', 'Expanded to Global Delivery', 'Our remote-first model allowed us to deliver cross-border projects with faster feedback loops.', 2),
('2022', 'Scaled Multi-domain Expertise', 'We broadened capabilities across cloud, data, and product design for enterprise clients.', 3),
('2025', 'AI-native Product Delivery', 'We integrated AI-driven workflows into our process to speed up decisions and delivery quality.', 4);

-- Core Values
INSERT INTO core_values (title, description, display_order) VALUES
('Ownership', 'We treat every product challenge as our own and stay accountable from discovery to delivery.', 1),
('Clarity', 'We simplify complexity through strong communication, structured thinking, and transparent process.', 2),
('Integrity', 'We prioritize long-term trust over short-term wins in both technical decisions and partnerships.', 3);

-- Service In Action Cases
INSERT INTO service_cases (category, title, result_tag, display_order) VALUES
('Web Dev', 'Real-time Portfolio Tracker', '40% faster insights', 1),
('Mobile', 'Patient Monitoring App', '95% less latency', 2),
('Cloud', 'Automated Supply Hub', '67% cost reduction', 3),
('AI', 'Predictive Inventory', '32% efficiency gain', 4);

-- Work Results
INSERT INTO work_results (title, description, display_order) VALUES
('Clean Architecture', 'Maintainable system boundaries that reduce long-term complexity and change cost.', 1),
('Performance First', 'Measured optimization across rendering, delivery, and runtime bottlenecks.', 2),
('Data-driven Results', 'Product decisions guided by instrumentation, experiments, and business KPIs.', 3);

-- Key Metrics
INSERT INTO key_metrics (id, context, label, value, suffix, display_order) VALUES
('home_projects', 'home', 'Projects Delivered', 120, '+', 1),
('home_clients', 'home', 'Clients Supported', 65, '+', 2),
('home_retention', 'home', 'Client Retention', 96, '%', 3),
('home_experience', 'home', 'Years of Experience', 8, '+', 4),
('about_projects', 'about', 'Projects', 150, '+', 1),
('about_hours', 'about', 'Build Hours', 45, 'k', 2),
('about_team', 'about', 'Team Members', 12, '+', 3),
('about_satisfaction', 'about', 'Client Satisfaction', 98, '%', 4);

-- Roles
INSERT INTO roles (id, name, description) VALUES
('super_admin', 'Super Administrator', 'Unrestricted administrative access to all content, maintenance controls, settings, and user permissions.'),
('content_admin', 'Content Administrator', 'Can manage and publish all domain content, sections, and customer inquiries, but cannot alter system settings or users.'),
('editor', 'Content Editor', 'Can add and modify services, projects, blog articles, and FAQs.'),
('viewer', 'Auditor / Viewer', 'Read-only administrative visibility across all CMS sections.');

-- Permissions
INSERT INTO permissions (id, name, category, description) VALUES
('pages:manage', 'Manage Page Status', 'System', 'Toggle public pages active or inactive, updating offline messages.'),
('sections:manage', 'Manage Sections', 'System', 'Toggle individual section visibility and customize section copy.'),
('maintenance:manage', 'Manage Maintenance Mode', 'System', 'Activate or deactivate platform-wide maintenance mode.'),
('settings:manage', 'Manage Site Settings', 'System', 'Modify brand details, official emails, phone, and headquarters.'),
('users:manage', 'Manage Users & Permissions', 'Security', 'Create administrators, assign roles, and inspect access permissions.'),
('services:manage', 'Manage Services', 'Content', 'Create, update, reorder, and delete service catalog items.'),
('projects:manage', 'Manage Projects', 'Content', 'Create, update, and delete portfolio case studies.'),
('team:manage', 'Manage Team', 'Content', 'Add and update executive leadership and staff profiles.'),
('blog:manage', 'Manage Blog', 'Content', 'Draft, publish, edit, and feature blog posts.'),
('faqs:manage', 'Manage FAQs', 'Content', 'Add, update, and reorder accordion FAQs.'),
('inquiries:read', 'View Inquiries', 'Communication', 'View inbound messages from prospective clients.'),
('inquiries:manage', 'Manage Inquiries', 'Communication', 'Update contact inquiry workflow statuses and notes.');

-- Role Permissions Mapping
-- Super Admin: ALL
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'super_admin', id FROM permissions;

-- Content Admin: All except maintenance:manage, settings:manage, users:manage
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'content_admin', id FROM permissions
WHERE id NOT IN ('maintenance:manage', 'settings:manage', 'users:manage');

-- Editor: Only services, projects, team, blog, faqs, inquiries:read
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'editor', id FROM permissions
WHERE id IN ('services:manage', 'projects:manage', 'team:manage', 'blog:manage', 'faqs:manage', 'inquiries:read');

-- Viewer: Only inquiries:read
INSERT INTO role_permissions (role_id, permission_id)
VALUES ('viewer', 'inquiries:read');

-- Default Admin Users (Password for all demo accounts: "Admin123!" hash: sha256 or bcrypt)
-- Note: In production Supabase Auth, authentication links to auth.users.
INSERT INTO admin_users (email, password_hash, full_name, role_id) VALUES
('superadmin@catalystdigital.com', 'scrypt:admin123', 'Chief Executive Officer', 'super_admin'),
('content@catalystdigital.com', 'scrypt:admin123', 'Content Director', 'content_admin'),
('editor@catalystdigital.com', 'scrypt:admin123', 'Staff Editor', 'editor'),
('auditor@catalystdigital.com', 'scrypt:admin123', 'Compliance Auditor', 'viewer');

-- ==============================================================================
-- 8. Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_case_study ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Public Read Policies for Active Content
CREATE POLICY "Public can view active settings" ON site_settings FOR SELECT USING (TRUE);
CREATE POLICY "Public can view active pages" ON pages_config FOR SELECT USING (TRUE);
CREATE POLICY "Public can view active sections" ON section_configs FOR SELECT USING (TRUE);
CREATE POLICY "Public can view active services" ON services FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active projects" ON projects FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active team" ON team_members FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view published blogs" ON blog_posts FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public can view active faqs" ON faqs FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active milestones" ON timeline_milestones FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active values" ON core_values FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active service cases" ON service_cases FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active work results" ON work_results FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active metrics" ON key_metrics FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view featured study" ON featured_case_study FOR SELECT USING (TRUE);

-- Public Contact Form Insertion
CREATE POLICY "Public can submit contact inquiries" ON contact_inquiries FOR INSERT WITH CHECK (TRUE);

-- Service Role / Admin Read/Write (Bypassed by SUPABASE_SERVICE_ROLE_KEY)
-- For standard user sessions, you can grant authenticated users:
CREATE POLICY "Authenticated admins have full access to all tables" ON site_settings FOR ALL TO authenticated USING (TRUE);
