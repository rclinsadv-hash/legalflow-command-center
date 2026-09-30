<# Abre o Obsidian no vault certo. Espera o Google Drive (G:) montar antes de abrir (até 3 minutos). #>
param([Parameter(Mandatory=$true)][string]$Vault)
$limite = (Get-Date).AddMinutes(3)
while (-not (Test-Path -LiteralPath $Vault) -and (Get-Date) -lt $limite) { Start-Sleep -Seconds 5 }
if (-not (Test-Path -LiteralPath $Vault)) { exit 1 }   # Drive não montou: não abre um vault vazio
Start-Process ("obsidian://open?path=" + [uri]::EscapeDataString($Vault))
