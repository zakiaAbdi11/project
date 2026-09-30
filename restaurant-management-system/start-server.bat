@echo off
title Restaurant POS - Server
echo ======================================================
echo  Rustic Flame - Offline Restaurant POS Server
echo  http://localhost:5000/api
echo ======================================================
cd /d "%~dp0server"
npm run dev
