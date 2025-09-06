@echo off
echo Starting SMILE Restaurant Management System...

echo.
echo Starting Backend (FastAPI) with backend_env...
start cmd /k "conda activate backend_env && cd backend && python main.py"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend (React) with frontend_env...
start cmd /k "conda activate frontend_env && cd frontend && npm start"

echo.
echo Both services are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs

pause
