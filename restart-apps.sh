#!/bin/bash

echo "🔄 Restarting applications..."

# Kill existing processes
echo "Stopping existing processes..."
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:5001 | xargs kill -9 2>/dev/null

sleep 2

# echo "✅ Processes stopped"
# echo ""
# echo "📦 Building SDK..."
# cd packages/sdk && bun run build

# echo ""
# echo "🚀 Now run these commands in separate terminals:"
# echo ""
# echo "Terminal 1:"
# echo "  cd apps/web && bun run dev"
# echo ""
# echo "Terminal 2:"
# echo "  cd apps/host && bun run dev"
# echo ""
