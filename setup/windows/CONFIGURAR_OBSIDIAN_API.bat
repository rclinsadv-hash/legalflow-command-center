@echo off
chcp 65001 >nul
echo Este programa guarda a chave da API do Obsidian (sem mostrar) e testa a conexao.
echo Antes: deixe o Obsidian ABERTO no vault e o plugin Local REST API LIGADO.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0configurar_obsidian_api.ps1"
echo.
pause
