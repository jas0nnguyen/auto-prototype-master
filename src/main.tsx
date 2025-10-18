import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import '@sureapp/canary-design-system/global.css';
import './global.css';

console.log('CDL MCP Test with Vite is running!');

const appElement = document.getElementById('app');
if (appElement) {
  const root = ReactDOM.createRoot(appElement);
  root.render(<App />);
} else {
  console.error('App element not found');
} 