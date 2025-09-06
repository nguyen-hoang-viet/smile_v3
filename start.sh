#!/bin/bash

echo "Starting SMILE Restaurant Management System..."

echo ""
echo "Starting Backend (FastAPI)..."
cd backend && python main.py &

echo ""
echo "Waiting for backend to start..."
sleep 5

echo ""
echo "Starting Frontend (React)..."
cd ../frontend && npm start &

echo ""
echo "Both services are starting..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"

wait
