#!/bin/sh

set -e

echo "Starting Disaster Recovery - NRPG application..."

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Start the application
echo "Starting application..."
exec npm start
