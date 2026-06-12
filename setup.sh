#!/bin/bash
# Flash Token System - Setup Script

set -e

echo "🚀 Flash Token System - Setup"
echo "=============================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+"
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi

echo "✅ npm $(npm --version) found"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install
echo "✅ Root dependencies installed"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo "✅ Frontend dependencies installed"
echo ""

# Check MetaMask
echo "👛 Checking MetaMask installation..."
echo "⚠️  Please ensure MetaMask is installed as a browser extension"
echo "   Download from: https://metamask.io"
echo ""

# Compile contracts
echo "🔨 Compiling smart contracts..."
npm run compile
echo "✅ Contracts compiled"
echo ""

# Create .env if doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env created (update with your keys)"
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend/.env file..."
    echo "VITE_FLASH_TOKEN_ADDRESS=" > frontend/.env
    echo "✅ frontend/.env created"
fi

echo ""
echo "=============================="
echo "✅ Setup Complete!"
echo "=============================="
echo ""
echo "Next steps:"
echo "1. Start local network:    npm run dev:contracts"
echo "2. Deploy contract:        npm run deploy:ethereum"
echo "3. Start frontend:         npm run dev:frontend"
echo ""
echo "See QUICKSTART.md for detailed instructions"
