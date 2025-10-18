# Canary App Template

A bare bones React application template built with the Canary Design System for rapid prototyping.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173` to see your app.

## Template Structure

```
src/
├── App.tsx          # Main app component with routing
├── HomePage.tsx     # Simple homepage template
├── main.tsx         # Application entry point
├── global.css       # Global styles
└── components/      # Add your custom components here
```

## Built With

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Canary Design System** - UI components and styling

## Using the Template

### Adding New Pages

1. Create a new component in `src/` (e.g., `AboutPage.tsx`)
2. Add the route to `src/App.tsx`:
   ```tsx
   <Route path="/about" element={<AboutPage />} />
   ```

### Using Canary Components

Import components from the design system:
```tsx
import { Button, Title, Text, Layout } from '@sureapp/canary-design-system';
```

All components follow the design system patterns and don't require custom CSS.

### Global Styling

- The Canary Design System provides all styling
- Global CSS is minimal and only sets basic layout
- Avoid custom CSS - use design system components and props instead

## Development

- Components auto-reload on changes
- TypeScript provides type checking
- All Canary Design System components are available

Start building your prototype by editing `src/HomePage.tsx`!

## Deployment

### Vercel Deployment

This template is configured for easy deployment to Vercel with GitHub package access.

1. **Set up GitHub token:**
   - See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for detailed instructions
   - You'll need a GitHub Personal Access Token with `read:packages` permission

2. **Deploy to Vercel:**
   - Connect your repository to Vercel
   - Add your `GITHUB_TOKEN` environment variable
   - The template is pre-configured with proper build commands

3. **Build locally:**
   ```bash
   npm run build
   npm run preview
   ```

### Configuration Files

- `vercel.json` - Vercel deployment configuration
- `scripts/setup-npmrc.js` - GitHub package access setup
- `vite.config.ts` - Vite build configuration optimized for Canary Design System

## Package Management

This template uses npm and is configured to work with private GitHub packages:

- **Dependencies**: Standard npm packages
- **Private packages**: `@sureapp/canary-design-system` from GitHub Package Registry
- **Build scripts**: Automated `.npmrc` setup for CI/CD

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run setup-npmrc` - Set up GitHub package access (for CI/CD) 