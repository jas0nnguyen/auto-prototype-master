#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Setting up .npmrc for GitHub package access...');

// Check if GITHUB_TOKEN environment variable exists
if (!process.env.GITHUB_TOKEN) {
    console.error('Error: GITHUB_TOKEN environment variable is not set');
    process.exit(1);
}

// Create .npmrc content
const npmrcContent = `@sureapp:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${process.env.GITHUB_TOKEN}
`;

// Write .npmrc file to project root
const npmrcPath = path.join(process.cwd(), '.npmrc');

try {
    fs.writeFileSync(npmrcPath, npmrcContent);
    console.log('✅ .npmrc file created successfully');
    console.log('GitHub registry configured for @sureapp packages');
} catch (error) {
    console.error('Error creating .npmrc file:', error.message);
    process.exit(1);
} 