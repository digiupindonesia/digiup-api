#!/bin/bash

echo "🚀 Starting DigiUp-CreatorUp Integration..."

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis is not running. Please start Redis first:"
    echo "   sudo systemctl start redis-server"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first:"
    echo "   sudo systemctl start postgresql"
    exit 1
fi

# Check environment variables
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy from .env.example and configure:"
    echo "   cp .env.example .env"
    exit 1
fi

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "🎯 Starting DigiUp API with CreatorUp integration..."
npm run start

echo "✅ DigiUp-CreatorUp Integration started successfully!"
