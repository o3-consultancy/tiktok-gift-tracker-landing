# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a professional landing page for **O3 TT Gifts**, a TikTok Live Stream Analytics SaaS platform. The landing page targets media agencies, brand managers, and content creators who need professional TikTok live stream analytics and gift tracking.

**Tech Stack**: Vue 3 + TypeScript + Vite + Tailwind CSS + Vue Router + Pinia

## Development Commands

### Start Development Server
```bash
npm run dev
```
Runs Vite dev server on http://localhost:5173

### Build for Production
```bash
npm run build
```
Runs TypeScript compiler (`vue-tsc`) first, then builds with Vite. Output goes to `dist/` directory.

### Preview Production Build
```bash
npm run preview
```
Locally preview the production build.

## Architecture

### Application Entry Point
- **index.html**: Root HTML file, includes Inter font from Google Fonts, sets up meta tags
- **src/main.ts**: Application bootstrapper - creates Vue app, initializes Pinia store and Vue Router, mounts app

### Routing Structure
Routes defined in `src/router/index.ts`:
- `/` - Home page (main landing page)
- `/contact` - Contact form page
- `/privacy-policy` - Privacy policy page
- `/terms-of-service` - Terms of service page
- `/cookie-policy` - Cookie policy page
- `/system-status` - System status page

Router uses `createWebHistory` and automatically scrolls to top on route navigation.

### Component Architecture

**Page-Level Components** (`src/views/`):
- `HomeView.vue` - Main landing page, composes all section components, includes sticky navigation with mobile menu
- `ContactView.vue` - Contact page
- `PrivacyPolicy.vue`, `TermsOfService.vue`, `CookiePolicy.vue` - Legal pages
- `SystemStatus.vue` - System status page

**Section Components** (`src/components/`):
The landing page is composed of modular sections:
- `HeroSection.vue` - Hero with headline and CTA
- `FeaturesSection.vue` - Platform features showcase
- `PricingSection.vue` - Three-tier pricing (Starter $30, Professional $80, Enterprise $230)
- `CTASection.vue` - Call-to-action with trust indicators
- `FooterSection.vue` - Footer with O3 Consultancy branding and legal links
- `CookieConsent.vue` - Cookie consent banner (rendered globally in App.vue)

**Navigation**: Sticky navigation in `HomeView.vue` includes smooth scrolling to sections via `scrollToSection()` helper function.

### Styling System

**Global Styles**: `src/style.css` imports Tailwind directives

**Tailwind Configuration** (`tailwind.config.js`):
- Custom color palette: `primary` (blue gradient), `dark` (slate colors)
- Font family: Inter (loaded from Google Fonts)
- Custom animations: `fade-in`, `slide-up`, `bounce-slow`
- Plugins: `@tailwindcss/forms`, `@tailwindcss/typography`

**Design Tokens**:
- Primary color: Blue gradient (#3b82f6 to #1e3a8a)
- Dark colors: Slate shades for text/backgrounds
- Accent: Yellow for highlights
- Font weights: 300-900 available

### Path Aliases
`@` alias points to `src/` directory (configured in `vite.config.ts`)

## Key Features & Patterns

### Smooth Scrolling Navigation
The `HomeView.vue` implements smooth scrolling to sections:
```typescript
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
  mobileMenuOpen.value = false
}
```

### Mobile Responsiveness
- Mobile-first design approach
- Responsive breakpoints: mobile (320-768px), tablet (768-1024px), desktop (1024px+)
- Mobile menu toggle in navigation

### Cookie Consent
`CookieConsent.vue` component is rendered globally in `App.vue`, appears on all pages.

## Assets & Branding

**Logo Files**:
- `src/assets/o3-tt-gifts-logo.svg` - Main O3 TT Gifts logo
- `src/assets/O3-logo.png` - O3 Consultancy logo
- `src/assets/favicon.svg` - Site favicon

**Favicon**: Both SVG and ICO versions served from `/public` directory

## Backend Directory

There is a `backend/` directory in the project root, but it appears to be a separate concern (possibly a Node.js backend). The landing page is a standalone frontend application.

## Important Notes

- **Node.js Version**: Requires Node.js 18+
- **TypeScript**: Full TypeScript support with strict type checking via `vue-tsc`
- **Build Output**: Production builds go to `dist/` directory
- **Font Loading**: Inter font is preconnected and preloaded for performance
- **Company Info**:
  - Email: support@o3-ttgifts.com
  - Phone: +971 4 258 2613
  - Website: o3-ttgifts.com

## Pricing Tiers
When updating pricing information, note the current structure:
- **Starter**: $30/month - 1 account, 5 gift groups
- **Professional**: $80/month (marked as "Most Popular") - 3 accounts, 15 gift groups
- **Enterprise**: $230/month - 20 accounts, 50 gift groups
