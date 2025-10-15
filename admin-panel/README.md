# O3 TT Gifts Admin Panel

Admin panel for managing the O3 TT Gifts TikTok Live Stream Analytics platform.

## Overview

This is a separate Vue 3 + TypeScript application for administrative tasks including:
- User management
- TikTok account management (assign live stream URLs)
- Analytics dashboard
- Admin authentication with Firebase

## Tech Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Type Safety**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 (with @tailwindcss/postcss)
- **State Management**: Pinia
- **Routing**: Vue Router with authentication guards
- **Authentication**: Firebase Auth (same as main app)
- **HTTP Client**: Axios

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## Deployment

Build creates `dist/` directory to be deployed to **admin.o3-ttgifts.com**

See [../ADMIN_PANEL_SETUP.md](../ADMIN_PANEL_SETUP.md) for full deployment instructions.
