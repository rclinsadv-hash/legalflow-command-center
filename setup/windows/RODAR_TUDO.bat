@echo off
chcp 65001 >nul
echo Este programa instala e confere o ambiente. Pode demorar alguns minutos.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0passos_da_instalacao.ps1"
echo.
pause
