#!/bin/bash

# Start both frontend and backend development servers
# Usage: ./start-dev.sh

echo "🚀 Starting development servers..."
echo ""

# Start frontend in background
echo "📦 Starting frontend (Vite) on http://localhost:5173..."
npm run dev &
FRONTEND_PID=$!

# Wait a moment
sleep 2

# Start backend in background
echo "🔧 Starting backend (NestJS) on http://localhost:3000..."
cd backend && npm run start:dev &
BACKEND_PID=$!

echo ""
echo "✅ Servers starting..."
echo "   Frontend PID: $FRONTEND_PID"
echo "   Backend PID: $BACKEND_PID"
echo ""
echo "📍 Access points:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3000"
echo "   Documents Page: http://localhost:5173/portal/DZQV87Z4FH/documents"
echo ""
echo "⏹️  To stop both servers: kill $FRONTEND_PID $BACKEND_PID"
echo ""

# Wait for both processes
wait
