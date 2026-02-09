#!/bin/bash

echo "🧪 Testing Module Federation Setup..."
echo ""

# Check if web app is running
echo "1. Checking Web App (Remote MFE) on port 5173..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "   ✅ Web app is running"
    
    # Check if remoteEntry.js exists
    if curl -s http://localhost:5173/remoteEntry.js > /dev/null; then
        echo "   ✅ remoteEntry.js is accessible"
    else
        echo "   ❌ remoteEntry.js not found - Module Federation won't work"
        exit 1
    fi
else
    echo "   ❌ Web app is not running on port 5173"
    echo "   Run: cd apps/web && bun run dev"
    exit 1
fi

echo ""
echo "2. Checking Host App on port 5001..."
if curl -s http://localhost:5001 > /dev/null; then
    echo "   ✅ Host app is running"
else
    echo "   ❌ Host app is not running on port 5001"
    echo "   Run: cd apps/host && bun run dev"
    exit 1
fi

echo ""
echo "3. Checking NATS Server on port 8080..."
if curl -s http://localhost:8222/varz > /dev/null 2>&1; then
    echo "   ✅ NATS server is running"
else
    echo "   ⚠️  NATS server is not running (optional)"
    echo "   App will work in mock mode"
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "🌐 Open: http://localhost:5001"
echo "📱 Click 'User Management (MFE)' to test federation"
