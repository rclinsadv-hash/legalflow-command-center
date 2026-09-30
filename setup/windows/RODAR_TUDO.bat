@echo off
chcp 65001 >nul
echo Este programa instala e confere o ambiente. Pode demorar alguns minutos.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0rodar_tudo.ps1"
echo.
pause
