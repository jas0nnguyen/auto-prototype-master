# Vercel Deployment Setup

This document explains how to configure Vercel to access private GitHub packages from the `@sureapp` organization.

## Prerequisites

- A GitHub Personal Access Token with `read:packages` permission
- Access to the Vercel project settings

## Setup Steps

### 1. Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select the following scopes:
   - `read:packages` (to read packages from GitHub Package Registry)
   - `repo` (if your packages are in private repositories)
4. Copy the generated token

### 2. Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add a new environment variable:
   - **Name**: `GITHUB_TOKEN`
   - **Value**: Your GitHub Personal Access Token
   - **Environments**: Select all environments (Production, Preview, Development)

### 3. Configure Build Commands

In your Vercel project settings, configure the build commands:

**Option A: Using Build Command Override**
```bash
npm run setup-npmrc && npm run build
```

**Option B: Using Install Command Override**
```bash
node scripts/setup-npmrc.js && npm install
```

### 4. Alternative: Manual Script Execution

If you prefer to run the script manually, you can use either:

**Bash script:**
```bash
./scripts/setup-npmrc.sh
```

**Node.js script:**
```bash
node scripts/setup-npmrc.js
```

## How It Works

The setup script creates a `.npmrc` file in the project root with the following configuration:

```
@sureapp:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

This tells npm to:
1. Use GitHub Package Registry for `@sureapp` scoped packages
2. Authenticate using the provided GitHub token

## Troubleshooting

### Build fails with "GITHUB_TOKEN environment variable is not set"
- Ensure you've added the `GITHUB_TOKEN` environment variable in Vercel settings
- Verify the token has the correct permissions (`read:packages`)

### Build fails with "401 Unauthorized"
- Check if your GitHub token has expired
- Verify the token has access to the `@sureapp` organization
- Ensure the token has `read:packages` permission

### Build fails with "404 Not Found"
- Verify the package name and version in package.json
- Check if the package exists in the GitHub Package Registry
- Ensure your token has access to the repository containing the package 