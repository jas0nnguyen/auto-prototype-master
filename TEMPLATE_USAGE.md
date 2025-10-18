# Template Usage Guide

This repository is a GitHub template for creating new Canary Design System applications.

## Creating a New Project

### Method 1: Using GitHub UI
1. Click "Use this template" button on the repository page
2. Choose "Create a new repository"
3. Fill in your repository name and settings
4. Click "Create repository"

### Method 2: Using GitHub CLI
```bash
gh repo create my-new-project --template sureapp/cdl-prototype-template
```

## Post-Creation Setup

After creating your repository from this template:

1. **Clone your new repository:**
   ```bash
   git clone https://github.com/yourusername/your-new-project.git
   cd your-new-project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update project details:**
   - Edit `package.json` to update the `name` and `description` fields
   - Update the README.md title and description
   - Replace placeholder content in your components

4. **Set up Vercel deployment (optional):**
   - Follow the [VERCEL_SETUP.md](./VERCEL_SETUP.md) guide
   - Set up your `GITHUB_TOKEN` environment variable

## What's Included

- ✅ **React 18** with TypeScript
- ✅ **Vite** build tool and dev server
- ✅ **React Router** for client-side routing
- ✅ **Canary Design System** components
- ✅ **Vercel deployment** configuration
- ✅ **GitHub package access** setup scripts
- ✅ **TipTap version compatibility** fixes
- ✅ **CommonJS/ESM compatibility** fixes

## Quick Start

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Development

- Edit `src/HomePage.tsx` to customize your landing page
- Add new pages by creating components and adding routes to `App.tsx`
- Use Canary Design System components from `@sureapp/canary-design-system`

## Support

For issues with the template itself, please create an issue in the template repository.
For application-specific issues, refer to the main README.md and documentation. 