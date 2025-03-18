#!/bin/sh
set -e

# Wait for database to be ready
wait-for-it "${DB_HOST}:${DB_PORT}" -t 60

# Initialize database
echo "Initializing database..."
npm run init-db

# Start the scraping process
echo "Starting scraping process..."
exec node index.js 