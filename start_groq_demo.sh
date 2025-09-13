#!/bin/bash

# Zyra Groq AI Demo Startup Script
echo "🌱 Starting Zyra Agricultural Extension Platform with Groq AI"
echo "=============================================================="

# Check if .env file exists
if [ ! -f "api/.env" ]; then
    echo "⚠️  No .env file found. Creating template..."
    cat > api/.env << EOF
# Groq AI Configuration
GROQ_API_KEY=your_groq_api_key_here

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Logging
LOG_LEVEL=INFO
EOF
    echo "📝 Please edit api/.env and add your Groq API key"
    echo "   Get your API key from: https://console.groq.com"
    echo ""
    read -p "Press Enter after adding your API key..."
fi

# Check if Groq API key is set
if grep -q "your_groq_api_key_here" api/.env; then
    echo "❌ Please set your Groq API key in api/.env"
    echo "   Get your API key from: https://console.groq.com"
    exit 1
fi

echo "✅ Environment configured"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd api
pip install -r requirements.txt
cd ..

# Install Node dependencies
echo "📦 Installing Node dependencies..."
cd frontend
npm install
cd ..

# Test Groq integration
echo "🧪 Testing Groq AI integration..."
python test_groq_integration.py

if [ $? -eq 0 ]; then
    echo ""
    echo "🚀 Starting services..."
    echo ""
    
    # Start backend in background
    echo "Starting backend server..."
    cd api
    python app.py &
    BACKEND_PID=$!
    cd ..
    
    # Wait a moment for backend to start
    sleep 3
    
    # Start frontend
    echo "Starting frontend server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    echo ""
    echo "🎉 Zyra is now running with Groq AI!"
    echo ""
    echo "📍 Frontend: http://localhost:3000"
    echo "📍 Backend API: http://localhost:8000"
    echo "📍 API Docs: http://localhost:8000/docs"
    echo ""
    echo "✨ New Features:"
    echo "   • AI-powered incident analysis"
    echo "   • Real-time chat assistant"
    echo "   • Enhanced recommendations"
    echo "   • Faster processing with Groq AI"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for user to stop
    wait
else
    echo "❌ Groq integration test failed. Please check your configuration."
    exit 1
fi

