#!/bin/bash

echo "🚀 Setting up DSA Visualizer with Authentication & Database..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Initialize Prisma
echo "🗄️ Setting up database..."
npx prisma generate
npx prisma db push

# Create .env file from .env.example if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your database credentials and API keys"
fi

echo "✅ Setup completed!"
echo "📋 Next steps:"
echo "1. Update .env file with your database URL and API keys"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000 to see your app"
