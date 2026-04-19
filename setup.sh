#!/bin/bash
# EV of Nee? — Bootstrap script
# Gebruik: bash setup.sh
# Vereist: Node.js + npm geïnstalleerd

set -e

echo "🚗⚡ EV of Nee? — Project setup"
echo "================================"

# Check node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js niet gevonden. Installeer Node via nvm (zie README)."
  exit 1
fi

echo "✅ Node $(node --version) gevonden"

# Installeer dependencies
echo ""
echo "📦 Dependencies installeren..."
npm install

echo ""
echo "✅ Klaar! Start de dev server met:"
echo ""
echo "   npm run dev"
echo ""
echo "Open dan http://localhost:5173 in je browser."
