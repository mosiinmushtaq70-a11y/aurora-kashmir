@echo off
echo Starting AuroraLens Development Servers...

:: Start the Python FastAPI Backend in a new terminal window from the root directory
start "AuroraLens Backend (FastAPI)" cmd /k "uvicorn api.main:app --reload --port 8000"

:: Start the Next.js Frontend in a new terminal window
start "AuroraLens Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

echo Both servers are booting up. 
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:3000
