<#
  Backup de arquivos importantes. NUNCA apaga nada no destino (só copia o que é novo ou mais recente).
  Uso:  powershell -ExecutionPolicy Bypass -File .\backup.ps1 -Destino "E:\Backup RL"
        powershell -ExecutionPolicy Bypass -File .\backup.ps1 -Destino "E:\Backup RL" -Agendar     (cria tarefa semanal, domingo 20h)
  Origens padrão: o vault e a pasta CLIENTES NOVOS. Mude com -Origens.
  Recusa destino dentro do Google Drive (G:), porque isso não é backup, é a mesma nuvem.
  Destino no disco C: só com -ConfirmoDiscoInterno (ou se o caminho estiver no OneDrive).
#>
param(
  [Parameter(Mandatory=$true)][string]$Destino,
  [string[]]$Origens = @("G:\Meu Drive\Escritorio de Raphael Lins", "G:\Meu Drive\PROCESSOS DE RL ADVOCACIA\CLIENTES NOVOS"),
  [switch]$ConfirmoDiscoInterno,
  [switch]$Agendar
)
$ErrorActionPreference = "Stop"
if ($Destino -match '^[Gg]:') { throw "Destino no Google Drive (G:) não protege contra perda: escolha HD externo ou OneDrive." }
if ($Destino -match '^[Cc]:' -and $Destino -notlike "*OneDrive*" -and -not $ConfirmoDiscoInterno) {
  throw "Destino no disco interno (C:) não protege contra falha do disco. Use HD externo/OneDrive ou repita com -ConfirmoDiscoInterno."
}
if ($Agendar) {
  $cmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Destino `"$Destino`""
  schtasks /Create /TN "Backup RL Advocacia" /TR $cmd /SC WEEKLY /D SUN /ST 20:00 /F | Out-Null
  Write-Host "Tarefa 'Backup RL Advocacia' criada (domingo 20h). Para remover: schtasks /Delete /TN `"Backup RL Advocacia`" /F"
  exit 0
}
if (-not (Test-Path -LiteralPath $Destino)) { throw "Destino não encontrado: $Destino (HD conectado?)" }
$log = Join-Path $Destino ("backup-{0:yyyyMMdd-HHmmss}.log" -f (Get-Date))
foreach ($o in $Origens) {
  if (-not (Test-Path -LiteralPath $o)) { Write-Warning "Origem não encontrada, pulando: $o"; continue }
  $sub = Join-Path $Destino (Split-Path $o -Leaf)
  # /E copia subpastas; /XO não sobrescreve arquivo mais novo; SEM /MIR e SEM /PURGE: nada é apagado no destino.
  robocopy $o $sub /E /XO /R:2 /W:5 /FFT /NP /NDL /LOG+:$log | Out-Null
  if ($LASTEXITCODE -ge 8) { Write-Warning "robocopy terminou com erros em '$o' (código $LASTEXITCODE). Veja $log" } else { Write-Host "OK: $o -> $sub" }
}
Write-Host "Log: $log"
