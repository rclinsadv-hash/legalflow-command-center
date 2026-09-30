<#
  Cria um atalho na pasta Inicializar do Windows para abrir o Obsidian no vault ao ligar o computador.
  Uso:  powershell -ExecutionPolicy Bypass -File .\instalar_inicializacao.ps1 -Vault "G:\Meu Drive\Escritorio de Raphael Lins"
  Para desfazer: apague o atalho "Obsidian - Vault RL.lnk" da pasta que abre com  Win+R > shell:startup
#>
param([Parameter(Mandatory=$true)][string]$Vault)
$ErrorActionPreference = "Stop"
$script = Join-Path $PSScriptRoot "abrir_obsidian.ps1"
if (-not (Test-Path -LiteralPath $script)) { throw "Não achei $script" }
$atalho = Join-Path ([Environment]::GetFolderPath("Startup")) "Obsidian - Vault RL.lnk"
if (Test-Path -LiteralPath $atalho) { Write-Host "Já existe: $atalho (nada a fazer)"; exit 0 }
$sh = New-Object -ComObject WScript.Shell
$l = $sh.CreateShortcut($atalho)
$l.TargetPath = "powershell.exe"
$l.Arguments = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$script`" -Vault `"$Vault`""
$l.Save()
Write-Host "Atalho criado: $atalho"
