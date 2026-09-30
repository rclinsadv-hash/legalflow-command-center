<# Faz tudo em sequência e guarda o resultado num arquivo dentro do vault (Diário de Bordo), para o Claude ler. #>
param(
  [string]$Vault    = "G:\Meu Drive\Escritorio de Raphael Lins",
  [string]$Trabalho = "G:\Meu Drive\PROCESSOS DE RL ADVOCACIA"
)
$ErrorActionPreference = "Continue"
$log = Join-Path $env:TEMP ("verificacao-{0:yyyyMMdd-HHmmss}.txt" -f (Get-Date))
Start-Transcript -Path $log | Out-Null
$aqui = $PSScriptRoot

Write-Host "##### PASSO 1: instalar Python, bibliotecas, Obsidian e plugins #####"
& (Join-Path $aqui "instalar_ambiente.ps1") -Vault $Vault -Trabalho $Trabalho
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
  Write-Host "`nO Python acabou de ser instalado. FECHE esta janela e de dois cliques em RODAR_TUDO.bat de novo." -ForegroundColor Yellow
  Stop-Transcript | Out-Null; exit 0
}
Write-Host "`n##### PASSO 2: corrigir a nota do vault (cria copia de seguranca antes) #####"
python -X utf8 (Join-Path $aqui "corrigir_vault.py") (Join-Path $Vault "00 MAPA GERAL.md") --aplicar
Write-Host "`n##### PASSO 3: abrir o Obsidian ao ligar o computador #####"
& (Join-Path $aqui "instalar_inicializacao.ps1") -Vault $Vault
Write-Host "`n##### PASSO 4: verificacao final #####"
& (Join-Path $aqui "verificar_ambiente.ps1") -Vault $Vault -Clientes (Join-Path $Trabalho "CLIENTES NOVOS")

Stop-Transcript | Out-Null
$destino = Join-Path $Vault "Diário de Bordo"
if (Test-Path -LiteralPath $destino) {
  $copia = Join-Path $destino ("_verificacao-{0:yyyyMMdd-HHmmss}.txt" -f (Get-Date))
  Copy-Item -LiteralPath $log -Destination $copia
  Write-Host "`nResultado salvo em: $copia" -ForegroundColor Green
}
Write-Host "`nPRONTO. Volte ao Claude e escreva: pronto" -ForegroundColor Green
