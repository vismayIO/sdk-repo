#!/bin/bash

# 🚀 Complete Setup Script for Module Federation + NATS

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Module Federation + NATS Setup                            ║"
echo "║  Host: localhost:5001 | Remote MFE: localhost:5173         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1/4: Installing dependencies..."
bun install
echo "✅ Dependencies installed"
echo ""

# Step 2: Build SDK
echo "🔨 Step 2/4: Building SDK package..."
cd packages/sdk
bun run build
cd ../..
echo "✅ SDK built successfully"
echo ""

# Step 3: Check NATS (optional)
echo "🔍 Step 3/4: Checking NATS server..."
if curl -s http://localhost:8222/varz > /dev/null 2>&1; then
    echo "✅ NATS server is running on port 8080"
else
    echo "⚠️  NATS server not detected (optional)"
    echo "   To start NATS:"
    echo "   docker run -p 4222:4222 -p 8222:8222 -p 8080:8080 \\"
    echo "     --name nats nats:latest -c /dev/null --websocket"
    echo ""
    echo "   App will work in mock mode without NATS"
fi
echo ""

# Step 4: Instructions
echo "🎯 Step 4/4: Ready to start!"
echo ""
echo "Open 2 terminals and run:"
echo ""
echo "┌─────────────────────────────────────────────────────────┐"
echo "│ Terminal 1: Web App (Remote MFE)                        │"
echo "│ $ cd apps/web && bun run dev                            │"
echo "│ → http://localhost:5173                                 │"
echo "└─────────────────────────────────────────────────────────┘"
echo ""
echo "┌─────────────────────────────────────────────────────────┐"
echo "│ Terminal 2: Host App                                    │"
echo "│ $ cd apps/host && bun run dev                           │"
echo "│ → http://localhost:5001                                 │"
echo "└─────────────────────────────────────────────────────────┘"
echo ""
echo "Then open: http://localhost:5001"
echo ""
echo "📖 Documentation:"
echo "   - START.md    - Quick start guide"
echo "   - SUMMARY.md  - Architecture overview"
echo "   - FIXES.md    - Technical details"
echo ""
echo "🧪 Test setup: ./test-federation.sh"
echo ""
