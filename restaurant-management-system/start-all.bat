@echo off
title Restaurant POS - System Launcher
echo ======================================================
echo  Rustic Flame - Offline Restaurant Management System
echo ======================================================
echo Starting Server on port 5000...
start "Restaurant POS - Server" cmd /c "cd /d ""%~dp0server"" && npm run dev"
timeout /t 3 /nobreak >nul
echo Starting Client on port 5173...
start "Restaurant POS - Client" cmd /c "cd /d ""%~dp0client"" && npm run dev"
echo.
echo ======================================================
echo  System Started Successfully!
echo  Backend:  http://localhost:5000/api
echo  Frontend: http://localhost:5173
echo ======================================================
pause
