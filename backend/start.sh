#!/bin/bash
# Railway deployment startup script

echo "🚀 Starting OEM Analytics Backend..."
echo "📦 Environment Setup:"
echo "  - DATABASE_URL: ${DATABASE_URL:0:20}...***"
echo "  - SECRET_KEY: ${SECRET_KEY:0:10}...***"
echo ""

# Run Uvicorn
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
