# DSA Visualizer Setup Script

Write-Host "🚀 Setting up DSA Visualizer with Authentication & Database..." -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Initialize Prisma
Write-Host "🗄️ Setting up database..." -ForegroundColor Yellow
npx prisma generate
npx prisma db push

# Create .env file from .env.example if not exists
if (!(Test-Path .env)) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please update .env file with your database credentials and API keys" -ForegroundColor Red
}

Write-Host "✅ Setup completed!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env file with your database URL and API keys" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "3. Visit http://localhost:3000 to see your app" -ForegroundColor White
