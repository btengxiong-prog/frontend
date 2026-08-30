@echo off
chcp 65001 > nul
title Family Tree System
color 0a

echo กำลังเปิดระบบ Backend...
cd backend
start cmd /k "npm start"
cd..

echo กำลังเปิดระบบ Frontend (Vite)...
npm run dev
pause